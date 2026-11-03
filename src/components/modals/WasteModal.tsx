import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Ingredient } from '../../types/costing';
import { formatCurrency, formatUnit } from '../../utils/conversions';

interface WasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onLogWaste: (id: string, quantity: number, reason: string) => void;
}

const COMMON_REASONS = [
  'Expired / Shelf life exceeded',
  'Moisture / mold / spoilage',
  'Prep station burn / kitchen error',
  'Over-trimming / severe fat loss',
  'Dropped / contaminated on floor',
  'Quality check rejection',
];

export const WasteModal: React.FC<WasteModalProps> = ({
  isOpen,
  onClose,
  ingredient,
  onLogWaste,
}) => {
  const [quantity, setQuantity] = useState<number>(0.5);
  const [reason, setReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !ingredient) return null;

  const costLost = quantity * ingredient.costPerUnit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const finalReason = customReason.trim() ? customReason.trim() : reason;
    onLogWaste(ingredient.id, Number(quantity), finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Log Kitchen Spoilage / Waste
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-2.5 sm:p-3 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
            <div className="text-[10px] text-neutral-500">Ingredient</div>
            <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {ingredient.name}
            </div>
            <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 font-mono">
              Stock available: {ingredient.currentStock} {formatUnit(ingredient.unit, ingredient.currentStock)}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Quantity Wasted ({ingredient.unit}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={ingredient.currentStock}
              required
              value={quantity}
              onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Waste Reason
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 mb-1.5"
            >
              {COMMON_REASONS.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder="Or write specific details / notes..."
              className="w-full px-2.5 py-1.5 text-[11px] sm:text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-[11px] flex justify-between font-mono text-red-700 dark:text-red-400">
            <span>Direct Food Cost Loss:</span>
            <span className="font-semibold">{formatCurrency(costLost)}</span>
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
              className="px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-2xs"
            >
              Confirm &amp; Deduct Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
