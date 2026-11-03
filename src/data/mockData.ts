import { Dish, Ingredient, InventoryLogEntry } from '../types/costing';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'USDA Prime Ribeye (Lip-on)',
    category: 'Meat & Poultry',
    currentStock: 14.5,
    unit: 'kg',
    costPerUnit: 2100.00, // ₱2,100 / kg
    minStockLevel: 8.0,
    yieldPercent: 85, // 15% fat cap and gristle trim
    supplier: 'Creekstone Farms Premium Meats',
    updatedAt: '2026-11-01',
    lastPriceChange: {
      date: '2026-10-24',
      previousCost: 1950.00,
      newCost: 2100.00,
      note: 'Import freight and cattle index rate increase',
    },
  },
  {
    id: 'ing-2',
    name: 'Atlantic Salmon Fillet (Skin-on)',
    category: 'Seafood',
    currentStock: 8.2,
    unit: 'kg',
    costPerUnit: 1450.00, // ₱1,450 / kg
    minStockLevel: 6.0,
    yieldPercent: 88, // pinbones and tail trim
    supplier: 'Ocean Harvest Direct',
    updatedAt: '2026-11-02',
  },
  {
    id: 'ing-3',
    name: 'Ground Angus Beef (80/20 blend)',
    category: 'Meat & Poultry',
    currentStock: 18.0,
    unit: 'kg',
    costPerUnit: 580.00, // ₱580 / kg
    minStockLevel: 10.0,
    yieldPercent: 96,
    supplier: 'Creekstone Farms Premium Meats',
    updatedAt: '2026-10-29',
  },
  {
    id: 'ing-4',
    name: 'Black Truffle Cultured Butter',
    category: 'Dairy & Eggs',
    currentStock: 1200,
    unit: 'g',
    costPerUnit: 8.50, // ₱8.50 / g
    minStockLevel: 500,
    yieldPercent: 100,
    supplier: 'Urbani Artisanal Imports',
    updatedAt: '2026-10-20',
  },
  {
    id: 'ing-5',
    name: 'Heavy Whipping Cream 36%',
    category: 'Dairy & Eggs',
    currentStock: 16.0,
    unit: 'l',
    costPerUnit: 280.00, // ₱280 / L
    minStockLevel: 8.0,
    yieldPercent: 100,
    supplier: 'Valley Fresh Dairy Cooperative',
    updatedAt: '2026-11-01',
  },
  {
    id: 'ing-6',
    name: 'Arborio Superfino Rice',
    category: 'Pantry & Dry Goods',
    currentStock: 25.0,
    unit: 'kg',
    costPerUnit: 260.00, // ₱260 / kg
    minStockLevel: 10.0,
    yieldPercent: 100,
    supplier: 'EuroGourmet Distribution',
    updatedAt: '2026-10-15',
  },
  {
    id: 'ing-7',
    name: 'Grana Padano DOP (Aged 16 Mo)',
    category: 'Dairy & Eggs',
    currentStock: 6.4,
    unit: 'kg',
    costPerUnit: 1750.00, // ₱1,750 / kg
    minStockLevel: 4.0,
    yieldPercent: 94, // rind trimming
    supplier: 'EuroGourmet Distribution',
    updatedAt: '2026-10-28',
  },
  {
    id: 'ing-8',
    name: 'Cold-Pressed Extra Virgin Olive Oil',
    category: 'Oils & Condiments',
    currentStock: 22.0,
    unit: 'l',
    costPerUnit: 880.00, // ₱880 / L
    minStockLevel: 12.0,
    yieldPercent: 100,
    supplier: 'Kalamata Select Imports',
    updatedAt: '2026-10-10',
  },
  {
    id: 'ing-9',
    name: 'Brioche Burger Buns',
    category: 'Bakery',
    currentStock: 48,
    unit: 'unit',
    costPerUnit: 55.00, // ₱55 / bun
    minStockLevel: 30,
    yieldPercent: 100,
    supplier: 'Grand Central Bakery',
    updatedAt: '2026-11-02',
  },
  {
    id: 'ing-10',
    name: 'Sharp Aged White Cheddar',
    category: 'Dairy & Eggs',
    currentStock: 5.2,
    unit: 'kg',
    costPerUnit: 980.00, // ₱980 / kg
    minStockLevel: 3.5,
    yieldPercent: 100,
    supplier: 'Valley Fresh Dairy Cooperative',
    updatedAt: '2026-10-25',
  },
  {
    id: 'ing-11',
    name: 'Yukon Gold Potatoes',
    category: 'Produce & Herbs',
    currentStock: 45.0,
    unit: 'kg',
    costPerUnit: 130.00, // ₱130 / kg
    minStockLevel: 25.0,
    yieldPercent: 88, // peeling & eye loss
    supplier: 'Northwest Produce Co.',
    updatedAt: '2026-11-01',
  },
  {
    id: 'ing-12',
    name: 'Wild Forest Mushrooms (Chanterelle & Cremini)',
    category: 'Produce & Herbs',
    currentStock: 3.8, // low stock!
    unit: 'kg',
    costPerUnit: 1150.00, // ₱1,150 / kg
    minStockLevel: 5.0,
    yieldPercent: 90, // stem trim
    supplier: 'Foraged Wild Provisions',
    updatedAt: '2026-11-02',
    lastPriceChange: {
      date: '2026-10-31',
      previousCost: 980.00,
      newCost: 1150.00,
      note: 'Fall supply constraint',
    },
  },
  {
    id: 'ing-13',
    name: 'Peeled Garlic Cloves',
    category: 'Produce & Herbs',
    currentStock: 4.5,
    unit: 'kg',
    costPerUnit: 380.00, // ₱380 / kg
    minStockLevel: 3.0,
    yieldPercent: 98,
    supplier: 'Northwest Produce Co.',
    updatedAt: '2026-10-22',
  },
  {
    id: 'ing-14',
    name: 'Fresh Thyme & Rosemary',
    category: 'Produce & Herbs',
    currentStock: 12,
    unit: 'bunch',
    costPerUnit: 130.00, // ₱130 / bunch
    minStockLevel: 8,
    yieldPercent: 75, // stems removed
    supplier: 'Northwest Produce Co.',
    updatedAt: '2026-11-02',
  },
  {
    id: 'ing-15',
    name: 'San Marzano D.O.P. Whole Peeled Tomatoes',
    category: 'Pantry & Dry Goods',
    currentStock: 36,
    unit: 'can',
    costPerUnit: 230.00, // ₱230 / can
    minStockLevel: 20,
    yieldPercent: 100,
    supplier: 'EuroGourmet Distribution',
    updatedAt: '2026-10-18',
  },
  {
    id: 'ing-16',
    name: 'Callebaut 70.5% Dark Chocolate Callets',
    category: 'Pantry & Dry Goods',
    currentStock: 9.0,
    unit: 'kg',
    costPerUnit: 1450.00, // ₱1,450 / kg
    minStockLevel: 5.0,
    yieldPercent: 100,
    supplier: 'EuroGourmet Distribution',
    updatedAt: '2026-10-12',
  },
  {
    id: 'ing-17',
    name: 'Pasture-Raised Grade A Large Eggs',
    category: 'Dairy & Eggs',
    currentStock: 140,
    unit: 'unit',
    costPerUnit: 22.00, // ₱22 / egg
    minStockLevel: 90,
    yieldPercent: 100,
    supplier: 'Valley Fresh Dairy Cooperative',
    updatedAt: '2026-11-02',
  },
  {
    id: 'ing-18',
    name: 'Small Batch Kentucky Straight Bourbon (750ml)',
    category: 'Beverages & Spirits',
    currentStock: 4500,
    unit: 'ml',
    costPerUnit: 2.70, // ₱2.70 / ml (~₱2,025 / 750ml bottle)
    minStockLevel: 2250,
    yieldPercent: 100,
    supplier: 'Heritage Spirits Wholesale',
    updatedAt: '2026-10-05',
  },
  {
    id: 'ing-19',
    name: 'Fresh Eureka Lemons',
    category: 'Produce & Herbs',
    currentStock: 22,
    unit: 'unit',
    costPerUnit: 42.00, // ₱42 / lemon
    minStockLevel: 20,
    yieldPercent: 85,
    supplier: 'Northwest Produce Co.',
    updatedAt: '2026-11-01',
  },
];

