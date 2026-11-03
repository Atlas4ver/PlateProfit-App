import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Ingredient,
  Dish,
  DishCostBreakdown,
  InventoryLogEntry,
  Unit,
  IngredientCategory,
  MenuCategory,
} from '../types/costing';
import { INITIAL_INGREDIENTS, INITIAL_DISHES, INITIAL_LOGS } from '../data/mockData';
import { calculateIngredientCost, convertUnitQuantity } from '../utils/conversions';

interface SimulationOverride {
  [ingredientId: string]: number; // simulated costPerUnit
}

interface CostingContextType {
  ingredients: Ingredient[];
  dishes: Dish[];
  logs: InventoryLogEntry[];
  simulationActive: boolean;
  simulationOverrides: SimulationOverride;
  recentCostChangedDishIds: Set<string>;
  
  // Real-time calculations
  dishBreakdowns: DishCostBreakdown[];
  overallMetrics: {
    averageFoodCostPercent: number;
    totalInventoryValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    highCostDishesCount: number;
    totalActiveDishes: number;
  };

  // Actions - Ingredients
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'updatedAt'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  updateIngredientPrice: (id: string, newPrice: number, note?: string) => void;
  receiveStock: (id: string, quantity: number, unitCost?: number, supplier?: string, invoice?: string) => void;
  logWaste: (id: string, quantity: number, reason: string) => void;
  adjustStock: (id: string, newStock: number, reason: string) => void;

  // Actions - Dishes
  addDish: (dish: Omit<Dish, 'id' | 'updatedAt'>) => void;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  deleteDish: (id: string) => void;

  // Actions - Orders & Sales
  recordSale: (sales: { dishId: string; quantity: number }[], orderRef?: string) => { success: boolean; warnings: string[] };

  // Actions - Simulation
  toggleSimulation: (active?: boolean) => void;
  setSimulatedIngredientPrice: (ingredientId: string, price: number) => void;
  applyCategoryPriceShock: (category: IngredientCategory, percentageDelta: number) => void;
  clearSimulation: () => void;
  commitSimulationToLive: () => void;

  // Utilities
  resetToDefaultData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
}

const STORAGE_KEY_INGREDIENTS = 'mep_costing_ingredients_v2_php';
const STORAGE_KEY_DISHES = 'mep_costing_dishes_v2_php';
const STORAGE_KEY_LOGS = 'mep_costing_logs_v2_php';

const CostingContext = createContext<CostingContextType | null>(null);

