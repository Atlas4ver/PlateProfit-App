import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Calculator, Info } from 'lucide-react';
import { Dish, MenuCategory, RecipeIngredient, Unit, Ingredient } from '../../types/costing';
import { calculateIngredientCost, formatCurrency, formatNumber } from '../../utils/conversions';

interface DishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: Omit<Dish, 'id' | 'updatedAt'>) => void;
  initialData?: Dish | null;
  availableIngredients: Ingredient[];
}

const CATEGORIES: MenuCategory[] = [
  'Starters & Apps',
  'Mains & Steaks',
  'Pastas & Risottos',
  'Burgers & Sandwiches',
  'Desserts',
  'Beverages & Cocktails',
];

const RECIPE_UNITS: Unit[] = [
  'g',
  'kg',
  'oz',
  'lb',
  'ml',
  'l',
  'cup',
  'tbsp',
  'tsp',
  'fl_oz',
  'unit',
  'can',
  'bunch',
];

export const DishModal: React.FC<DishModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableIngredients,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Mains & Steaks');
  const [sellingPrice, setSellingPrice] = useState<number>(1200.0);
  const [targetFoodCostPercent, setTargetFoodCostPercent] = useState<number>(28);
  const [salesVolume, setSalesVolume] = useState<number>(50);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(15);
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setSellingPrice(initialData.sellingPrice);
      setTargetFoodCostPercent(initialData.targetFoodCostPercent || 28);
      setSalesVolume(initialData.salesVolume || 50);
      setPrepTimeMinutes(initialData.prepTimeMinutes || 15);
      setDescription(initialData.description || '');
      setIngredients(initialData.ingredients.map(ing => ({ ...ing })));
    } else {
      setName('');
      setCategory('Mains & Steaks');
      setSellingPrice(1250.0);
      setTargetFoodCostPercent(28);
      setSalesVolume(40);
      setPrepTimeMinutes(15);
      setDescription('');
      if (availableIngredients.length > 0) {
        setIngredients([
          {
            ingredientId: availableIngredients[0].id,
            quantity: availableIngredients[0].unit === 'g' || availableIngredients[0].unit === 'kg' ? 150 : 1,
            unit: availableIngredients[0].unit === 'kg' ? 'g' : availableIngredients[0].unit,
            notes: '',
          },
        ]);
      } else {
        setIngredients([]);
      }
    }
  }, [initialData, isOpen, availableIngredients]);

  // Live calculation of preview food cost
  const liveCost = useMemo(() => {
    let totalCost = 0;
    const ingMap = new Map<string, Ingredient>();
    availableIngredients.forEach(i => ingMap.set(i.id, i));

    ingredients.forEach(recipeIng => {
      const inv = ingMap.get(recipeIng.ingredientId);
      if (!inv) return;
      const { cost } = calculateIngredientCost(
        recipeIng.quantity,
        recipeIng.unit,
        inv.unit,
        inv.costPerUnit,
        inv.yieldPercent
      );
      totalCost += cost;
    });

    const price = sellingPrice > 0 ? sellingPrice : 0.01;
    const foodCostPercent = (totalCost / price) * 100;
    const contributionMargin = price - totalCost;
    const suggestedPrice = totalCost / ((targetFoodCostPercent || 28) / 100);

    return {
      totalCost,
      foodCostPercent,
      contributionMargin,
      suggestedPrice,
    };
  }, [ingredients, sellingPrice, targetFoodCostPercent, availableIngredients]);

  if (!isOpen) return null;

  const handleAddIngredientRow = () => {
    if (availableIngredients.length === 0) return;
    const firstIng = availableIngredients[0];
    setIngredients(prev => [
      ...prev,
      {
        ingredientId: firstIng.id,
        quantity: firstIng.unit === 'kg' ? 100 : 1,
        unit: firstIng.unit === 'kg' ? 'g' : firstIng.unit,
        notes: '',
      },
    ]);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateIngredientRow = (
    index: number,
    field: keyof RecipeIngredient,
    value: any
  ) => {
    setIngredients(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return { ...item, [field]: value };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      category,
      sellingPrice: Number(sellingPrice) || 0,
      targetFoodCostPercent: Number(targetFoodCostPercent) || 28,
      salesVolume: Number(salesVolume) || 0,
      prepTimeMinutes: Number(prepTimeMinutes) || 10,
      description: description.trim(),
      status: initialData ? initialData.status : 'Active',
      ingredients: ingredients.filter(i => i.quantity > 0),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-3xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {initialData ? 'Edit Recipe & Dish Cost' : 'Create New Menu Recipe'}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Specify ingredients, portion quantities, and menu pricing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Pan-Seared Chilean Sea Bass"
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as MenuCategory)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Menu Selling Price (₱) *
              </label>
              <input
                type="number"
                step="10"
                min="10"
                required
                value={sellingPrice}
                onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Target Food Cost %
              </label>
              <input
                type="number"
                step="1"
                min="10"
                max="60"
                value={targetFoodCostPercent}
                onChange={e => setTargetFoodCostPercent(parseInt(e.target.value) || 28)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Prep Time (min)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={prepTimeMinutes}
                onChange={e => setPrepTimeMinutes(parseInt(e.target.value) || 10)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Menu Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Culinary notes, allergens, presentation description..."
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Recipe Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Recipe Ingredients & Portions
                </h4>
                <p className="text-xs text-neutral-500">
                  Unit conversion & trim yields are factored in automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredientRow}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {ingredients.map((item, index) => {
                const inv = availableIngredients.find(i => i.id === item.ingredientId);
                const itemCost = inv
                  ? calculateIngredientCost(
                      item.quantity,
                      item.unit,
                      inv.unit,
                      inv.costPerUnit,
                      inv.yieldPercent
                    ).cost
                  : 0;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-700/60 text-[11px] sm:text-xs"
                  >
                    <div className="flex-1 min-w-[110px] sm:min-w-[140px]">
                      <select
                        value={item.ingredientId}
                        onChange={e => handleUpdateIngredientRow(index, 'ingredientId', e.target.value)}
                        className="w-full px-1.5 py-1 text-[11px] sm:text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded focus:outline-hidden text-neutral-900 dark:text-neutral-100"
                      >
                        {availableIngredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({formatCurrency(ing.costPerUnit)}/{ing.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-16 sm:w-20">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.quantity}
                        onChange={e =>
                          handleUpdateIngredientRow(index, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-1.5 py-1 text-[11px] sm:text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded font-mono text-neutral-900 dark:text-neutral-100 text-center"
                      />
                    </div>

                    <div className="w-16 sm:w-20">
                      <select
                        value={item.unit}
                        onChange={e => handleUpdateIngredientRow(index, 'unit', e.target.value as Unit)}
                        className="w-full px-1.5 py-1 text-[11px] sm:text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100"
                      >
                        {RECIPE_UNITS.map(u => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-18 sm:w-24 text-right font-mono font-medium text-neutral-700 dark:text-neutral-300 text-[11px] truncate">
                      {formatCurrency(itemCost)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredientRow(index)}
                      className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors shrink-0"
                      title="Remove ingredient"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {ingredients.length === 0 && (
                <div className="p-3 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-[11px] text-neutral-500">
                  No ingredients added yet. Click &quot;Add Ingredient&quot; above to build your recipe.
                </div>
              )}
            </div>
          </div>

          {/* Live Costing Bar Summary */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-400 mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Real-Time Economics Preview</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-[11px]">
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="text-neutral-500">Total Food Cost</div>
                <div className="text-xs sm:text-sm font-semibold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                  {formatCurrency(liveCost.totalCost)}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="text-neutral-500">Food Cost %</div>
                <div
                  className={`text-xs sm:text-sm font-semibold font-mono tracking-tight mt-0.5 ${
                    liveCost.foodCostPercent <= 28
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : liveCost.foodCostPercent <= 34
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatNumber(liveCost.foodCostPercent, 1)}%
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="text-neutral-500">Contribution Margin</div>
                <div className="text-xs sm:text-sm font-semibold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  {formatCurrency(liveCost.contributionMargin)}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="text-neutral-500">Target ({targetFoodCostPercent}%)</div>
                <div className="text-xs sm:text-sm font-semibold font-mono tracking-tight text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                  {formatCurrency(liveCost.suggestedPrice)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-lg transition-colors shadow-xs"
            >
              {initialData ? 'Save Changes' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
