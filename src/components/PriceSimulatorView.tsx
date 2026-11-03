import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Sliders,
  DollarSign,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useCosting } from '../context/CostingContext';
import { IngredientCategory } from '../types/costing';
import { calculateIngredientCost, formatCurrency, formatNumber } from '../utils/conversions';

export const PriceSimulatorView: React.FC = () => {
  const {
    ingredients,
    dishes,
    dishBreakdowns,
    simulationActive,
    simulationOverrides,
    toggleSimulation,
    setSimulatedIngredientPrice,
    applyCategoryPriceShock,
    clearSimulation,
    commitSimulationToLive,
  } = useCosting();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  // Calculate monthly gross profit delta across all dishes
  let simulatedMonthlyProfitImpact = 0;
  let dishesCrossingThreshold = 0;

  dishBreakdowns.forEach(item => {
    const rawDish = dishes.find(d => d.id === item.dishId);
    const volume = rawDish ? rawDish.salesVolume : 0;
    
    // Calculate baseline food cost without overrides
    let baselineCost = 0;
    rawDish?.ingredients.forEach(ri => {
      const liveIng = ingredients.find(i => i.id === ri.ingredientId);
      if (!liveIng) return;
      const { cost } = calculateIngredientCost(
        ri.quantity,
        ri.unit,
        liveIng.unit,
        liveIng.costPerUnit,
        liveIng.yieldPercent
      );
      baselineCost += cost;
    });

    const baselineMargin = (rawDish?.sellingPrice || 0) - baselineCost;
    const currentSimMargin = item.contributionMargin;
    const deltaPerPortion = currentSimMargin - baselineMargin;
    simulatedMonthlyProfitImpact += deltaPerPortion * volume;

    if (item.foodCostPercent > 32) {
      dishesCrossingThreshold++;
    }
  });

  const categories: IngredientCategory[] = [
    'Meat & Poultry',
    'Seafood',
    'Dairy & Eggs',
    'Produce & Herbs',
    'Pantry & Dry Goods',
    'Oils & Condiments',
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
              What-If Food Cost &amp; Price Shock Simulator
            </h2>
            <span
              className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                simulationActive
                  ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
              }`}
            >
              {simulationActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Model supplier price spikes and observe real-time profit margin erosion without altering live inventory records.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {simulationActive && (
            <>
              <button
                onClick={clearSimulation}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Commit all simulated ingredient prices to permanent live inventory?')) {
                    commitSimulationToLive();
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-2xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Commit to Live</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Symmetrical KPI Impact Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-neutral-900 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] text-neutral-500">Active Price Overrides</div>
          <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-purple-600 dark:text-purple-400 mt-0.5">
            {Object.keys(simulationOverrides).length} ingredients
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            {simulationActive ? 'Propagating live' : 'Adjust sliders below'}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] text-neutral-500">Monthly Profit Impact</div>
          <div
            className={`text-base sm:text-lg font-bold font-mono tracking-tight mt-0.5 ${
              simulatedMonthlyProfitImpact < 0
                ? 'text-red-600 dark:text-red-400'
                : simulatedMonthlyProfitImpact > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {formatCurrency(simulatedMonthlyProfitImpact)}
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
            Based on monthly volume
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] text-neutral-500">Food Cost Alerts (&gt;32%)</div>
          <div
            className={`text-base sm:text-lg font-bold font-mono tracking-tight mt-0.5 ${
              dishesCrossingThreshold > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {dishesCrossingThreshold} recipes in danger
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
            Target benchmark: 28%
          </p>
        </div>
      </div>

      {/* Quick Category Shocks */}
      <div className="bg-white dark:bg-neutral-900 p-3 sm:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-purple-500" />
          <h3 className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            One-Click Department Inflation Shocks
          </h3>
        </div>
        <p className="text-[11px] text-neutral-500">
          Simulate an immediate percentage increase across all purveyor items in a department:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pt-1">
          {categories.map(cat => (
            <div
              key={cat}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-1.5 text-center"
            >
              <div className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {cat}
              </div>
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => applyCategoryPriceShock(cat, 10)}
                  className="px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                >
                  +10%
                </button>
                <button
                  onClick={() => applyCategoryPriceShock(cat, 20)}
                  className="px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                >
                  +20%
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sliders and Side-by-Side Impact Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Ingredient Price Sliders */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 p-3 sm:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              <span>Ingredient Price Sliders</span>
            </h3>
            <span className="text-[10px] text-neutral-400">Live vs Simulated</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {ingredients.map(ing => {
              const liveCost = ing.costPerUnit;
              const simulated = simulationOverrides[ing.id];
              const effective = simulated !== undefined ? simulated : liveCost;
              const hasOverride = simulated !== undefined && simulated !== liveCost;
              const pctChange = ((effective - liveCost) / liveCost) * 100;

              return (
                <div
                  key={ing.id}
                  className={`p-2.5 rounded-lg border text-[11px] transition-colors ${
                    hasOverride
                      ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800'
                      : 'bg-neutral-50/60 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="truncate mr-2">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate block">
                        {ing.name}
                      </span>
                      <div className="text-[10px] text-neutral-500">{ing.category}</div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100 text-[11px]">
                        {formatCurrency(effective)}/{ing.unit}
                      </div>
                      {hasOverride && (
                        <div
                          className={`text-[9px] font-semibold ${
                            pctChange > 0 ? 'text-red-500' : 'text-emerald-500'
                          }`}
                        >
                          {pctChange > 0 ? `+${pctChange.toFixed(1)}%` : `${pctChange.toFixed(1)}%`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slider Control */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="range"
                      min={Math.max(1, liveCost * 0.5)}
                      max={liveCost * 2.5}
                      step={Math.max(1, liveCost * 0.02)}
                      value={effective}
                      onChange={e => {
                        if (!simulationActive) toggleSimulation(true);
                        setSimulatedIngredientPrice(ing.id, parseFloat(e.target.value));
                      }}
                      className="flex-1 accent-purple-600 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                    />

                    {hasOverride && (
                      <button
                        onClick={() => {
                          const copy = { ...simulationOverrides };
                          delete copy[ing.id];
                          if (Object.keys(copy).length === 0) {
                            clearSimulation();
                          } else {
                            setSimulatedIngredientPrice(ing.id, liveCost);
                          }
                        }}
                        className="text-[9px] text-neutral-400 hover:text-neutral-600 underline shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Impact on Menu Dishes */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 p-3 sm:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Simulated Menu Margin Impact
            </h3>
            <span className="text-[10px] text-neutral-400">Live recalculation</span>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-2.5">Dish</th>
                  <th className="py-2 px-2 text-right">Price</th>
                  <th className="py-2 px-2 text-right">Sim Cost</th>
                  <th className="py-2 px-2 text-right">Cost %</th>
                  <th className="py-2 px-2.5 text-right">Sim Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                {dishBreakdowns.map(dish => {
                  const isDangerous = dish.foodCostPercent > 34;
                  const isWarning = dish.foodCostPercent > 28 && !isDangerous;

                  return (
                    <tr key={dish.dishId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2 px-2.5 font-sans font-medium text-neutral-900 dark:text-neutral-100">
                        <div className="truncate max-w-[120px] sm:max-w-none">{dish.dishName}</div>
                        <div className="text-[9px] text-neutral-400 font-normal">{dish.category}</div>
                      </td>
                      <td className="py-2 px-2 text-right text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                        {formatCurrency(dish.sellingPrice)}
                      </td>
                      <td className="py-2 px-2 text-right font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        {formatCurrency(dish.totalFoodCost)}
                      </td>
                      <td className="py-2 px-2 text-right font-bold whitespace-nowrap">
                        <span
                          className={
                            isDangerous
                              ? 'text-red-600 dark:text-red-400'
                              : isWarning
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {formatNumber(dish.foodCostPercent, 1)}%
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(dish.contributionMargin)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
