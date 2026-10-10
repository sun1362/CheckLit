import type { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // Vegetables
  { id: 'p1', name: 'Fresh Tomato', category: 'Vegetables', unitPrice: 85.00, unit: 'kg', icon: '🍅', description: 'Ripe red organic tomatoes' },
  { id: 'p2', name: 'Spinach Bunch', category: 'Vegetables', unitPrice: 45.00, unit: 'pack', icon: '🥬', description: 'Fresh green leafy spinach' },
  { id: 'p3', name: 'Red Onion', category: 'Vegetables', unitPrice: 120.00, unit: 'kg', icon: '🧅', description: 'Crisp red onions' },
  { id: 'p4', name: 'Carrots', category: 'Vegetables', unitPrice: 75.00, unit: 'kg', icon: '🥕', description: 'Sweet crunchy carrots' },
  { id: 'p5', name: 'Potatoes', category: 'Vegetables', unitPrice: 110.00, unit: 'bag (2kg)', icon: '🥔', description: 'Baking potatoes' },
  { id: 'p6', name: 'Fresh Garlic', category: 'Vegetables', unitPrice: 35.00, unit: 'head', icon: '🧄', description: 'Aromatic garlic bulb' },
  { id: 'p7', name: 'Broccoli Head', category: 'Vegetables', unitPrice: 130.00, unit: 'piece', icon: '🥦', description: 'Fresh green broccoli florets' },
  { id: 'p8', name: 'Bell Pepper Set', category: 'Vegetables', unitPrice: 150.00, unit: 'pack (3pcs)', icon: '🫑', description: 'Trio of red, yellow, and green peppers' },

  // Fruits
  { id: 'p9', name: 'Fuji Apples', category: 'Fruits', unitPrice: 160.00, unit: 'kg', icon: '🍎', description: 'Sweet and crisp Fuji apples' },
  { id: 'p10', name: 'Organic Bananas', category: 'Fruits', unitPrice: 80.00, unit: 'bunch', icon: '🍌', description: 'Fresh ripe yellow bananas' },
  { id: 'p11', name: 'Sweet Mangoes', category: 'Fruits', unitPrice: 180.00, unit: 'kg', icon: '🥭', description: 'Juicy yellow mangoes' },
  { id: 'p12', name: 'Navel Oranges', category: 'Fruits', unitPrice: 140.00, unit: 'kg', icon: '🍊', description: 'Juicy citrus oranges' },
  { id: 'p13', name: 'Fresh Strawberries', category: 'Fruits', unitPrice: 250.00, unit: 'punnet', icon: '🍓', description: 'Sweet farm strawberries' },
  { id: 'p14', name: 'Hass Avocado', category: 'Fruits', unitPrice: 95.00, unit: 'piece', icon: '🥑', description: 'Creamy Hass avocados' },
  { id: 'p15', name: 'Fresh Lemons', category: 'Fruits', unitPrice: 85.00, unit: 'pack (4pcs)', icon: '🍋', description: 'Zesty fresh yellow lemons' },

  // Meat & Seafood
  { id: 'p16', name: 'Chicken Breast', category: 'Meat & Seafood', unitPrice: 280.00, unit: 'kg', icon: '🍗', description: 'Boneless skinless chicken breast' },
  { id: 'p17', name: 'Lean Ground Beef', category: 'Meat & Seafood', unitPrice: 390.00, unit: 'kg', icon: '🥩', description: '90% lean ground beef' },
  { id: 'p18', name: 'Pork Chops', category: 'Meat & Seafood', unitPrice: 320.00, unit: 'kg', icon: '🥩', description: 'Fresh bone-in pork chops' },
  { id: 'p19', name: 'Atlantic Salmon Fillet', category: 'Meat & Seafood', unitPrice: 750.00, unit: 'kg', icon: '🐟', description: 'Wild-caught fresh salmon' },
  { id: 'p20', name: 'Smoked Bacon', category: 'Meat & Seafood', unitPrice: 230.00, unit: 'pack (350g)', icon: '🥓', description: 'Crispy thick-cut smoked bacon' },
  { id: 'p21', name: 'Fresh Jumbo Shrimp', category: 'Meat & Seafood', unitPrice: 580.00, unit: 'kg', icon: '🦐', description: 'Peeled and deveined shrimp' },

  // Seasonings & Oils
  { id: 'p22', name: 'Fine Sea Salt', category: 'Seasonings & Oils', unitPrice: 45.00, unit: 'container', icon: '🧂', description: 'Pure iodized sea salt' },
  { id: 'p23', name: 'Black Peppercorns', category: 'Seasonings & Oils', unitPrice: 120.00, unit: 'grinder', icon: '🧂', description: 'Whole black pepper with grinder' },
  { id: 'p24', name: 'Soy Sauce', category: 'Seasonings & Oils', unitPrice: 85.00, unit: 'bottle (500ml)', icon: '🍶', description: 'Naturally brewed soy sauce' },
  { id: 'p25', name: 'Extra Virgin Olive Oil', category: 'Seasonings & Oils', unitPrice: 420.00, unit: 'bottle (750ml)', icon: '🫒', description: 'Cold-pressed extra virgin olive oil' },
  { id: 'p26', name: 'Garlic Powder', category: 'Seasonings & Oils', unitPrice: 95.00, unit: 'jar', icon: '🧄', description: 'Aromatic garlic spice powder' },
  { id: 'p27', name: 'Paprika Powder', category: 'Seasonings & Oils', unitPrice: 110.00, unit: 'jar', icon: '🌶️', description: 'Sweet smoked paprika' },

  // Dairy & Bakery
  { id: 'p28', name: 'Whole Milk', category: 'Dairy & Bakery', unitPrice: 115.00, unit: 'liter', icon: '🥛', description: 'Pasteurized whole milk' },
  { id: 'p29', name: 'Large Eggs', category: 'Dairy & Bakery', unitPrice: 210.00, unit: 'carton (12pcs)', icon: '🥚', description: 'Farm fresh grade A eggs' },
  { id: 'p30', name: 'Cheddar Cheese', category: 'Dairy & Bakery', unitPrice: 195.00, unit: 'block (300g)', icon: '🧀', description: 'Aged sharp cheddar cheese' },
  { id: 'p31', name: 'Whole Wheat Bread', category: 'Dairy & Bakery', unitPrice: 85.00, unit: 'loaf', icon: '🍞', description: '100% whole grain bread' },
  { id: 'p32', name: 'Unsalted Butter', category: 'Dairy & Bakery', unitPrice: 165.00, unit: 'pack (225g)', icon: '🧈', description: 'Sweet cream unsalted butter' },

  // Snacks & Beverages
  { id: 'p33', name: 'Roasted Coffee Beans', category: 'Snacks & Beverages', unitPrice: 450.00, unit: 'bag (500g)', icon: '☕', description: 'Medium roast Arabica coffee' },
  { id: 'p34', name: 'Green Tea Bags', category: 'Snacks & Beverages', unitPrice: 140.00, unit: 'box (25pcs)', icon: '🍵', description: 'Organic green tea bags' },
  { id: 'p35', name: '100% Orange Juice', category: 'Snacks & Beverages', unitPrice: 165.00, unit: 'carton (1.5L)', icon: '🧃', description: 'Pure orange juice with pulp' },
  { id: 'p36', name: 'Classic Potato Chips', category: 'Snacks & Beverages', unitPrice: 95.00, unit: 'bag', icon: '🥔', description: 'Crispy salted potato chips' },
];

