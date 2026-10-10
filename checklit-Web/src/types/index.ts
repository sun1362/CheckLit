export type ProductCategory = 'Vegetables' | 'Fruits' | 'Meat & Seafood' | 'Seasonings & Oils' | 'Dairy & Bakery' | 'Snacks & Beverages' | 'Other';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unitPrice: number;
  unit: string; // e.g. "kg", "lb", "pack", "bottle", "piece"
  icon?: string;
  description?: string;
}

export interface ShoppingItem {
  id: string;
  productId?: string;
  name: string;
  category: ProductCategory;
  unitPrice: number;
  quantity: number;
  unit: string;
  totalPrice: number; // calculated unitPrice * quantity
  completed: boolean;
}

export interface ShoppingList {
  id: string;
  _id?: string;
  title: string;
  store: string;
  targetDate: string;
  budget: number;
  notes?: string;
  items: ShoppingItem[];
  totalCost: number; // calculated sum of item totalPrices
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string;
  defaultBudget: number;
}

export interface CategorySummary {
  category: ProductCategory;
  itemCount: number;
  totalAmount: number;
}