export const INITIAL_DISHES: Dish[] = [
  {
    id: 'dish-1',
    name: 'Prime Ribeye (12oz) with Truffle Butter',
    category: 'Mains & Steaks',
    sellingPrice: 3200.00, // ₱3,200
    salesVolume: 184, // High volume, high margin = STAR
    targetFoodCostPercent: 28,
    description: 'Charred USDA Prime ribeye steak topped with cultured black truffle butter, duck fat roast Yukon potatoes, and fresh herb sprigs.',
    prepTimeMinutes: 18,
    status: 'Active',
    updatedAt: '2026-11-01',
    ingredients: [
      { ingredientId: 'ing-1', quantity: 340, unit: 'g', notes: '12oz trimmed prime cut' },
      { ingredientId: 'ing-4', quantity: 28, unit: 'g', notes: 'Melting butter quenelle' },
      { ingredientId: 'ing-11', quantity: 220, unit: 'g', notes: 'Roasted fingerlings/wedges' },
      { ingredientId: 'ing-8', quantity: 15, unit: 'ml', notes: 'High-heat pan sear' },
      { ingredientId: 'ing-14', quantity: 0.25, unit: 'bunch', notes: 'Aromatic basting thyme' },
    ],
  },
  {
    id: 'dish-2',
    name: 'Pan-Seared Pacific Salmon',
    category: 'Mains & Steaks',
    sellingPrice: 1950.00, // ₱1,950
    salesVolume: 142, // STAR
    targetFoodCostPercent: 28,
    description: 'Crisp skin Atlantic salmon served over lemon-herb crushed potatoes with extra virgin emulsion and char-grilled lemon.',
    prepTimeMinutes: 14,
    status: 'Active',
    updatedAt: '2026-11-02',
    ingredients: [
      { ingredientId: 'ing-2', quantity: 220, unit: 'g', notes: 'Center-cut salmon fillet' },
      { ingredientId: 'ing-11', quantity: 180, unit: 'g', notes: 'Crushed Yukon gold' },
      { ingredientId: 'ing-8', quantity: 20, unit: 'ml', notes: 'Pan sear & finishing drizzle' },
      { ingredientId: 'ing-19', quantity: 0.5, unit: 'unit', notes: 'Grilled lemon cheek' },
      { ingredientId: 'ing-14', quantity: 0.2, unit: 'bunch', notes: 'Herbed potato garnish' },
    ],
  },
  {
    id: 'dish-3',
    name: 'Wild Mushroom & Truffle Risotto',
    category: 'Pastas & Risottos',
    sellingPrice: 1550.00, // ₱1,550
    salesVolume: 125, // High profit margin, high sales = STAR
    targetFoodCostPercent: 25,
    description: 'Creamy slow-simmered Arborio rice with foraged woodland mushrooms, shaved Grana Padano DOP, and melted truffle butter.',
    prepTimeMinutes: 20,
    status: 'Active',
    updatedAt: '2026-11-02',
    ingredients: [
      { ingredientId: 'ing-6', quantity: 110, unit: 'g', notes: 'Arborio rice base' },
      { ingredientId: 'ing-12', quantity: 140, unit: 'g', notes: 'Sauteed wild mushrooms' },
      { ingredientId: 'ing-4', quantity: 20, unit: 'g', notes: 'Mantecatura finish' },
      { ingredientId: 'ing-7', quantity: 35, unit: 'g', notes: 'Aged 16mo Grana Padano' },
      { ingredientId: 'ing-5', quantity: 45, unit: 'ml', notes: 'Heavy cream enricher' },
      { ingredientId: 'ing-13', quantity: 10, unit: 'g', notes: 'Minced garlic soffritto' },
      { ingredientId: 'ing-8', quantity: 15, unit: 'ml', notes: 'Pan base' },
    ],
  },
  {
    id: 'dish-4',
    name: 'The Heritage Angus Burger & Fries',
    category: 'Burgers & Sandwiches',
    sellingPrice: 1200.00, // ₱1,200
    salesVolume: 230, // Extremely popular = PLOWHORSE
    targetFoodCostPercent: 26,
    description: 'Fresh 80/20 Angus chuck patty, melted sharp white cheddar, toasted brioche bun, house aioli, and crispy hand-cut Yukon fries.',
    prepTimeMinutes: 12,
    status: 'Active',
    updatedAt: '2026-10-30',
    ingredients: [
      { ingredientId: 'ing-3', quantity: 220, unit: 'g', notes: 'Fresh ground patty' },
      { ingredientId: 'ing-9', quantity: 1, unit: 'unit', notes: 'Toasted brioche bun' },
      { ingredientId: 'ing-10', quantity: 40, unit: 'g', notes: 'Thick aged cheddar slice' },
      { ingredientId: 'ing-11', quantity: 250, unit: 'g', notes: 'Hand-cut fry portion' },
      { ingredientId: 'ing-8', quantity: 10, unit: 'ml', notes: 'Cooking fat' },
    ],
  },
  {
    id: 'dish-5',
    name: 'Classic San Marzano Rigatoni Pomodoro',
    category: 'Pastas & Risottos',
    sellingPrice: 980.00, // ₱980
    salesVolume: 92, // High margin, moderate sales = PUZZLE
    targetFoodCostPercent: 22,
    description: 'Slow-simmered Campania San Marzano whole peeled tomatoes, sweet confit garlic cloves, Grana Padano, and cold-pressed olive oil.',
    prepTimeMinutes: 10,
    status: 'Active',
    updatedAt: '2026-10-28',
    ingredients: [
      { ingredientId: 'ing-15', quantity: 0.45, unit: 'can', notes: 'Crushed peeled plum tomatoes' },
      { ingredientId: 'ing-8', quantity: 25, unit: 'ml', notes: 'EVOO emulsified sauce' },
      { ingredientId: 'ing-13', quantity: 15, unit: 'g', notes: 'Golden sliced garlic' },
      { ingredientId: 'ing-7', quantity: 30, unit: 'g', notes: 'Microplaned Grana cheese' },
      { ingredientId: 'ing-14', quantity: 0.15, unit: 'bunch', notes: 'Fresh herb perfume' },
    ],
  },
  {
    id: 'dish-6',
    name: 'Warm Valrhona Chocolate Lava Cake',
    category: 'Desserts',
    sellingPrice: 750.00, // ₱750
    salesVolume: 110, // Excellent margin, solid sales = STAR
    targetFoodCostPercent: 20,
    description: 'Molten center dark chocolate cake made with 70.5% Callebaut chocolate and fresh pasture eggs, served with house whipped cream.',
    prepTimeMinutes: 12,
    status: 'Active',
    updatedAt: '2026-10-25',
    ingredients: [
      { ingredientId: 'ing-16', quantity: 75, unit: 'g', notes: 'Belgium dark chocolate callets' },
      { ingredientId: 'ing-17', quantity: 2, unit: 'unit', notes: 'Separated yolk & whites' },
      { ingredientId: 'ing-5', quantity: 50, unit: 'ml', notes: 'Whipped cream dollop' },
    ],
  },
  {
    id: 'dish-7',
    name: 'Smoked Oak Bourbon Old Fashioned',
    category: 'Beverages & Cocktails',
    sellingPrice: 850.00, // ₱850
    salesVolume: 165, // Enormous margin (very low pour cost) = STAR
    targetFoodCostPercent: 18,
    description: '2.5oz Small batch straight bourbon, raw demerara syrup, Angostura bitters, expressed orange peel and charred oak smoke.',
    prepTimeMinutes: 3,
    status: 'Active',
    updatedAt: '2026-10-20',
    ingredients: [
      { ingredientId: 'ing-18', quantity: 75, unit: 'ml', notes: '2.5 fl oz premium bourbon' },
    ],
  },
];