export const INITIAL_SHOPPING_LISTS = [
  {
    id: 'list-101',
    title: 'Weekly Family Grocery',
    store: 'Fresh Foods Market',
    targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    budget: 2500.00,
    notes: 'Need fresh produce and meat for the week recipes.',
    status: 'Pending' as const,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { id: 'item-1', productId: 'p1', name: 'Fresh Tomato', category: 'Vegetables' as const, unitPrice: 85.00, quantity: 2, unit: 'kg', totalPrice: 170.00, completed: false },
      { id: 'item-2', productId: 'p16', name: 'Chicken Breast', category: 'Meat & Seafood' as const, unitPrice: 280.00, quantity: 2, unit: 'kg', totalPrice: 560.00, completed: false },
      { id: 'item-3', productId: 'p28', name: 'Whole Milk', category: 'Dairy & Bakery' as const, unitPrice: 115.00, quantity: 2, unit: 'liter', totalPrice: 230.00, completed: true },
      { id: 'item-4', productId: 'p29', name: 'Large Eggs', category: 'Dairy & Bakery' as const, unitPrice: 210.00, quantity: 1, unit: 'carton (12pcs)', totalPrice: 210.00, completed: false },
      { id: 'item-5', productId: 'p25', name: 'Extra Virgin Olive Oil', category: 'Seasonings & Oils' as const, unitPrice: 420.00, quantity: 1, unit: 'bottle (750ml)', totalPrice: 420.00, completed: true },
    ],
    totalCost: 1590.00
  },
  {
    id: 'list-102',
    title: 'Weekend BBQ Party',
    store: 'Meat Crafters Superstore',
    targetDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    budget: 3500.00,
    notes: 'Ingredients for grilling with friends.',
    status: 'In Progress' as const,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { id: 'item-6', productId: 'p17', name: 'Lean Ground Beef', category: 'Meat & Seafood' as const, unitPrice: 390.00, quantity: 3, unit: 'kg', totalPrice: 1170.00, completed: true },
      { id: 'item-7', productId: 'p20', name: 'Smoked Bacon', category: 'Meat & Seafood' as const, unitPrice: 230.00, quantity: 2, unit: 'pack (350g)', totalPrice: 460.00, completed: true },
      { id: 'item-8', productId: 'p3', name: 'Red Onion', category: 'Vegetables' as const, unitPrice: 120.00, quantity: 2, unit: 'kg', totalPrice: 240.00, completed: false },
      { id: 'item-9', productId: 'p36', name: 'Classic Potato Chips', category: 'Snacks & Beverages' as const, unitPrice: 95.00, quantity: 4, unit: 'bag', totalPrice: 380.00, completed: false },
    ],
    totalCost: 2250.00
  }
];
