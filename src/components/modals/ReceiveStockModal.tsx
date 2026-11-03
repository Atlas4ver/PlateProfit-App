import React, { useState, useEffect } from 'react';
import { X, ArrowRight, AlertCircle } from 'lucide-react';
import { Ingredient } from '../../types/costing';
import { formatCurrency, formatUnit } from '../../utils/conversions';

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  onReceive: (
    id: string,
    quantity: number,
    unitCost?: number,
    supplier?: string,
    invoice?: string
  ) => void;
}

export const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({
  isOpen,
  onClose,
  ingredient,
  onReceive,
}) => {
  const [quantity, setQuantity] = useState<number>(5);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [invoice, setInvoice] = useState('');

  useEffect(() => {
    if (ingredient) {
      setUnitCost(ingredient.costPerUnit);
      setSupplier(ingredient.supplier || '');
      setQuantity(5);
      setInvoice('');
    }
  }, [ingredient, isOpen]);

  if (!isOpen || !ingredient) return null;

  const costDifference = unitCost - ingredient.costPerUnit;
  const costChanged = Math.abs(costDifference) > 0.001;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    onReceive(ingredient.id, Number(quantity), Number(unitCost), supplier, invoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Receive Inventory Stock
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Logs incoming inventory shipment and updates cost records.
            </p>
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
            <div className="text-[10px] text-neutral-500">Selected Item</div>
            <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {ingredient.name}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 font-mono flex-wrap">
              <span>Stock: {ingredient.currentStock} {formatUnit(ingredient.unit, ingredient.currentStock)}</span>
              <span>·</span>
              <span>Cost: {formatCurrency(ingredient.costPerUnit)}/{ingredient.unit}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Quantity Received ({ingredient.unit}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={quantity}
                onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Invoice Price per {ingredient.unit} (₱) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={unitCost}
                onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>
          </div>

          {costChanged && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Price change detected: </span>
                {formatCurrency(ingredient.costPerUnit)} <ArrowRight className="inline w-3 h-3 mx-1" /> {formatCurrency(unitCost)}
                <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">
                  Saving will automatically recalculate recipe food costs and profit margins for all dishes using this ingredient.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Invoice / PO #
              </label>
              <input
                type="text"
                value={invoice}
                onChange={e => setInvoice(e.target.value)}
                placeholder="e.g. INV-2026-891"
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="Supplier name"
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-lg text-[11px] flex justify-between font-mono">
            <span className="text-neutral-500">Total Purchase Value:</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(quantity * unitCost)}
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
              Confirm &amp; Receive Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
