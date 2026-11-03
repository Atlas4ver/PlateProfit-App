export type Unit =
  | 'kg'
  | 'g'
  | 'lb'
  | 'oz'
  | 'l'
  | 'ml'
  | 'cup'
  | 'tbsp'
  | 'tsp'
  | 'fl_oz'
  | 'unit'
  | 'can'
  | 'bunch';

export type IngredientCategory =
  | 'Meat & Poultry'
  | 'Seafood'
  | 'Dairy & Eggs'
  | 'Produce & Herbs'
  | 'Pantry & Dry Goods'
  | 'Oils & Condiments'
  | 'Bakery'
  | 'Beverages & Spirits';

export interface PriceHistoryEntry {
  date: string;
  previousCost: number;
  newCost: number;
  note?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  currentStock: number;
  unit: Unit;
  costPerUnit: number; // Cost in $ per standard unit
  minStockLevel: number; // Low-stock threshold
  yieldPercent: number; // Usable portion % (e.g. 85 for trimmed beef)
  supplier: string;
  lastPriceChange?: PriceHistoryEntry;
  updatedAt: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: Unit;
  notes?: string;
}

export type MenuCategory =
  | 'Starters & Apps'
  | 'Mains & Steaks'
  | 'Pastas & Risottos'
  | 'Burgers & Sandwiches'
  | 'Desserts'
  | 'Beverages & Cocktails';

export interface Dish {
  id: string;
  name: string;
  category: MenuCategory;
  sellingPrice: number;
  ingredients: RecipeIngredient[];
  salesVolume: number; // Recent units sold for menu engineering
  targetFoodCostPercent: number; // Target benchmark (e.g. 28%)
  description: string;
  prepTimeMinutes?: number;
  status: 'Active' | 'Draft' | 'Archived';
  updatedAt: string;
}

export interface DishCostBreakdown {
  dishId: string;
  dishName: string;
  category: MenuCategory;
  sellingPrice: number;
  totalFoodCost: number;
  contributionMargin: number;
  foodCostPercent: number;
  grossMarginPercent: number;
  suggestedPrice: number;
  portionsAvailable: number;
  limitingIngredient?: {
    name: string;
    stock: number;
    unit: Unit;
    maxPortions: number;
  };
  ingredientCosts: {
    ingredientId: string;
    name: string;
    recipeQty: number;
    recipeUnit: Unit;
    convertedQty: number;
    inventoryUnit: Unit;
    yieldPercent: number;
    effectiveCostPerInventoryUnit: number;
    cost: number;
    costPercentage: number;
  }[];
  matrixCategory: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog';
}

export interface InventoryLogEntry {
  id: string;
  date: string;
  type: 'purchase' | 'waste' | 'sale_depletion' | 'adjustment';
  ingredientId: string;
  ingredientName: string;
  quantityDelta: number; // positive for purchase, negative for waste/sales
  unit: Unit;
  costImpact?: number;
  reason?: string;
  reference?: string; // Order #, Invoice #
}

export interface ShiftSaleItem {
  dishId: string;
  quantity: number;
}
