import { Unit } from '../types/costing';

// Unit conversion factors relative to standard base units:
// Mass base: gram (g)
// Volume base: milliliter (ml)
// Count base: unit

const MASS_TO_GRAM: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  fl_oz: 29.5735,
  cup: 240,
};

const COUNT_UNITS = new Set(['unit', 'can', 'bunch']);

export type UnitType = 'mass' | 'volume' | 'count';

export function getUnitType(unit: Unit): UnitType {
  if (unit in MASS_TO_GRAM) return 'mass';
  if (unit in VOLUME_TO_ML) return 'volume';
  return 'count';
}

/**
 * Converts a quantity from one unit to another.
 * If units are cross-dimensional (e.g. mass to volume), assumes water-density equivalence (1g ≈ 1ml).
 */
export function convertUnitQuantity(quantity: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return quantity;

  const fromType = getUnitType(fromUnit);
  const toType = getUnitType(toUnit);

  // Both are mass
  if (fromType === 'mass' && toType === 'mass') {
    const inGrams = quantity * MASS_TO_GRAM[fromUnit];
    return inGrams / MASS_TO_GRAM[toUnit];
  }

  // Both are volume
  if (fromType === 'volume' && toType === 'volume') {
    const inMl = quantity * VOLUME_TO_ML[fromUnit];
    return inMl / VOLUME_TO_ML[toUnit];
  }

  // Both are count
  if (fromType === 'count' && toType === 'count') {
    return quantity;
  }

  // Cross-dimension fallback (approximate 1g = 1ml for standard culinary liquids/broths)
  if (fromType === 'mass' && toType === 'volume') {
    const inGrams = quantity * MASS_TO_GRAM[fromUnit];
    return inGrams / VOLUME_TO_ML[toUnit];
  }

  if (fromType === 'volume' && toType === 'mass') {
    const inMl = quantity * VOLUME_TO_ML[fromUnit];
    return inMl / MASS_TO_GRAM[toUnit];
  }

  // Count to other fallback: return raw quantity
  return quantity;
}

/**
 * Calculates As-Purchased (AP) food cost for a recipe ingredient
 * accounting for yield / trim percentage.
 */
export function calculateIngredientCost(
  recipeQty: number,
  recipeUnit: Unit,
  inventoryUnit: Unit,
  costPerUnit: number,
  yieldPercent: number = 100
): { cost: number; asPurchasedQtyInInventoryUnit: number } {
  const safeYield = Math.max(1, Math.min(100, yieldPercent)) / 100;
  // Convert recipe quantity to the unit used by inventory
  const convertedQty = convertUnitQuantity(recipeQty, recipeUnit, inventoryUnit);
  // As-purchased quantity accounts for yield waste (e.g. trimming, peeling, skin)
  const apQty = convertedQty / safeYield;
  const cost = apQty * costPerUnit;

  return {
    cost: Number.isFinite(cost) ? cost : 0,
    asPurchasedQtyInInventoryUnit: Number.isFinite(apQty) ? apQty : 0,
  };
}

/**
 * Formats a currency value with 2 decimals in Philippine Peso (₱)
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '₱0.00';
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = absVal.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-₱${formatted}` : `₱${formatted}`;
}

/**
 * Formats numbers nicely with precision
 */
export function formatNumber(val: number, decimals: number = 2): string {
  if (!Number.isFinite(val)) return '0';
  return Number(val.toFixed(decimals)).toString();
}

/**
 * Get unit label for display
 */
export function formatUnit(unit: Unit, qty: number = 1): string {
  switch (unit) {
    case 'kg':
      return 'kg';
    case 'g':
      return 'g';
    case 'lb':
      return qty === 1 ? 'lb' : 'lbs';
    case 'oz':
      return 'oz';
    case 'l':
      return 'L';
    case 'ml':
      return 'ml';
    case 'fl_oz':
      return 'fl oz';
    case 'cup':
      return qty === 1 ? 'cup' : 'cups';
    case 'tbsp':
      return 'tbsp';
    case 'tsp':
      return 'tsp';
    case 'unit':
      return qty === 1 ? 'unit' : 'units';
    case 'can':
      return qty === 1 ? 'can' : 'cans';
    case 'bunch':
      return qty === 1 ? 'bunch' : 'bunches';
    default:
      return unit;
  }
}
