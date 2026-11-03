import React, { useState } from 'react';
import {
  Search,
  Plus,
  PackagePlus,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  DollarSign,
  ClipboardList,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useCosting } from '../context/CostingContext';
import { Ingredient, IngredientCategory, Unit } from '../types/costing';
import { formatCurrency, formatNumber, formatUnit } from '../utils/conversions';
import { IngredientModal } from './modals/IngredientModal';
import { ReceiveStockModal } from './modals/ReceiveStockModal';
import { WasteModal } from './modals/WasteModal';
import { AdjustStockModal } from './modals/AdjustStockModal';

const CATEGORIES: ('All' | IngredientCategory)[] = [
  'All',
  'Meat & Poultry',
  'Seafood',
  'Dairy & Eggs',
  'Produce & Herbs',
  'Pantry & Dry Goods',
  'Oils & Condiments',
  'Bakery',
  'Beverages & Spirits',
];

export const InventoryView: React.FC = () => {
  const {
    ingredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    updateIngredientPrice,
    receiveStock,
    logWaste,
    adjustStock,
  } = useCosting();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | IngredientCategory>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedIngredientForEdit, setSelectedIngredientForEdit] = useState<Ingredient | null>(null);

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedForReceive, setSelectedForReceive] = useState<Ingredient | null>(null);

  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [selectedForWaste, setSelectedForWaste] = useState<Ingredient | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedForAdjust, setSelectedForAdjust] = useState<Ingredient | null>(null);

  // In-line price quick edit state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceVal, setEditingPriceVal] = useState<string>('');

  const filteredIngredients = ingredients.filter(item => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase());

    const isLow = item.currentStock > 0 && item.currentStock <= item.minStockLevel;
    const isOut = item.currentStock <= 0;

    if (stockStatusFilter === 'low') return matchesCategory && matchesSearch && isLow;
    if (stockStatusFilter === 'out') return matchesCategory && matchesSearch && isOut;
    return matchesCategory && matchesSearch;
  });

  const handleStartPriceEdit = (ing: Ingredient) => {
    setEditingPriceId(ing.id);
    setEditingPriceVal(ing.costPerUnit.toString());
  };

  const handleSavePriceEdit = (id: string) => {
    const newPrice = parseFloat(editingPriceVal);
    if (!isNaN(newPrice) && newPrice >= 0) {
      updateIngredientPrice(id, newPrice, 'Quick in-place price update');
    }
    setEditingPriceId(null);
  };

  const exportInventoryCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Stock', 'Unit', 'Cost_Per_Unit', 'Min_Stock', 'Yield_Pct', 'Total_Valuation', 'Supplier'];
    const rows = ingredients.map(i => [
      i.id,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      i.currentStock,
      i.unit,
      i.costPerUnit,
      i.minStockLevel,
      i.yieldPercent,
      (i.currentStock * i.costPerUnit).toFixed(2),
      `"${i.supplier.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurant-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
            Inventory &amp; Ingredient Cost Center
          </h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Live stock counts, supplier pricing, and edible yield factors. Editing any price immediately updates all recipes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto">
          <button
            onClick={exportInventoryCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setSelectedIngredientForEdit(null);
              setIsIngredientModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Ingredient</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ingredient or supplier..."
            className="w-full pl-8 pr-2.5 py-1 text-[11px] sm:text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
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

        {/* Stock Alert Filter */}
        <div className="flex items-center gap-1 shrink-0 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-[11px]">
          <button
            onClick={() => setStockStatusFilter('all')}
            className={`px-2 py-0.5 rounded transition-colors ${
              stockStatusFilter === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStockStatusFilter('low')}
            className={`px-2 py-0.5 rounded transition-colors ${
              stockStatusFilter === 'low'
                ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Low Par
          </button>
          <button
            onClick={() => setStockStatusFilter('out')}
            className={`px-2 py-0.5 rounded transition-colors ${
              stockStatusFilter === 'out'
                ? 'bg-red-500 text-white font-semibold shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Symmetrical High-Density Inventory Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/70 text-neutral-600 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800 text-[10px] sm:text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Ingredient &amp; Purveyor</th>
                <th className="py-2.5 px-2.5">Category</th>
                <th className="py-2.5 px-2.5 text-right">Stock on Hand</th>
                <th className="py-2.5 px-2.5 text-right">Par Level</th>
                <th className="py-2.5 px-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>Unit Cost</span>
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-normal">
                      (edit)
                    </span>
                  </div>
                </th>
                <th className="py-2.5 px-2.5 text-right">Yield</th>
                <th className="py-2.5 px-2.5 text-right">Valuation</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-mono">
              {filteredIngredients.map(ing => {
                const isOutOfStock = ing.currentStock <= 0;
                const isLowStock = !isOutOfStock && ing.currentStock <= ing.minStockLevel;
                const isEditingPrice = editingPriceId === ing.id;
                const holdingValue = ing.currentStock * ing.costPerUnit;

                return (
                  <tr
                    key={ing.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Name & Supplier */}
                    <td className="py-2 px-3 font-sans">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[180px] sm:max-w-xs">
                        {ing.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-normal truncate">
                        {ing.supplier}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2 px-2.5 font-sans text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {ing.category}
                    </td>

                    {/* Stock on Hand */}
                    <td className="py-2 px-2.5 text-right font-medium whitespace-nowrap">
                      <span
                        className={
                          isOutOfStock
                            ? 'text-red-600 dark:text-red-400 font-bold'
                            : isLowStock
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }
                      >
                        {formatNumber(ing.currentStock, 2)} {formatUnit(ing.unit, ing.currentStock)}
                      </span>
                      {isOutOfStock && (
                        <div className="text-[9px] text-red-500 uppercase font-semibold font-sans">
                          Out
                        </div>
                      )}
                      {isLowStock && (
                        <div className="text-[9px] text-amber-500 uppercase font-semibold font-sans">
                          Low Par
                        </div>
                      )}
                    </td>

                    {/* Par Alert */}
                    <td className="py-2 px-2.5 text-right text-neutral-500 whitespace-nowrap">
                      {formatNumber(ing.minStockLevel, 1)} {ing.unit}
                    </td>

                    {/* Unit Cost with interactive 1-click edit */}
                    <td className="py-2 px-2.5 text-right whitespace-nowrap">
                      {isEditingPrice ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="1"
                            value={editingPriceVal}
                            onChange={e => setEditingPriceVal(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSavePriceEdit(ing.id);
                              if (e.key === 'Escape') setEditingPriceId(null);
                            }}
                            className="w-16 px-1 py-0.5 text-[11px] bg-white dark:bg-neutral-900 border border-amber-500 rounded font-mono text-neutral-900 dark:text-neutral-100 text-right"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePriceEdit(ing.id)}
                            className="p-0.5 text-emerald-600 hover:text-emerald-700"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="p-0.5 text-neutral-400 hover:text-neutral-600"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartPriceEdit(ing)}
                          className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-amber-600 dark:hover:text-amber-400 hover:underline inline-flex items-center gap-0.5"
                          title="Click to edit price"
                        >
                          <span>{formatCurrency(ing.costPerUnit)}</span>
                          <span className="text-[9px] text-neutral-400 font-normal">/{ing.unit}</span>
                        </button>
                      )}
                    </td>

                    {/* Yield % */}
                    <td className="py-2 px-2.5 text-right text-neutral-600 dark:text-neutral-400">
                      {ing.yieldPercent}%
                    </td>

                    {/* Valuation */}
                    <td className="py-2 px-2.5 text-right font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {formatCurrency(holdingValue)}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right font-sans whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedForReceive(ing);
                            setIsReceiveModalOpen(true);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded transition-colors"
                          title="Receive stock"
                        >
                          Receive
                        </button>

                        <button
                          onClick={() => {
                            setSelectedForWaste(ing);
                            setIsWasteModalOpen(true);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                          title="Log waste"
                        >
                          Waste
                        </button>

                        <button
                          onClick={() => {
                            setSelectedForAdjust(ing);
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                          title="Count adjustment"
                        >
                          Count
                        </button>

                        <button
                          onClick={() => {
                            setSelectedIngredientForEdit(ing);
                            setIsIngredientModalOpen(true);
                          }}
                          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete ingredient "${ing.name}"?`)) {
                              deleteIngredient(ing.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-red-500 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredIngredients.length === 0 && (
          <div className="p-8 text-center text-[11px] text-neutral-500">
            No ingredients found matching your filter criteria.
          </div>
        )}
      </div>

      {/* Modals */}
      <IngredientModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        onSave={data => {
          if (selectedIngredientForEdit) {
            updateIngredient(selectedIngredientForEdit.id, data);
          } else {
            addIngredient(data);
          }
        }}
        initialData={selectedIngredientForEdit}
      />

      <ReceiveStockModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        ingredient={selectedForReceive}
        onReceive={receiveStock}
      />

      <WasteModal
        isOpen={isWasteModalOpen}
        onClose={() => setIsWasteModalOpen(false)}
        ingredient={selectedForWaste}
        onLogWaste={logWaste}
      />

      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        ingredient={selectedForAdjust}
        onAdjust={adjustStock}
      />
    </div>
  );
};
