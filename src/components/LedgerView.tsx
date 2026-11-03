import React, { useState } from 'react';
import {
  FileText,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Sliders,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useCosting } from '../context/CostingContext';
import { formatCurrency, formatUnit } from '../utils/conversions';

export const LedgerView: React.FC = () => {
  const { logs } = useCosting();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.ingredientName.toLowerCase().includes(search.toLowerCase()) ||
      (log.reference && log.reference.toLowerCase().includes(search.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
          <span>Inventory Audit &amp; Transaction Ledger</span>
        </h2>
        <p className="text-[11px] text-neutral-500 mt-0.5">
          Complete chronological record of all stock receiving orders, shift sales depletions, waste write-offs, and count reconciliations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ingredient, invoice #, or reason..."
            className="w-full pl-8 pr-2.5 py-1 text-[11px] sm:text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-x-auto scrollbar-none text-[11px]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-0.5 rounded whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterType('purchase')}
            className={`px-2.5 py-0.5 rounded whitespace-nowrap transition-colors ${
              filterType === 'purchase'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Receiving
          </button>
          <button
            onClick={() => setFilterType('sale_depletion')}
            className={`px-2.5 py-0.5 rounded whitespace-nowrap transition-colors ${
              filterType === 'sale_depletion'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Depletions
          </button>
          <button
            onClick={() => setFilterType('waste')}
            className={`px-2.5 py-0.5 rounded whitespace-nowrap transition-colors ${
              filterType === 'waste'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Waste
          </button>
          <button
            onClick={() => setFilterType('adjustment')}
            className={`px-2.5 py-0.5 rounded whitespace-nowrap transition-colors ${
              filterType === 'adjustment'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Counts
          </button>
        </div>
      </div>

      {/* Symmetrical Ledger Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800 text-[10px] sm:text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date &amp; Time</th>
                <th className="py-2.5 px-2.5">Type</th>
                <th className="py-2.5 px-2.5">Ingredient Item</th>
                <th className="py-2.5 px-2.5 text-right">Quantity Delta</th>
                <th className="py-2.5 px-2.5 text-right">Value Impact</th>
                <th className="py-2.5 px-3">Reference &amp; Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/70 font-mono">
              {filteredLogs.map(log => {
                let badgeColor = 'text-neutral-600 bg-neutral-100';
                let typeLabel: string = log.type;

                if (log.type === 'purchase') {
                  badgeColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10';
                  typeLabel = 'Stock Receive';
                } else if (log.type === 'waste') {
                  badgeColor = 'text-red-700 dark:text-red-400 bg-red-500/10';
                  typeLabel = 'Kitchen Waste';
                } else if (log.type === 'sale_depletion') {
                  badgeColor = 'text-blue-700 dark:text-blue-400 bg-blue-500/10';
                  typeLabel = 'Order Depletion';
                } else if (log.type === 'adjustment') {
                  badgeColor = 'text-amber-700 dark:text-amber-400 bg-amber-500/10';
                  typeLabel = 'Count Reconcile';
                }

                return (
                  <tr key={log.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                    <td className="py-2 px-3 text-neutral-500 whitespace-nowrap">{log.date}</td>
                    <td className="py-2 px-2.5 font-sans whitespace-nowrap">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${badgeColor}`}>
                        {typeLabel}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-sans font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[150px] sm:max-w-none">
                      {log.ingredientName}
                    </td>
                    <td className="py-2 px-2.5 text-right font-bold whitespace-nowrap">
                      <span
                        className={
                          log.quantityDelta > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }
                      >
                        {log.quantityDelta > 0 ? `+${log.quantityDelta.toFixed(2)}` : log.quantityDelta.toFixed(2)}{' '}
                        {log.unit}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-right font-bold whitespace-nowrap">
                      {log.costImpact !== undefined ? (
                        <span
                          className={
                            log.costImpact > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : log.costImpact < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-neutral-500'
                          }
                        >
                          {log.costImpact > 0
                            ? `+${formatCurrency(log.costImpact)}`
                            : formatCurrency(log.costImpact)}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-sans text-neutral-600 dark:text-neutral-400">
                      <div className="truncate max-w-xs text-[11px]">
                        {log.reference}
                        {log.reason && (
                          <span className="text-neutral-400"> ({log.reason})</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-[11px] text-neutral-500">
            No activity records match your search filter.
          </div>
        )}
      </div>
    </div>
  );
};
