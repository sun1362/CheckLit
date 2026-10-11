
import axios from 'axios';
import type {
  ApiMessageResponse,
  AuthResponse,
  AuthUser,
  Product,
  ProductCategory,
  ShoppingItem,
  ShoppingList,
  ShoppingListStatus,
} from '../types';
import { PRODUCT_CATEGORIES } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AUTH_TOKEN_KEY = 'checklit_auth_token';
export const AUTH_USER_KEY = 'checklit_auth_user';

const GUEST_LISTS_KEY = 'checklit_guest_shopping_lists_v1';

type UnknownRecord = Record<string, unknown>;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);

    if (!raw) return null;

    const value = JSON.parse(raw) as Partial<AuthUser>;

    if (
      typeof value.id !== 'string' ||
      typeof value.name !== 'string' ||
      typeof value.email !== 'string' ||
      (value.role !== 'user' && value.role !== 'admin')
    ) {
      return null;
    }

    return {
      id: value.id,
      name: value.name,
      email: value.email,
      role: value.role,
    };
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/register')
    ) {
      clearAuthSession();
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as
      | { message?: unknown; error?: unknown }
      | undefined;

    if (typeof response?.message === 'string') {
      return response.message;
    }

    if (typeof response?.error === 'string') {
      return response.error;
    }

    if (error.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please try again.';
    }

    if (!error.response) {
      return 'Unable to reach the CheckLit server. Check that the backend is running.';
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function asRecord(value: unknown): UnknownRecord {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as UnknownRecord;
  }

  return {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function normalizeCategory(value: unknown): ProductCategory {
  const category = asString(value);

  return PRODUCT_CATEGORIES.find((item) => item === category) ?? 'Other';
}

function deriveListStatus(items: ShoppingItem[]): ShoppingListStatus {
  if (items.length === 0) return 'Pending';

  const completedCount = items.filter((item) => item.completed).length;

  if (completedCount === 0) return 'Pending';
  if (completedCount === items.length) return 'Completed';

  return 'In Progress';
}

function normalizeAuthResponse(value: unknown): AuthResponse {
  const raw = asRecord(value);
  const rawUser = asRecord(raw.user);
  const id = asString(rawUser.id, asString(rawUser._id));
  const token = asString(raw.token);
  const role = rawUser.role;

  if (
    !id ||
    !token ||
    !asString(rawUser.name) ||
    !asString(rawUser.email) ||
    (role !== 'user' && role !== 'admin')
  ) {
    throw new Error('The server returned an invalid authentication response.');
  }

  const user: AuthUser = {
    id,
    name: asString(rawUser.name),
    email: asString(rawUser.email),
    role,
  };

  return {
    message: asString(raw.message),
    token,
    user,
  };
}

function normalizeProduct(value: unknown): Product {
  const raw = asRecord(value);
  const id = asString(raw.id, asString(raw._id));

  if (!id) {
    throw new Error('The server returned a product without an ID.');
  }

  return {
    id,
    ...(raw._id ? { _id: asString(raw._id) } : {}),
    name: asString(raw.name),
    category: normalizeCategory(raw.category),
    unitPrice: asNumber(raw.unitPrice),
    unit: asString(raw.unit),
    icon: asString(raw.icon),
    description: asString(raw.description),
    ...(typeof raw.createdAt === 'string'
      ? { createdAt: raw.createdAt }
      : {}),
    ...(typeof raw.updatedAt === 'string'
      ? { updatedAt: raw.updatedAt }
      : {}),
  };
}

function normalizeItem(
  value: unknown,
  index: number,
  listId: string
): ShoppingItem {
  const raw = asRecord(value);
  const productId = asString(raw.productId);
  const name = asString(raw.name, 'Unnamed item');
  const unitPrice = asNumber(raw.unitPrice);
  const quantity = asNumber(raw.quantity);
  const totalPrice =
    Math.round((unitPrice * quantity + Number.EPSILON) * 100) / 100;

  const suppliedId = asString(raw.id, asString(raw._id));
  const id =
    suppliedId ||
    `${listId}-item-${index}-${productId || name.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id,
    ...(productId ? { productId } : {}),
    name,
    category: normalizeCategory(raw.category),
    unitPrice,
    quantity,
    unit: asString(raw.unit),
    totalPrice,
    completed: raw.completed === true,
    purchaseDate:
      typeof raw.purchaseDate === 'string' ? raw.purchaseDate : null,
  };
}

function normalizeList(value: unknown): ShoppingList {
  const raw = asRecord(value);
  const id = asString(raw.id, asString(raw._id));

  if (!id) {
    throw new Error('The server returned a shopping list without an ID.');
  }

  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items = rawItems.map((item, index) =>
    normalizeItem(item, index, id)
  );

  const totalCost =
    Math.round(
      (items.reduce((sum, item) => sum + item.totalPrice, 0) +
        Number.EPSILON) *
        100
    ) / 100;

  const createdAt = asString(raw.createdAt, new Date().toISOString());

  return {
    id,
    ...(raw._id ? { _id: asString(raw._id) } : {}),
    title: asString(raw.title),
    store: asString(raw.store),
    targetDate: asString(raw.targetDate),
    budget: asNumber(raw.budget),
    notes: asString(raw.notes),
    items,
    totalCost,
    status: deriveListStatus(items),
    createdAt,
    updatedAt: asString(raw.updatedAt, createdAt),
  };
}

function getGuestLists(): ShoppingList[] {
  try {
    const raw = sessionStorage.getItem(GUEST_LISTS_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeList);
  } catch {
    return [];
  }
}

function saveGuestLists(lists: ShoppingList[]): void {
  sessionStorage.setItem(GUEST_LISTS_KEY, JSON.stringify(lists));
}

function createGuestId(): string {
  return `guest-list-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function matchesListId(list: ShoppingList, id: string): boolean {
  return list.id === id || list._id === id;
}

function prepareItemPayload(item: ShoppingItem) {
  return {
    productId: item.productId ?? '',
    name: item.name,
    category: item.category,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    unit: item.unit,
    completed: item.completed,
  };
}

function prepareListPayload(
  fields: Partial<ShoppingList>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const allowedFields: (keyof ShoppingList)[] = [
    'title',
    'store',
    'targetDate',
    'budget',
    'notes',
    'items',
    'status',
  ];

  for (const field of allowedFields) {
    if (!Object.prototype.hasOwnProperty.call(fields, field)) continue;

    if (field === 'items' && Array.isArray(fields.items)) {
      payload.items = fields.items.map(prepareItemPayload);
      payload.status = deriveListStatus(fields.items);
    } else if (field === 'status' && Array.isArray(fields.items)) {
      continue;
    } else {
      payload[field] = fields[field];
    }
  }

  return payload;
}

export const apiService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<unknown>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const auth = normalizeAuthResponse(response.data);
    setAuthSession(auth.token, auth.user);

    return auth;
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await apiClient.post<unknown>('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    const auth = normalizeAuthResponse(response.data);
    setAuthSession(auth.token, auth.user);

    return auth;
  },

  async getLists(): Promise<ShoppingList[]> {
    if (!getAuthToken()) {
      return getGuestLists();
    }

    const response = await apiClient.get<unknown[]>('/lists');

    if (!Array.isArray(response.data)) {
      throw new Error('The server returned an invalid shopping-list response.');
    }

    return response.data.map(normalizeList);
  },

  async getListById(id: string): Promise<ShoppingList | null> {
    if (!getAuthToken()) {
      return getGuestLists().find((list) => matchesListId(list, id)) ?? null;
    }

    try {
      const response = await apiClient.get<unknown>(`/lists/${id}`);
      return normalizeList(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async createList(
    newList: Omit<
      ShoppingList,
      'id' | '_id' | 'createdAt' | 'updatedAt'
    >
  ): Promise<ShoppingList> {
    const payload = prepareListPayload(newList);

    if (getAuthToken()) {
      const response = await apiClient.post<unknown>('/lists', payload);
      return normalizeList(response.data);
    }

    const now = new Date().toISOString();
    const guestList = normalizeList({
      ...payload,
      id: createGuestId(),
      createdAt: now,
      updatedAt: now,
    });

    saveGuestLists([guestList, ...getGuestLists()]);

    return guestList;
  },

  async updateList(
    id: string,
    updatedFields: Partial<ShoppingList>
  ): Promise<ShoppingList> {
    const payload = prepareListPayload(updatedFields);

    if (getAuthToken()) {
      const response = await apiClient.put<unknown>(`/lists/${id}`, payload);
      return normalizeList(response.data);
    }

    const lists = getGuestLists();
    const index = lists.findIndex((list) => matchesListId(list, id));

    if (index === -1) {
      throw new Error('Guest shopping list not found.');
    }

    const current = lists[index];
    const updated = normalizeList({
      ...current,
      ...payload,
      id: current.id,
      _id: current._id,
      updatedAt: new Date().toISOString(),
    });

    const nextLists = [...lists];
    nextLists[index] = updated;
    saveGuestLists(nextLists);

    return updated;
  },

  async deleteList(id: string): Promise<boolean> {
    if (getAuthToken()) {
      await apiClient.delete(`/lists/${id}`);
      return true;
    }

    const lists = getGuestLists();
    const nextLists = lists.filter((list) => !matchesListId(list, id));

    if (nextLists.length === lists.length) {
      throw new Error('Guest shopping list not found.');
    }

    saveGuestLists(nextLists);
    return true;
  },

  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get<unknown[]>('/products');

    if (!Array.isArray(response.data)) {
      throw new Error('The server returned an invalid product response.');
    }

    return response.data.map(normalizeProduct);
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<unknown>(`/products/${id}`);
      return normalizeProduct(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async addProduct(
    newProduct: Omit<Product, 'id' | '_id'>
  ): Promise<Product> {
    const response = await apiClient.post<unknown>('/products', newProduct);
    return normalizeProduct(response.data);
  },

  async updateProduct(
    id: string,
    updatedFields: Partial<Product>
  ): Promise<Product> {
    const payload: Record<string, unknown> = {};

    const allowedFields: (keyof Product)[] = [
      'name',
      'category',
      'unitPrice',
      'unit',
      'icon',
      'description',
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updatedFields, field)) {
        payload[field] = updatedFields[field];
      }
    }

    const response = await apiClient.put<unknown>(`/products/${id}`, payload);

    return normalizeProduct(response.data);
  },

  async deleteProduct(id: string): Promise<boolean> {
    await apiClient.delete<ApiMessageResponse>(`/products/${id}`);
    return true;
  },
};
