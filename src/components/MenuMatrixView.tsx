import React from 'react';
import {
  Sparkles,
  Award,
  HelpCircle,
  AlertOctagon,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Lightbulb,
} from 'lucide-react';
import { useCosting } from '../context/CostingContext';
import { formatCurrency, formatNumber } from '../utils/conversions';

export const MenuMatrixView: React.FC = () => {
  const { dishBreakdowns, dishes, updateDish } = useCosting();

  const stars = dishBreakdowns.filter(d => d.matrixCategory === 'Star');
  const plowhorses = dishBreakdowns.filter(d => d.matrixCategory === 'Plowhorse');
  const puzzles = dishBreakdowns.filter(d => d.matrixCategory === 'Puzzle');
  const dogs = dishBreakdowns.filter(d => d.matrixCategory === 'Dog');

  // Calculate averages
  const avgMargin =
    dishBreakdowns.length > 0
      ? dishBreakdowns.reduce((acc, d) => acc + d.contributionMargin, 0) / dishBreakdowns.length
      : 0;

  const avgSales =
    dishes.length > 0
      ? dishes.reduce((acc, d) => acc + d.salesVolume, 0) / dishes.length
      : 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
          <span>Menu Engineering &amp; Profitability Matrix</span>
        </h2>
        <p className="text-[11px] text-neutral-500 mt-0.5">
          The Kasavana &amp; Smith Boston matrix analyzes each dish based on Contribution Margin (₱) versus Sales Volume popularity to drive strategic pricing decisions.
        </p>
      </div>

      {/* Benchmark Averages Strip */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 p-2.5 sm:p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-[11px] font-mono shadow-2xs">
        <div>
          <span className="text-neutral-400">Benchmark Margin: </span>
          <span className="font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(avgMargin)}/plate
          </span>
        </div>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
        <div>
          <span className="text-neutral-400">Benchmark Volume: </span>
          <span className="font-bold text-neutral-900 dark:text-neutral-100">
            {Math.round(avgSales)} portions/mo
          </span>
        </div>
      </div>

      {/* Symmetrical 2x2 Matrix Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* QUADRANT 1: STARS */}
        <div className="bg-white dark:bg-neutral-900 border border-emerald-500/30 rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Stars (High Margin · High Popularity)
                </h3>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Flagship Profit Drivers
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              {stars.length} dishes
            </span>
          </div>

          <div className="p-2 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-lg text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5">
            <Lightbulb className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Strategy:</strong> Protect quality &amp; recipe consistency. Maintain premier placement on physical &amp; digital menus.
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {stars.map(dish => (
              <div
                key={dish.dishId}
                className="p-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-lg text-[11px] flex items-center justify-between font-mono"
              >
                <div className="truncate mr-2">
                  <div className="font-sans font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {dish.dishName}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {formatCurrency(dish.sellingPrice)} · Food Cost: {formatNumber(dish.foodCostPercent, 1)}%
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(dish.contributionMargin)}
                  </div>
                  <div className="text-[9px] text-neutral-400">
                    {dishes.find(d => d.id === dish.dishId)?.salesVolume} sold/mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUADRANT 2: PUZZLES */}
        <div className="bg-white dark:bg-neutral-900 border border-amber-500/30 rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Puzzles (High Margin · Low Popularity)
                </h3>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Untapped Profit Gems
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
              {puzzles.length} dishes
            </span>
          </div>

          <div className="p-2 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5">
            <Lightbulb className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Strategy:</strong> High margin potential! Train waitstaff on verbal upselling, reposition to menu prime spot, or feature as special.
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {puzzles.map(dish => (
              <div
                key={dish.dishId}
                className="p-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-lg text-[11px] flex items-center justify-between font-mono"
              >
                <div className="truncate mr-2">
                  <div className="font-sans font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {dish.dishName}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {formatCurrency(dish.sellingPrice)} · Food Cost: {formatNumber(dish.foodCostPercent, 1)}%
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-amber-600 dark:text-amber-400">
                    +{formatCurrency(dish.contributionMargin)}
                  </div>
                  <div className="text-[9px] text-neutral-400">
                    {dishes.find(d => d.id === dish.dishId)?.salesVolume} sold/mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUADRANT 3: PLOWHORSES */}
        <div className="bg-white dark:bg-neutral-900 border border-blue-500/30 rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Award className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Plowhorses (Low Margin · High Popularity)
                </h3>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  Crowd Favorites with Slim Profits
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400">
              {plowhorses.length} dishes
            </span>
          </div>

          <div className="p-2 bg-blue-500/5 dark:bg-blue-500/10 rounded-lg text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5">
            <Lightbulb className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Strategy:</strong> High volume gives pricing leverage! Nudge selling price up by ₱40 - ₱80 or re-engineer ingredient costs.
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {plowhorses.map(dish => (
              <div
                key={dish.dishId}
                className="p-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-lg text-[11px] flex items-center justify-between font-mono"
              >
                <div className="truncate mr-2">
                  <div className="font-sans font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {dish.dishName}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {formatCurrency(dish.sellingPrice)} · Food Cost: {formatNumber(dish.foodCostPercent, 1)}%
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    +{formatCurrency(dish.contributionMargin)}
                  </div>
                  <div className="text-[9px] text-neutral-400">
                    {dishes.find(d => d.id === dish.dishId)?.salesVolume} sold/mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUADRANT 4: DOGS */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                <AlertOctagon className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Dogs (Low Margin · Low Popularity)
                </h3>
                <div className="text-[10px] text-neutral-500 font-medium">
                  Candidates for Removal or Overhaul
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {dogs.length} dishes
            </span>
          </div>

          <div className="p-2 bg-neutral-100 dark:bg-neutral-800/60 rounded-lg text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-400 flex items-start gap-1.5">
            <Lightbulb className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
            <span>
              <strong>Strategy:</strong> Low popularity and profitability. Consider removing from menu to reduce walk-in prep burden and eliminate spoilage risks.
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {dogs.length === 0 ? (
              <div className="p-4 text-center text-[11px] text-neutral-400">
                No underperforming &quot;Dog&quot; dishes currently on the menu!
              </div>
            ) : (
              dogs.map(dish => (
                <div
                  key={dish.dishId}
                  className="p-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-lg text-[11px] flex items-center justify-between font-mono"
                >
                  <div className="truncate mr-2">
                    <div className="font-sans font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {dish.dishName}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Price: {formatCurrency(dish.sellingPrice)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-neutral-500">
                      +{formatCurrency(dish.contributionMargin)}
                    </div>
                    <div className="text-[9px] text-neutral-400">
                      {dishes.find(d => d.id === dish.dishId)?.salesVolume} sold/mo
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
