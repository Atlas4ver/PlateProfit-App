import React, { useState } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Utensils,
  Sparkles,
  Edit2,
  Trash2,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useCosting } from '../context/CostingContext';
import { MenuCategory, Dish } from '../types/costing';
import { formatCurrency, formatNumber, formatUnit } from '../utils/conversions';
import { DishModal } from './modals/DishModal';

const MENU_CATEGORIES: ('All' | MenuCategory)[] = [
  'All',
  'Starters & Apps',
  'Mains & Steaks',
  'Pastas & Risottos',
  'Burgers & Sandwiches',
  'Desserts',
  'Beverages & Cocktails',
];

export const DishCostingView: React.FC = () => {
  const {
    dishes,
    ingredients,
    dishBreakdowns,
    recentCostChangedDishIds,
    simulationActive,
    addDish,
    updateDish,
    deleteDish,
  } = useCosting();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | MenuCategory>('All');
  const [sortBy, setSortBy] = useState<'margin' | 'costPercent' | 'sales' | 'name'>('margin');
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Quick price adjuster state
  const [inlinePriceEditId, setInlinePriceEditId] = useState<string | null>(null);
  const [inlinePriceVal, setInlinePriceVal] = useState<string>('');

  const filteredDishes = dishBreakdowns
    .filter(item => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.dishName.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'margin') return b.contributionMargin - a.contributionMargin;
      if (sortBy === 'costPercent') return b.foodCostPercent - a.foodCostPercent;
      if (sortBy === 'sales') {
        const dishA = dishes.find(d => d.id === a.dishId)?.salesVolume || 0;
        const dishB = dishes.find(d => d.id === b.dishId)?.salesVolume || 0;
        return dishB - dishA;
      }
      return a.dishName.localeCompare(b.dishName);
    });

  const handleOpenCreateModal = () => {
    setEditingDish(null);
    setIsDishModalOpen(true);
  };

  const handleOpenEditModal = (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    if (dish) {
      setEditingDish(dish);
      setIsDishModalOpen(true);
    }
  };

  const handleStartInlinePrice = (dishId: string, currentPrice: number) => {
    setInlinePriceEditId(dishId);
    setInlinePriceVal(currentPrice.toString());
  };

  const handleSaveInlinePrice = (dishId: string) => {
    const newPrice = parseFloat(inlinePriceVal);
    if (!isNaN(newPrice) && newPrice > 0) {
      updateDish(dishId, { sellingPrice: newPrice });
    }
    setInlinePriceEditId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Controls Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 sm:gap-2">
            <span>Dish Costing &amp; Profit Margins</span>
            {simulationActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Simulation Active
              </span>
            )}
          </h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Real-time plate costs, food cost percentages, and contribution margins recalculated continuously from inventory prices.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-lg transition-colors shadow-2xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Recipe</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-8 pr-2.5 py-1 text-[11px] sm:text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Category Buttons / Segmented Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {MENU_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
          <span className="text-neutral-400">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2 py-1 text-[11px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          >
            <option value="margin">Highest Margin (₱)</option>
            <option value="costPercent">Highest Food Cost %</option>
            <option value="sales">Sales Volume</option>
            <option value="name">Dish Name</option>
          </select>
        </div>
      </div>

      {/* Dishes List */}
      <div className="space-y-2.5 sm:space-y-3">
        {filteredDishes.map(dish => {
          const rawDish = dishes.find(d => d.id === dish.dishId);
          const isExpanded = expandedDishId === dish.dishId;
          const isHighlighted = recentCostChangedDishIds.has(dish.dishId);

          // Food cost status badge
          let costStatusColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          let costStatusLabel = 'Optimal (<28%)';
          if (dish.foodCostPercent > 34) {
            costStatusColor = 'text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20';
            costStatusLabel = 'High Cost (>34%)';
          } else if (dish.foodCostPercent > 28) {
            costStatusColor = 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
            costStatusLabel = 'Moderate (28-34%)';
          }

          const isStockLow = dish.portionsAvailable < 10;

          return (
            <div
              key={dish.dishId}
              className={`bg-white dark:bg-neutral-900 border rounded-xl overflow-hidden transition-all duration-300 shadow-2xs ${
                isHighlighted
                  ? 'border-amber-500 ring-2 ring-amber-500/30'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Dish Main Summary Row */}
              <div className="p-3 sm:p-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">
                      {dish.category}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">·</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${costStatusColor}`}>
                      {costStatusLabel}
                    </span>
                    {isHighlighted && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium animate-pulse flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Updated live
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 flex items-center gap-1.5 truncate">
                    <span className="truncate">{dish.dishName}</span>
                    {rawDish?.prepTimeMinutes && (
                      <span className="text-[10px] font-normal text-neutral-400 flex items-center gap-0.5 shrink-0">
                        <Clock className="w-2.5 h-2.5" /> {rawDish.prepTimeMinutes}m
                      </span>
                    )}
                  </h3>

                  {rawDish?.description && (
                    <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                      {rawDish.description}
                    </p>
                  )}
                </div>

                {/* Symmetrical Responsive Metrics Grid: 2x2 on Mobile, 4x1 on Tablet/Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full xl:w-auto shrink-0">
                  {/* Menu Selling Price */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col justify-between">
                    <div className="text-[10px] text-neutral-500 flex items-center justify-between">
                      <span>Menu Price</span>
                      {inlinePriceEditId !== dish.dishId && (
                        <button
                          onClick={() => handleStartInlinePrice(dish.dishId, dish.sellingPrice)}
                          className="text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400"
                          title="Quick edit price"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                    {inlinePriceEditId === dish.dishId ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          step="10"
                          value={inlinePriceVal}
                          onChange={e => setInlinePriceVal(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveInlinePrice(dish.dishId);
                            if (e.key === 'Escape') setInlinePriceEditId(null);
                          }}
                          className="w-16 px-1 py-0.5 text-[11px] bg-white dark:bg-neutral-900 border border-amber-500 rounded font-mono text-neutral-900 dark:text-neutral-100"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveInlinePrice(dish.dishId)}
                          className="text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                        {formatCurrency(dish.sellingPrice)}
                      </div>
                    )}
                  </div>

                  {/* Food Cost */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col justify-between">
                    <div className="text-[10px] text-neutral-500 truncate">Food Cost</div>
                    <div className="text-xs sm:text-sm font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                      {formatCurrency(dish.totalFoodCost)}
                    </div>
                  </div>

                  {/* Food Cost % */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col justify-between">
                    <div className="text-[10px] text-neutral-500 truncate">Food Cost %</div>
                    <div
                      className={`text-xs sm:text-sm font-bold font-mono tracking-tight mt-0.5 truncate ${
                        dish.foodCostPercent <= 28
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : dish.foodCostPercent <= 34
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatNumber(dish.foodCostPercent, 1)}%
                    </div>
                  </div>

                  {/* Contribution Margin */}
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col justify-between">
                    <div className="text-[10px] text-neutral-500 truncate">Gross Margin (₱)</div>
                    <div className="text-xs sm:text-sm font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                      {formatCurrency(dish.contributionMargin)}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-1.5 justify-between xl:justify-end shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <div className="text-left xl:text-right">
                    <span className="text-[10px] text-neutral-400 block sm:inline xl:block">Stock available: </span>
                    <span
                      className={`text-[11px] font-mono font-medium ${
                        isStockLow ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {dish.portionsAvailable} portions
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(dish.dishId)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Edit Recipe"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${dish.dishName}?`)) {
                          deleteDish(dish.dishId);
                        }
                      }}
                      className="p-1.5 text-neutral-400 hover:text-red-500 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Delete Recipe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setExpandedDishId(isExpanded ? null : dish.dishId)}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                    >
                      <span>Recipe ({dish.ingredientCosts.length})</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Recipe Breakdown Drawer */}
              {isExpanded && (
                <div className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-3 sm:p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Ingredients Breakdown Table */}
                    <div className="lg:col-span-2 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[10px]">
                          Recipe Cost Breakdown
                        </h4>
                        <span className="text-[10px] text-neutral-400">
                          Trim yields factored in
                        </span>
                      </div>

                      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto bg-white dark:bg-neutral-900">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800 text-[10px]">
                            <tr>
                              <th className="py-2 px-2.5">Ingredient</th>
                              <th className="py-2 px-2">Portion</th>
                              <th className="py-2 px-2">Yield</th>
                              <th className="py-2 px-2 text-right">Inv Price</th>
                              <th className="py-2 px-2.5 text-right">Plate Cost</th>
                              <th className="py-2 px-2 text-right">% Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono">
                            {dish.ingredientCosts.map((ing, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                                <td className="py-1.5 px-2.5 font-sans font-medium text-neutral-900 dark:text-neutral-100">
                                  {ing.name}
                                </td>
                                <td className="py-1.5 px-2 text-neutral-600 dark:text-neutral-400">
                                  {ing.recipeQty} {formatUnit(ing.recipeUnit, ing.recipeQty)}
                                </td>
                                <td className="py-1.5 px-2 text-neutral-600 dark:text-neutral-400">
                                  {ing.yieldPercent}%
                                </td>
                                <td className="py-1.5 px-2 text-right text-neutral-600 dark:text-neutral-400">
                                  {formatCurrency(ing.effectiveCostPerInventoryUnit)}/{ing.inventoryUnit}
                                </td>
                                <td className="py-1.5 px-2.5 text-right font-semibold text-neutral-900 dark:text-neutral-100">
                                  {formatCurrency(ing.cost)}
                                </td>
                                <td className="py-1.5 px-2 text-right text-neutral-400">
                                  {formatNumber(ing.costPercentage, 1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Stock Bottleneck & Target Pricing Assistant */}
                    <div className="space-y-3">
                      {/* Bottleneck Warning */}
                      <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        <div className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-amber-500" />
                          <span>Portion Availability</span>
                        </div>

                        <div className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                          {dish.portionsAvailable} orders possible
                        </div>

                        {dish.limitingIngredient && (
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            Limiting: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{dish.limitingIngredient.name}</span> ({dish.limitingIngredient.stock} {dish.limitingIngredient.unit}).
                          </p>
                        )}
                      </div>

                      {/* Pricing Target Engine */}
                      <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg space-y-1.5 text-[11px]">
                        <div className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Pricing Target Engine</span>
                        </div>

                        <div className="space-y-1 font-mono text-[10px] sm:text-[11px]">
                          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                            <span>To hit 25% cost:</span>
                            <span className="font-bold text-neutral-900 dark:text-neutral-100">
                              {formatCurrency(dish.totalFoodCost / 0.25)}
                            </span>
                          </div>
                          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                            <span>To hit 28% cost:</span>
                            <span className="font-bold text-neutral-900 dark:text-neutral-100">
                              {formatCurrency(dish.totalFoodCost / 0.28)}
                            </span>
                          </div>
                          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                            <span>To hit 30% cost:</span>
                            <span className="font-bold text-neutral-900 dark:text-neutral-100">
                              {formatCurrency(dish.totalFoodCost / 0.30)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const newPrice = Math.round(dish.totalFoodCost / 0.28);
                            updateDish(dish.dishId, { sellingPrice: newPrice });
                          }}
                          className="w-full mt-2 py-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 rounded-md transition-colors text-center"
                        >
                          Apply 28% Target ({formatCurrency(dish.totalFoodCost / 0.28)})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredDishes.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <Utensils className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              No recipes matched your search
            </h4>
            <p className="text-[11px] text-neutral-500 mt-0.5 max-w-sm mx-auto">
              Adjust your category filter or search terms, or click &quot;New Recipe&quot;.
            </p>
          </div>
        )}
      </div>

      {/* Dish Modal */}
      <DishModal
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        onSave={dishData => {
          if (editingDish) {
            updateDish(editingDish.id, dishData);
          } else {
            addDish(dishData);
          }
        }}
        initialData={editingDish}
        availableIngredients={ingredients}
      />
    </div>
  );
};
