import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Ingredient } from '../../types/costing';
import { formatUnit } from '../../utils/conversions';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onAdjust: (id: string, newStock: number, reason: string) => void;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  ingredient,
  onAdjust,
}) => {
  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState('Monthly physical inventory count');

  useEffect(() => {
    if (ingredient) {
      setNewStock(ingredient.currentStock);
      setReason('Weekly kitchen cycle count');
    }
  }, [ingredient, isOpen]);

  if (!isOpen || !ingredient) return null;

  const delta = newStock - ingredient.currentStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdjust(ingredient.id, Number(newStock), reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Adjust Physical Stock Count
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
              Reconciles system inventory with real physical count.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 sm:space-y-3.5">
          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2.5 sm:p-3 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
            <div className="text-[11px] text-neutral-500">Ingredient</div>
            <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {ingredient.name}
            </div>
            <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 font-mono">
              System On-Hand: {ingredient.currentStock} {formatUnit(ingredient.unit, ingredient.currentStock)}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              New Counted Physical Stock ({ingredient.unit}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={newStock}
              onChange={e => setNewStock(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Audit Note / Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-lg text-[11px] flex justify-between font-mono">
            <span className="text-neutral-500">Variance / Delta:</span>
            <span
              className={`font-semibold ${
                delta > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : delta < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-neutral-600'
              }`}
            >
              {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} {ingredient.unit}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[11px] sm:text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-lg transition-colors shadow-2xs"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
