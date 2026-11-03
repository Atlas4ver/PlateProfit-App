import React, { useState } from 'react';
import {
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Flame,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useCosting } from '../context/CostingContext';
import { calculateIngredientCost, formatCurrency, formatNumber, formatUnit } from '../utils/conversions';

export const OrderDepletionView: React.FC = () => {
  const { dishes, ingredients, dishBreakdowns, recordSale } = useCosting();

  const [quantities, setQuantities] = useState<{ [dishId: string]: number }>({});
  const [shiftName, setShiftName] = useState('Dinner Service Peak');
  const [lastSaleResult, setLastSaleResult] = useState<{
    revenue: number;
    cost: number;
    margin: number;
    warnings: string[];
  } | null>(null);

  // Compute live cart / shift metrics
  let totalRevenue = 0;
  let totalCost = 0;
  let totalDishesCount = 0;

  // Track required ingredients
  const requiredIngredients: {
    [ingId: string]: {
      name: string;
      needed: number;
      available: number;
      unit: string;
      shortage: boolean;
    };
  } = {};

  dishBreakdowns.forEach(dishItem => {
    const qty = quantities[dishItem.dishId] || 0;
    if (qty > 0) {
      totalDishesCount += qty;
      totalRevenue += dishItem.sellingPrice * qty;
      totalCost += dishItem.totalFoodCost * qty;

      dishItem.ingredientCosts.forEach(ic => {
        const inv = ingredients.find(i => i.id === ic.ingredientId);
        if (!inv) return;

        const neededForShift = ic.convertedQty * qty;
        if (!requiredIngredients[inv.id]) {
          requiredIngredients[inv.id] = {
            name: inv.name,
            needed: 0,
            available: inv.currentStock,
            unit: inv.unit,
            shortage: false,
          };
        }
        requiredIngredients[inv.id].needed += neededForShift;
        if (requiredIngredients[inv.id].needed > inv.currentStock) {
          requiredIngredients[inv.id].shortage = true;
        }
      });
    }
  });

  const totalMargin = totalRevenue - totalCost;
  const foodCostPct = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;
  const hasShortages = Object.values(requiredIngredients).some(i => i.shortage);

  const handleQtyChange = (dishId: string, val: number) => {
    setQuantities(prev => ({
      ...prev,
      [dishId]: Math.max(0, val),
    }));
  };

  const handleProcessSale = () => {
    const sales = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([dishId, quantity]) => ({ dishId, quantity }));

    if (sales.length === 0) return;

    const result = recordSale(sales, `Service Shift: ${shiftName}`);
    if (result.success) {
      setLastSaleResult({
        revenue: totalRevenue,
        cost: totalCost,
        margin: totalMargin,
        warnings: result.warnings,
      });
      setQuantities({});
    }
  };

  const handleQuickPreset = (type: 'busyDinner' | 'casualLunch') => {
    const newQty: { [dishId: string]: number } = {};
    if (type === 'busyDinner') {
      setShiftName('Saturday Evening Rush (Full House)');
      dishes.forEach((d, idx) => {
        if (d.category === 'Mains & Steaks') newQty[d.id] = 12 + idx * 2;
        else if (d.category === 'Burgers & Sandwiches') newQty[d.id] = 15;
        else if (d.category === 'Pastas & Risottos') newQty[d.id] = 10;
        else if (d.category === 'Beverages & Cocktails') newQty[d.id] = 20;
        else newQty[d.id] = 8;
      });
    } else {
      setShiftName('Weekday Bistro Lunch');
      dishes.forEach(d => {
        if (d.category === 'Burgers & Sandwiches') newQty[d.id] = 14;
        else if (d.category === 'Pastas & Risottos') newQty[d.id] = 8;
        else newQty[d.id] = 3;
      });
    }
    setQuantities(newQty);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <span>Shift Sales &amp; Inventory Depletion Engine</span>
          </h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Simulate service orders. Submitting immediately deducts exact recipe portion quantities from real-time stock levels.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => handleQuickPreset('casualLunch')}
            className="px-2.5 py-1 text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
          >
            Lunch Preset
          </button>
          <button
            onClick={() => handleQuickPreset('busyDinner')}
            className="px-2.5 py-1 text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
          >
            Dinner Preset
          </button>
        </div>
      </div>

      {/* Success banner after processing */}
      {lastSaleResult && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start justify-between gap-3 text-[11px]">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200">
                Shift Sales Successfully Logged &amp; Depleted!
              </div>
              <div className="text-neutral-600 dark:text-neutral-300 mt-0.5 font-mono flex items-center gap-2 flex-wrap">
                <span>Revenue: {formatCurrency(lastSaleResult.revenue)}</span>
                <span>·</span>
                <span>Food Cost: {formatCurrency(lastSaleResult.cost)}</span>
                <span>·</span>
                <span>Net Margin: {formatCurrency(lastSaleResult.margin)}</span>
              </div>
              {lastSaleResult.warnings.length > 0 && (
                <div className="mt-1 text-amber-700 dark:text-amber-400 space-y-0.5">
                  {lastSaleResult.warnings.map((w, idx) => (
                    <div key={idx}>⚠️ {w}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setLastSaleResult(null)}
            className="text-neutral-400 hover:text-neutral-600 text-[10px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Dishes Selector, Right Real-Time Depletion & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Dishes Portion Counter */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 shadow-2xs">
            <div>
              <h3 className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Menu Items Sold
              </h3>
              <p className="text-[10px] text-neutral-500">
                Set quantities sold for this shift
              </p>
            </div>
            <input
              type="text"
              value={shiftName}
              onChange={e => setShiftName(e.target.value)}
              placeholder="Shift Name"
              className="px-2 py-0.5 text-[11px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 font-medium max-w-[150px] sm:max-w-none"
            />
          </div>

          <div className="space-y-2">
            {dishBreakdowns.map(dish => {
              const currentQty = quantities[dish.dishId] || 0;
              const maxPossible = dish.portionsAvailable;

              return (
                <div
                  key={dish.dishId}
                  className={`p-2.5 sm:p-3 bg-white dark:bg-neutral-900 border rounded-xl flex items-center justify-between gap-2.5 transition-colors shadow-2xs ${
                    currentQty > 0
                      ? 'border-amber-500/60 ring-1 ring-amber-500/20'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-neutral-400">{dish.category}</div>
                    <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {dish.dishName}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-neutral-500 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{formatCurrency(dish.sellingPrice)}</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(dish.contributionMargin)}</span>
                      <span>·</span>
                      <span className={maxPossible < 5 ? 'text-amber-500' : 'text-neutral-400'}>
                        {maxPossible} in stock
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleQtyChange(dish.dishId, currentQty - 1)}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={currentQty}
                      onChange={e => handleQtyChange(dish.dishId, parseInt(e.target.value) || 0)}
                      className="w-11 sm:w-12 px-1 py-0.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-center font-mono font-bold text-neutral-900 dark:text-neutral-100"
                    />
                    <button
                      onClick={() => handleQtyChange(dish.dishId, currentQty + 1)}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Real-time Shift Economics & Required Inventory Deductions */}
        <div className="lg:col-span-5 space-y-3">
          {/* Shift Financials Card */}
          <div className="bg-white dark:bg-neutral-900 p-3 sm:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-2xs">
            <h3 className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Shift Economics Summary
            </h3>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 sm:p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="text-neutral-500 text-[10px]">Gross Sales</div>
                <div className="text-sm sm:text-base font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                  {formatCurrency(totalRevenue)}
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="text-neutral-500 text-[10px]">Food Cost</div>
                <div className="text-sm sm:text-base font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                  {formatCurrency(totalCost)}
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="text-neutral-500 text-[10px]">Food Cost %</div>
                <div
                  className={`text-sm sm:text-base font-bold font-mono tracking-tight mt-0.5 ${
                    foodCostPct <= 28
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : foodCostPct <= 34
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatNumber(foodCostPct, 1)}%
                </div>
              </div>

              <div className="p-2 sm:p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="text-neutral-500 text-[10px]">Net Margin</div>
                <div className="text-sm sm:text-base font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  {formatCurrency(totalMargin)}
                </div>
              </div>
            </div>

            {hasShortages && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-1.5 text-[11px] text-red-700 dark:text-red-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Stock Shortage: </span>
                  Some required items exceed available stock.
                </div>
              </div>
            )}

            <button
              onClick={handleProcessSale}
              disabled={totalDishesCount === 0}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 ${
                totalDishesCount > 0
                  ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white cursor-pointer'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>
                Process &amp; Deplete Stock ({totalDishesCount} dishes)
              </span>
            </button>
          </div>

          {/* Required Inventory Ingredients Drawdown List */}
          <div className="bg-white dark:bg-neutral-900 p-3 sm:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-2xs">
            <h3 className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Required Inventory Drawdown
            </h3>

            {Object.keys(requiredIngredients).length === 0 ? (
              <p className="text-[11px] text-neutral-400">
                Add dishes sold to view required raw ingredient stock deductions.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {Object.values(requiredIngredients).map((req, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-[11px] flex items-center justify-between font-mono ${
                      req.shortage
                        ? 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300'
                        : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-sans font-semibold truncate">{req.name}</div>
                      <div className="text-[9px] text-neutral-400">
                        On hand: {formatNumber(req.available, 2)} {req.unit}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold">
                        -{formatNumber(req.needed, 2)} {req.unit}
                      </div>
                      {req.shortage && (
                        <div className="text-[9px] text-red-600 dark:text-red-400 font-semibold font-sans">
                          Exceeds Stock!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
