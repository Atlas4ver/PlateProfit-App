import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Ingredient, IngredientCategory, Unit } from '../../types/costing';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredient: Omit<Ingredient, 'id' | 'updatedAt'>) => void;
  initialData?: Ingredient | null;
}

const CATEGORIES: IngredientCategory[] = [
  'Meat & Poultry',
  'Seafood',
  'Dairy & Eggs',
  'Produce & Herbs',
  'Pantry & Dry Goods',
  'Oils & Condiments',
  'Bakery',
  'Beverages & Spirits',
];

const UNITS: { value: Unit; label: string }[] = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'l', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'unit', label: 'Single Unit / Piece (unit)' },
  { value: 'can', label: 'Can / Tin (can)' },
  { value: 'bunch', label: 'Bunch (bunch)' },
];

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('Produce & Herbs');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [unit, setUnit] = useState<Unit>('kg');
  const [costPerUnit, setCostPerUnit] = useState<number>(0);
  const [minStockLevel, setMinStockLevel] = useState<number>(0);
  const [yieldPercent, setYieldPercent] = useState<number>(100);
  const [supplier, setSupplier] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setCurrentStock(initialData.currentStock);
      setUnit(initialData.unit);
      setCostPerUnit(initialData.costPerUnit);
      setMinStockLevel(initialData.minStockLevel);
      setYieldPercent(initialData.yieldPercent);
      setSupplier(initialData.supplier);
    } else {
      setName('');
      setCategory('Produce & Herbs');
      setCurrentStock(10);
      setUnit('kg');
      setCostPerUnit(5.0);
      setMinStockLevel(3);
      setYieldPercent(100);
      setSupplier('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      category,
      currentStock: Number(currentStock) || 0,
      unit,
      costPerUnit: Number(costPerUnit) || 0,
      minStockLevel: Number(minStockLevel) || 0,
      yieldPercent: Math.min(100, Math.max(1, Number(yieldPercent) || 100)),
      supplier: supplier.trim() || 'General Purveyor',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {initialData ? 'Edit Inventory Ingredient' : 'Add New Inventory Ingredient'}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Tracks purchase costs, usable edible yield, and par thresholds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Ingredient Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Japanese A5 Wagyu Striploin"
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as IngredientCategory)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Primary Purchasing Unit
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as Unit)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              >
                {UNITS.map(u => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Cost per {unit} (₱) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={costPerUnit}
                onChange={e => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Current Stock On Hand ({unit})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentStock}
                onChange={e => setCurrentStock(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Min Stock Level / Par Alert ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={minStockLevel}
                onChange={e => setMinStockLevel(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center justify-between">
                <span>Edible Yield %</span>
                <span className="text-neutral-400 font-normal text-[10px]">Trim factor</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  value={yieldPercent}
                  onChange={e => setYieldPercent(parseInt(e.target.value) || 100)}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 font-mono pr-7"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-neutral-400">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Supplier / Purveyor
            </label>
            <input
              type="text"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              placeholder="e.g. Ocean Harvest Direct"
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
            />
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
              {initialData ? 'Save Changes' : 'Add Ingredient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
