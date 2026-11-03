import React, { useState, useEffect } from 'react';
import {
  CostingProvider,
  useCosting,
} from './context/CostingContext';
import { DishCostingView } from './components/DishCostingView';
import { InventoryView } from './components/InventoryView';
import { PriceSimulatorView } from './components/PriceSimulatorView';
import { OrderDepletionView } from './components/OrderDepletionView';
import { MenuMatrixView } from './components/MenuMatrixView';
import { LedgerView } from './components/LedgerView';
import { formatCurrency, formatNumber } from './utils/conversions';
import {
  Sun,
  Moon,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  TrendingUp,
  Package,
  Utensils,
  Zap,
} from 'lucide-react';

type ActiveTab = 'costing' | 'inventory' | 'simulator' | 'depletion' | 'matrix' | 'ledger';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('costing');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  const { overallMetrics, simulationActive, resetToDefaultData, exportDataJSON, importDataJSON } = useCosting();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          alert('Database restored successfully from backup JSON!');
        } else {
          alert('Invalid backup file structure.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar following 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
              Mise en Place
            </span>
            <span className="hidden sm:inline-block text-neutral-300 dark:text-neutral-700">·</span>
            <span className="hidden sm:inline-block text-[11px] text-neutral-500 font-medium whitespace-nowrap">
              Culinary Costing &amp; Inventory
            </span>
          </div>

          {/* Zone 2: Navigation Links (Single-line controls) */}
          <nav className="hidden md:flex items-center gap-1 text-[11px] lg:text-xs font-medium">
            <button
              onClick={() => setActiveTab('costing')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'costing'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Menu Costing
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <span>Inventory</span>
              {overallMetrics.lowStockCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <span>What-If Simulator</span>
              {simulationActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('depletion')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'depletion'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Shift Depletion
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Menu Matrix
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'ledger'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Ledger
            </button>
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Backup & Reset Utilities */}
            <button
              onClick={exportDataJSON}
              title="Backup Database to JSON"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <label
              title="Restore Database from JSON"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                if (confirm('Reset to initial sample restaurant menu and ingredients?')) {
                  resetToDefaultData();
                }
              }}
              title="Reset to Template Demo Data"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar - Symmetrical Segmented Bar */}
        <div className="md:hidden flex items-center justify-between px-3 py-1.5 border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto scrollbar-none gap-1 bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            onClick={() => setActiveTab('costing')}
            className={`px-2 py-1 rounded text-[11px] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'costing'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Costing
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-2 py-1 rounded text-[11px] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'inventory'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-2 py-1 rounded text-[11px] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'simulator'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab('depletion')}
            className={`px-2 py-1 rounded text-[11px] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'depletion'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Depletion
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-2 py-1 rounded text-[11px] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'matrix'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Matrix
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-2 py-1 rounded text-[11px] whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'ledger'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Ledger
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Universal 4-Column Metric Strip with Symmetrical Sizing */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Average Food Cost % */}
          <div className="bg-white dark:bg-neutral-900 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span className="truncate">Avg Food Cost %</span>
              <span className="font-mono text-[10px] shrink-0">Par: 28%</span>
            </div>
            <div
              className={`text-base sm:text-lg font-bold font-mono tracking-tight mt-1 ${
                overallMetrics.averageFoodCostPercent <= 28
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : overallMetrics.averageFoodCostPercent <= 34
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatNumber(overallMetrics.averageFoodCostPercent, 1)}%
            </div>
            <div className="text-[10px] text-neutral-400 mt-1 truncate">
              {overallMetrics.averageFoodCostPercent <= 28
                ? 'Healthy margin'
                : 'Margin compression'}
            </div>
          </div>

          {/* Total Stock Valuation */}
          <div className="bg-white dark:bg-neutral-900 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span className="truncate">Inventory Value</span>
              <Package className="w-3 h-3 text-neutral-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-1 truncate">
              {formatCurrency(overallMetrics.totalInventoryValue)}
            </div>
            <div className="text-[10px] text-neutral-400 mt-1 truncate">
              Total storage value
            </div>
          </div>

          {/* Par Alerts */}
          <div className="bg-white dark:bg-neutral-900 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span className="truncate">Stock Alerts</span>
              <AlertTriangle
                className={`w-3 h-3 shrink-0 ${
                  overallMetrics.lowStockCount > 0
                    ? 'text-amber-500'
                    : 'text-neutral-400'
                }`}
              />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tracking-tight mt-1 flex items-baseline gap-1.5">
              <span
                className={
                  overallMetrics.lowStockCount > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-neutral-900 dark:text-neutral-100'
                }
              >
                {overallMetrics.lowStockCount}
              </span>
              <span className="text-[10px] text-neutral-400 font-sans font-normal truncate">
                need reorder
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-1 truncate">
              {overallMetrics.outOfStockCount > 0
                ? `${overallMetrics.outOfStockCount} items 86'ed`
                : 'No critical stockouts'}
            </div>
          </div>

          {/* Active Recipes Cost Health */}
          <div className="bg-white dark:bg-neutral-900 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span className="truncate">Active Recipes</span>
              <Utensils className="w-3 h-3 text-neutral-400 shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
              {overallMetrics.totalActiveDishes}
            </div>
            <div className="text-[10px] text-neutral-400 mt-1 truncate">
              {overallMetrics.highCostDishesCount > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {overallMetrics.highCostDishesCount} above 34% cost
                </span>
              ) : (
                'All within target margin'
              )}
            </div>
          </div>
        </div>

        {/* View Routing */}
        {activeTab === 'costing' && <DishCostingView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'simulator' && <PriceSimulatorView />}
        {activeTab === 'depletion' && <OrderDepletionView />}
        {activeTab === 'matrix' && <MenuMatrixView />}
        {activeTab === 'ledger' && <LedgerView />}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-4 text-center text-[11px] text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>Mise en Place Restaurant Food Costing &amp; Inventory</span>
          <span>Real-time formula recalculations on purchase updates</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CostingProvider>
      <MainLayout />
    </CostingProvider>
  );
}
