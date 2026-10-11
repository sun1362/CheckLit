
export const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Meat',
  'Seafood',
  'Seasonings',
  'Oils',
  'Dairy',
  'Bakery',
  'Snacks',
  'Beverage',
  'Other',
] as const;

export type ProductCategory = string;

export const SHOPPING_LIST_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
] as const;

export type ShoppingListStatus =
  (typeof SHOPPING_LIST_STATUSES)[number];

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  category: ProductCategory;
  unitPrice: number;
  unit: string;
  icon?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShoppingItem {
  id: string;
  productId?: string;
  name: string;
  category: ProductCategory;
  unitPrice: number;
  quantity: number;
  unit: string;
  totalPrice: number;
  completed: boolean;
  purchaseDate?: string | null;
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
  totalCost: number;
  status: ShoppingListStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  currency?: string;
  defaultBudget?: number;
}

export interface CategorySummary {
  category: ProductCategory;
  itemCount: number;
  totalAmount: number;
}

export interface ApiMessageResponse {
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