export const CostingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INGREDIENTS);
      return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
    } catch {
      return INITIAL_INGREDIENTS;
    }
  });

  const [dishes, setDishes] = useState<Dish[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISHES);
      return saved ? JSON.parse(saved) : INITIAL_DISHES;
    } catch {
      return INITIAL_DISHES;
    }
  });

  const [logs, setLogs] = useState<InventoryLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [simulationOverrides, setSimulationOverrides] = useState<SimulationOverride>({});
  const [recentCostChangedDishIds, setRecentCostChangedDishIds] = useState<Set<string>>(new Set());

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INGREDIENTS, JSON.stringify(ingredients));
    } catch (e) {
      console.error('Failed to save ingredients', e);
    }
  }, [ingredients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(dishes));
    } catch (e) {
      console.error('Failed to save dishes', e);
    }
  }, [dishes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save logs', e);
    }
  }, [logs]);

  // Flash highlight on affected dishes when ingredient cost updates
  const triggerDishHighlight = (ingredientId: string) => {
    const affectedDishes = dishes.filter(d =>
      d.ingredients.some(ing => ing.ingredientId === ingredientId)
    );
    const ids = new Set(affectedDishes.map(d => d.id));
    setRecentCostChangedDishIds(ids);

    setTimeout(() => {
      setRecentCostChangedDishIds(new Set());
    }, 3500);
  };

  // Map of ingredients for fast lookup, with simulation overrides if active
  const effectiveIngredientsMap = useMemo(() => {
    const map = new Map<string, Ingredient>();
    ingredients.forEach(ing => {
      const simulatedCost = simulationActive && simulationOverrides[ing.id] !== undefined
        ? simulationOverrides[ing.id]
        : ing.costPerUnit;
      map.set(ing.id, {
        ...ing,
        costPerUnit: Math.max(0, simulatedCost),
      });
    });
    return map;
  }, [ingredients, simulationActive, simulationOverrides]);

  // Real-time calculation of dish costs, margins, and portions available
  const dishBreakdowns = useMemo(() => {
    // Calculate average contribution margin and average sales volume for menu matrix
    let totalMarginSum = 0;
    let totalSalesSum = 0;

    const preliminary = dishes.map(dish => {
      let dishFoodCost = 0;
      let minPortions = Infinity;
      let limitingIng: DishCostBreakdown['limitingIngredient'] = undefined;

      const ingredientCosts = dish.ingredients.map(recipeIng => {
        const inventoryItem = effectiveIngredientsMap.get(recipeIng.ingredientId);
        if (!inventoryItem) {
          return {
            ingredientId: recipeIng.ingredientId,
            name: 'Unknown Ingredient (Deleted)',
            recipeQty: recipeIng.quantity,
            recipeUnit: recipeIng.unit,
            convertedQty: 0,
            inventoryUnit: 'unit' as Unit,
            yieldPercent: 100,
            effectiveCostPerInventoryUnit: 0,
            cost: 0,
            costPercentage: 0,
          };
        }

        const { cost, asPurchasedQtyInInventoryUnit } = calculateIngredientCost(
          recipeIng.quantity,
          recipeIng.unit,
          inventoryItem.unit,
          inventoryItem.costPerUnit,
          inventoryItem.yieldPercent
        );

        dishFoodCost += cost;

        // Calculate how many portions this ingredient stock allows
        if (asPurchasedQtyInInventoryUnit > 0) {
          const portionsThisIng = Math.floor(inventoryItem.currentStock / asPurchasedQtyInInventoryUnit);
          if (portionsThisIng < minPortions) {
            minPortions = portionsThisIng;
            limitingIng = {
              name: inventoryItem.name,
              stock: inventoryItem.currentStock,
              unit: inventoryItem.unit,
              maxPortions: Math.max(0, portionsThisIng),
            };
          }
        }

        return {
          ingredientId: inventoryItem.id,
          name: inventoryItem.name,
          recipeQty: recipeIng.quantity,
          recipeUnit: recipeIng.unit,
          convertedQty: asPurchasedQtyInInventoryUnit,
          inventoryUnit: inventoryItem.unit,
          yieldPercent: inventoryItem.yieldPercent,
          effectiveCostPerInventoryUnit: inventoryItem.costPerUnit,
          cost,
          costPercentage: 0, // will compute below
        };
      });

      // Calculate cost percentage for each ingredient
      ingredientCosts.forEach(item => {
        item.costPercentage = dishFoodCost > 0 ? (item.cost / dishFoodCost) * 100 : 0;
      });

      const sellingPrice = dish.sellingPrice > 0 ? dish.sellingPrice : 0.01;
      const contributionMargin = sellingPrice - dishFoodCost;
      const foodCostPercent = (dishFoodCost / sellingPrice) * 100;
      const grossMarginPercent = ((sellingPrice - dishFoodCost) / sellingPrice) * 100;
      const targetPercent = dish.targetFoodCostPercent > 0 ? dish.targetFoodCostPercent : 28;
      const suggestedPrice = dishFoodCost / (targetPercent / 100);

      totalMarginSum += contributionMargin;
      totalSalesSum += dish.salesVolume;

      return {
        dishId: dish.id,
        dishName: dish.name,
        category: dish.category,
        sellingPrice: dish.sellingPrice,
        totalFoodCost: dishFoodCost,
        contributionMargin,
        foodCostPercent,
        grossMarginPercent,
        suggestedPrice,
        portionsAvailable: minPortions === Infinity ? 0 : Math.max(0, minPortions),
        limitingIngredient: limitingIng,
        ingredientCosts,
      };
    });

    const avgMargin = dishes.length > 0 ? totalMarginSum / dishes.length : 0;
    const avgSales = dishes.length > 0 ? totalSalesSum / dishes.length : 0;

    // Assign Menu Matrix categories (Stars, Plowhorses, Puzzles, Dogs)
    return preliminary.map(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      const sales = dish ? dish.salesVolume : 0;
      const isHighMargin = item.contributionMargin >= avgMargin;
      const isHighSales = sales >= avgSales;

      let matrixCategory: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog';
      if (isHighMargin && isHighSales) matrixCategory = 'Star';
      else if (!isHighMargin && isHighSales) matrixCategory = 'Plowhorse';
      else if (isHighMargin && !isHighSales) matrixCategory = 'Puzzle';
      else matrixCategory = 'Dog';

      return {
        ...item,
        matrixCategory,
      };
    });
  }, [dishes, effectiveIngredientsMap]);

  // Overall restaurant metrics
  const overallMetrics = useMemo(() => {
    let totalFoodCostPercentSum = 0;
    let highCostDishesCount = 0;

    dishBreakdowns.forEach(item => {
      totalFoodCostPercentSum += item.foodCostPercent;
      if (item.foodCostPercent > 34) highCostDishesCount++;
    });

    const averageFoodCostPercent =
      dishBreakdowns.length > 0 ? totalFoodCostPercentSum / dishBreakdowns.length : 0;

    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    ingredients.forEach(ing => {
      totalInventoryValue += ing.currentStock * ing.costPerUnit;
      if (ing.currentStock <= 0) outOfStockCount++;
      else if (ing.currentStock <= ing.minStockLevel) lowStockCount++;
    });

    return {
      averageFoodCostPercent,
      totalInventoryValue,
      lowStockCount,
      outOfStockCount,
      highCostDishesCount,
      totalActiveDishes: dishes.filter(d => d.status === 'Active').length,
    };
  }, [dishBreakdowns, ingredients, dishes]);

  // INGREDIENT ACTIONS
  const addIngredient = (data: Omit<Ingredient, 'id' | 'updatedAt'>) => {
    const newIngredient: Ingredient = {
      ...data,
      id: `ing-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setIngredients(prev => [newIngredient, ...prev]);

    // Log the addition
    const logEntry: InventoryLogEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'purchase',
      ingredientId: newIngredient.id,
      ingredientName: newIngredient.name,
      quantityDelta: newIngredient.currentStock,
      unit: newIngredient.unit,
      costImpact: newIngredient.currentStock * newIngredient.costPerUnit,
      reference: 'Initial Stock Onboard',
    };
    setLogs(prev => [logEntry, ...prev]);
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev =>
      prev.map(ing => {
        if (ing.id !== id) return ing;
        if (updates.costPerUnit !== undefined && updates.costPerUnit !== ing.costPerUnit) {
          triggerDishHighlight(id);
        }
        return {
          ...ing,
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const updateIngredientPrice = (id: string, newPrice: number, note?: string) => {
    setIngredients(prev =>
      prev.map(ing => {
        if (ing.id !== id) return ing;
        const prevCost = ing.costPerUnit;
        triggerDishHighlight(id);
        return {
          ...ing,
          costPerUnit: Math.max(0, newPrice),
          lastPriceChange: {
            date: new Date().toISOString().split('T')[0],
            previousCost: prevCost,
            newCost: newPrice,
            note: note || 'Supplier price adjustment',
          },
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const receiveStock = (
    id: string,
    quantity: number,
    unitCost?: number,
    supplier?: string,
    invoice?: string
  ) => {
    const target = ingredients.find(ing => ing.id === id);
    if (!target) return;

    const effectiveCost = unitCost !== undefined && unitCost > 0 ? unitCost : target.costPerUnit;
    const costChanged = effectiveCost !== target.costPerUnit;

    setIngredients(prev =>
      prev.map(ing => {
        if (ing.id !== id) return ing;
        const updated = {
          ...ing,
          currentStock: Math.max(0, ing.currentStock + quantity),
          costPerUnit: effectiveCost,
          supplier: supplier || ing.supplier,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        if (costChanged) {
          updated.lastPriceChange = {
            date: new Date().toISOString().split('T')[0],
            previousCost: ing.costPerUnit,
            newCost: effectiveCost,
            note: `Received invoice: ${invoice || 'Stock PO'}`,
          };
        }
        return updated;
      })
    );

    if (costChanged) {
      triggerDishHighlight(id);
    }

    const logEntry: InventoryLogEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'purchase',
      ingredientId: id,
      ingredientName: target.name,
      quantityDelta: quantity,
      unit: target.unit,
      costImpact: quantity * effectiveCost,
      reference: invoice ? `Invoice #${invoice}` : 'Stock PO Receive',
    };
    setLogs(prev => [logEntry, ...prev]);
  };

  const logWaste = (id: string, quantity: number, reason: string) => {
    const target = ingredients.find(ing => ing.id === id);
    if (!target) return;

    const actualQty = Math.min(target.currentStock, quantity);

    setIngredients(prev =>
      prev.map(ing => (ing.id === id ? { ...ing, currentStock: Math.max(0, ing.currentStock - actualQty) } : ing))
    );

    const logEntry: InventoryLogEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'waste',
      ingredientId: id,
      ingredientName: target.name,
      quantityDelta: -actualQty,
      unit: target.unit,
      costImpact: -(actualQty * target.costPerUnit),
      reason,
      reference: 'Kitchen Waste Log',
    };
    setLogs(prev => [logEntry, ...prev]);
  };

  const adjustStock = (id: string, newStock: number, reason: string) => {
    const target = ingredients.find(ing => ing.id === id);
    if (!target) return;

    const delta = newStock - target.currentStock;
    setIngredients(prev =>
      prev.map(ing => (ing.id === id ? { ...ing, currentStock: Math.max(0, newStock) } : ing))
    );

    const logEntry: InventoryLogEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'adjustment',
      ingredientId: id,
      ingredientName: target.name,
      quantityDelta: delta,
      unit: target.unit,
      costImpact: delta * target.costPerUnit,
      reason,
      reference: 'Physical Stock Count',
    };
    setLogs(prev => [logEntry, ...prev]);
  };

  // DISH ACTIONS
  const addDish = (data: Omit<Dish, 'id' | 'updatedAt'>) => {
    const newDish: Dish = {
      ...data,
      id: `dish-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDishes(prev => [newDish, ...prev]);
  };

  const updateDish = (id: string, updates: Partial<Dish>) => {
    setDishes(prev =>
      prev.map(dish =>
        dish.id === id
          ? {
              ...dish,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : dish
      )
    );
  };

  const deleteDish = (id: string) => {
    setDishes(prev => prev.filter(dish => dish.id !== id));
  };

  // ORDER / SALES SIMULATION WITH REAL-TIME INVENTORY DEPLETION
  const recordSale = (
    sales: { dishId: string; quantity: number }[],
    orderRef: string = 'Service Sales Shift'
  ): { success: boolean; warnings: string[] } => {
    const warnings: string[] = [];
    const depletions: { [ingredientId: string]: number } = {};

    // 1. Calculate required inventory depletions
    sales.forEach(({ dishId, quantity }) => {
      const dish = dishes.find(d => d.id === dishId);
      if (!dish || quantity <= 0) return;

      dish.ingredients.forEach(recipeIng => {
        const inventoryItem = ingredients.find(i => i.id === recipeIng.ingredientId);
        if (!inventoryItem) return;

        const { asPurchasedQtyInInventoryUnit } = calculateIngredientCost(
          recipeIng.quantity,
          recipeIng.unit,
          inventoryItem.unit,
          inventoryItem.costPerUnit,
          inventoryItem.yieldPercent
        );

        const totalNeeded = asPurchasedQtyInInventoryUnit * quantity;
        depletions[inventoryItem.id] = (depletions[inventoryItem.id] || 0) + totalNeeded;
      });
    });

    // 2. Check for stock shortages
    Object.entries(depletions).forEach(([ingId, neededQty]) => {
      const ing = ingredients.find(i => i.id === ingId);
      if (ing && ing.currentStock < neededQty) {
        warnings.push(
          `Shortage warning: ${ing.name} has only ${ing.currentStock.toFixed(2)} ${ing.unit} on hand (needed ${neededQty.toFixed(2)} ${ing.unit}). Stock depleted into negative.`
        );
      }
    });

    // 3. Deduct stock from inventory
    const newLogs: InventoryLogEntry[] = [];
    setIngredients(prev =>
      prev.map(ing => {
        const deducted = depletions[ing.id];
        if (deducted !== undefined && deducted > 0) {
          newLogs.push({
            id: `log-${Date.now()}-${ing.id}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            type: 'sale_depletion',
            ingredientId: ing.id,
            ingredientName: ing.name,
            quantityDelta: -deducted,
            unit: ing.unit,
            costImpact: -(deducted * ing.costPerUnit),
            reference: orderRef,
          });
          return {
            ...ing,
            currentStock: Math.max(0, ing.currentStock - deducted),
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return ing;
      })
    );

    // 4. Update dish sales volumes
    setDishes(prev =>
      prev.map(dish => {
        const match = sales.find(s => s.dishId === dish.id);
        if (match && match.quantity > 0) {
          return {
            ...dish,
            salesVolume: dish.salesVolume + match.quantity,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return dish;
      })
    );

    if (newLogs.length > 0) {
      setLogs(prev => [...newLogs, ...prev]);
    }

    return { success: true, warnings };
  };

  // SIMULATION ACTIONS
  const toggleSimulation = (active?: boolean) => {
    setSimulationActive(prev => (active !== undefined ? active : !prev));
  };

  const setSimulatedIngredientPrice = (ingredientId: string, price: number) => {
    setSimulationOverrides(prev => ({
      ...prev,
      [ingredientId]: Math.max(0, price),
    }));
  };

  const applyCategoryPriceShock = (category: IngredientCategory, percentageDelta: number) => {
    const factor = 1 + percentageDelta / 100;
    const updates: SimulationOverride = { ...simulationOverrides };

    ingredients
      .filter(ing => ing.category === category)
      .forEach(ing => {
        updates[ing.id] = Number((ing.costPerUnit * factor).toFixed(3));
      });

    setSimulationOverrides(updates);
    if (!simulationActive) setSimulationActive(true);
  };

  const clearSimulation = () => {
    setSimulationOverrides({});
    setSimulationActive(false);
  };

  const commitSimulationToLive = () => {
    setIngredients(prev =>
      prev.map(ing => {
        const simulated = simulationOverrides[ing.id];
        if (simulated !== undefined && simulated !== ing.costPerUnit) {
          triggerDishHighlight(ing.id);
          return {
            ...ing,
            costPerUnit: simulated,
            lastPriceChange: {
              date: new Date().toISOString().split('T')[0],
              previousCost: ing.costPerUnit,
              newCost: simulated,
              note: 'Committed from What-If Price Simulation',
            },
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return ing;
      })
    );
    clearSimulation();
  };

  // BACKUP & UTILITIES
  const resetToDefaultData = () => {
    setIngredients(INITIAL_INGREDIENTS);
    setDishes(INITIAL_DISHES);
    setLogs(INITIAL_LOGS);
    clearSimulation();
    localStorage.removeItem(STORAGE_KEY_INGREDIENTS);
    localStorage.removeItem(STORAGE_KEY_DISHES);
    localStorage.removeItem(STORAGE_KEY_LOGS);
  };

  const exportDataJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      ingredients,
      dishes,
      logs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mise-en-place-costing-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.ingredients) && Array.isArray(data.dishes)) {
        setIngredients(data.ingredients);
        setDishes(data.dishes);
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  return (
    <CostingContext.Provider
      value={{
        ingredients,
        dishes,
        logs,
        simulationActive,
        simulationOverrides,
        recentCostChangedDishIds,
        dishBreakdowns,
        overallMetrics,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        updateIngredientPrice,
        receiveStock,
        logWaste,
        adjustStock,
        addDish,
        updateDish,
        deleteDish,
        recordSale,
        toggleSimulation,
        setSimulatedIngredientPrice,
        applyCategoryPriceShock,
        clearSimulation,
        commitSimulationToLive,
        resetToDefaultData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </CostingContext.Provider>
  );
};

export const useCosting = () => {
  const context = useContext(CostingContext);
  if (!context) {
    throw new Error('useCosting must be used within a CostingProvider');
  }
  return context;
};