export const INITIAL_LOGS: InventoryLogEntry[] = [
  {
    id: 'log-1',
    date: '2026-11-02 18:30',
    type: 'purchase',
    ingredientId: 'ing-1',
    ingredientName: 'USDA Prime Ribeye (Lip-on)',
    quantityDelta: 10,
    unit: 'kg',
    costImpact: 21000.00, // ₱21,000
    reference: 'PO-9481 - Creekstone',
  },
  {
    id: 'log-2',
    date: '2026-11-02 15:10',
    type: 'waste',
    ingredientId: 'ing-12',
    ingredientName: 'Wild Forest Mushrooms (Chanterelle & Cremini)',
    quantityDelta: -0.6,
    unit: 'kg',
    costImpact: -690.00, // -₱690
    reason: 'Moisture spoilage on lower shelf',
    reference: 'Shift Waste Audit',
  },
  {
    id: 'log-3',
    date: '2026-11-01 22:45',
    type: 'sale_depletion',
    ingredientId: 'ing-1',
    ingredientName: 'USDA Prime Ribeye (Lip-on)',
    quantityDelta: -4.8,
    unit: 'kg',
    costImpact: -10080.00, // -₱10,080
    reference: 'Dinner Shift 12 Steaks Sold',
  },
  {
    id: 'log-4',
    date: '2026-11-01 10:00',
    type: 'purchase',
    ingredientId: 'ing-2',
    ingredientName: 'Atlantic Salmon Fillet (Skin-on)',
    quantityDelta: 6,
    unit: 'kg',
    costImpact: 8700.00, // ₱8,700
    reference: 'PO-9462 - Ocean Harvest',
  },
];
