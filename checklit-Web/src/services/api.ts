
import axios from 'axios';
import type {
  ApiMessageResponse,
  AuthResponse,
  AuthUser,
  Category,
  Product,
  ShoppingItem,
  ShoppingList,
  ShoppingListStatus,
  UserProfile,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AUTH_TOKEN_KEY = 'checklit_auth_token';
export const AUTH_USER_KEY = 'checklit_auth_user';
export const GUEST_LISTS_KEY = 'checklit_guest_shopping_lists_v1';

type UnknownRecord = Record<string, unknown>;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('checklit-auth-changed'));
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  try {
    const rawUser = localStorage.getItem(AUTH_USER_KEY);

    if (!rawUser) return null;

    const raw = JSON.parse(rawUser) as Partial<AuthUser>;

    if (
      typeof raw.id !== 'string' ||
      typeof raw.name !== 'string' ||
      typeof raw.email !== 'string' ||
      (raw.role !== 'user' && raw.role !== 'admin')
    ) {
      return null;
    }

    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      role: raw.role,
    };
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  notifyAuthChanged();
}

export function clearGuestLists(): void {
  sessionStorage.removeItem(GUEST_LISTS_KEY);
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: unknown;
          error?: unknown;
        }
      | undefined;

    if (typeof data?.message === 'string') {
      return data.message;
    }

    if (typeof data?.error === 'string') {
      return data.error;
    }

    if (error.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please try again.';
    }

    if (!error.response) {
      return 'Unable to reach the CheckLit server. Make sure the backend is running.';
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers.Authorization) {
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
      !String(error.config?.url ?? '').startsWith('/auth/')
    ) {
      clearAuthSession();
    }

    return Promise.reject(error);
  }
);

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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

  return {
    message: asString(raw.message),
    token,
    user: {
      id,
      name: asString(rawUser.name),
      email: asString(rawUser.email),
      role,
    },
  };
}

function normalizeCategory(value: unknown): Category {
  const wrapper = asRecord(value);
  const raw =
    wrapper.category && typeof wrapper.category === 'object'
      ? asRecord(wrapper.category)
      : wrapper;

  const id = asString(raw.id, asString(raw._id));

  if (!id) {
    throw new Error('The server returned a category without an ID.');
  }

  return {
    id,
    ...(raw._id ? { _id: asString(raw._id) } : {}),
    name: asString(raw.name),
    description: asString(raw.description),
    ...(typeof raw.createdAt === 'string'
      ? { createdAt: raw.createdAt }
      : {}),
    ...(typeof raw.updatedAt === 'string'
      ? { updatedAt: raw.updatedAt }
      : {}),
  };
}

function normalizeProduct(value: unknown): Product {
  const wrapper = asRecord(value);
  const raw =
    wrapper.product && typeof wrapper.product === 'object'
      ? asRecord(wrapper.product)
      : wrapper;

  const id = asString(raw.id, asString(raw._id));

  if (!id) {
    throw new Error('The server returned a product without an ID.');
  }

  return {
    id,
    ...(raw._id ? { _id: asString(raw._id) } : {}),
    name: asString(raw.name),
    category: asString(raw.category, 'Other'),
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

function normalizeProfile(value: unknown): UserProfile {
  const wrapper = asRecord(value);
  const raw =
    wrapper.user && typeof wrapper.user === 'object'
      ? asRecord(wrapper.user)
      : wrapper;

  const id = asString(raw.id, asString(raw._id));
  const role = raw.role;

  return {
    ...(id ? { id } : {}),
    name: asString(raw.name),
    email: asString(raw.email),
    ...(role === 'user' || role === 'admin' ? { role } : {}),
    ...(typeof raw.currency === 'string'
      ? { currency: raw.currency }
      : {}),
    ...(typeof raw.defaultBudget === 'number'
      ? { defaultBudget: raw.defaultBudget }
      : {}),
    ...(typeof raw.createdAt === 'string'
      ? { createdAt: raw.createdAt }
      : {}),
    ...(typeof raw.updatedAt === 'string'
      ? { updatedAt: raw.updatedAt }
      : {}),
  };
}

function deriveListStatus(items: ShoppingItem[]): ShoppingListStatus {
  if (items.length === 0) {
    return 'Pending';
  }

  const completedCount = items.filter((item) => item.completed).length;

  if (completedCount === 0) {
    return 'Pending';
  }

  if (completedCount === items.length) {
    return 'Completed';
  }

  return 'In Progress';
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
  const id = asString(
    raw.id,
    asString(raw._id) ||
      `${listId}-item-${index}-${productId || name.toLowerCase().replace(/\s+/g, '-')}`
  );

  return {
    id,
    ...(raw._id ? { _id: asString(raw._id) } : {}),
    ...(productId ? { productId } : {}),
    name,
    category: asString(raw.category, 'Other'),
    unitPrice,
    quantity,
    unit: asString(raw.unit),
    totalPrice: roundMoney(unitPrice * quantity),
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

  const totalCost = roundMoney(
    items.reduce((sum, item) => sum + item.totalPrice, 0)
  );

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

    return Array.isArray(parsed)
      ? parsed.map(normalizeList)
      : [];
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

function serializeItems(items: ShoppingItem[]): UnknownRecord[] {
  return items.map((item) => ({
    ...(item.productId ? { productId: item.productId } : {}),
    name: item.name,
    category: item.category,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    unit: item.unit,
    completed: item.completed,
  }));
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
  ];

  for (const field of allowedFields) {
    if (!Object.prototype.hasOwnProperty.call(fields, field)) {
      continue;
    }

    const value = fields[field];

    payload[field] =
      field === 'items' && Array.isArray(value)
        ? serializeItems(value)
        : value;
  }

  if (Array.isArray(fields.items)) {
    payload.items = serializeItems(fields.items);
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
      role: 'user',
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
      const response = await apiClient.get<unknown>(
        `/lists/${encodeURIComponent(id)}`
      );

      return normalizeList(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  },

  async createList(
    newList: Omit<ShoppingList, 'id' | '_id' | 'createdAt' | 'updatedAt'>
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
      const response = await apiClient.put<unknown>(
        `/lists/${encodeURIComponent(id)}`,
        payload
      );

      return normalizeList(response.data);
    }

    const lists = getGuestLists();
    const index = lists.findIndex((list) => matchesListId(list, id));

    if (index < 0) {
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

    const next = [...lists];
    next[index] = updated;
    saveGuestLists(next);

    return updated;
  },

  async deleteList(id: string): Promise<boolean> {
    if (getAuthToken()) {
      await apiClient.delete(`/lists/${encodeURIComponent(id)}`);
      return true;
    }

    const lists = getGuestLists();
    const next = lists.filter((list) => !matchesListId(list, id));

    if (next.length === lists.length) {
      throw new Error('Guest shopping list not found.');
    }

    saveGuestLists(next);

    return true;
  },

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<unknown[]>('/categories');

    if (!Array.isArray(response.data)) {
      throw new Error('The server returned an invalid category response.');
    }

    return response.data.map(normalizeCategory);
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<unknown>(
      `/categories/${encodeURIComponent(id)}`
    );

    return normalizeCategory(response.data);
  },

  async addCategory(
    newCategory: Pick<Category, 'name'> &
      Partial<Pick<Category, 'description'>>
  ): Promise<Category> {
    const response = await apiClient.post<unknown>('/categories', {
      name: newCategory.name.trim(),
      description: newCategory.description?.trim() ?? '',
    });

    return normalizeCategory(response.data);
  },

  async updateCategory(
    id: string,
    updatedFields: Partial<Pick<Category, 'name' | 'description'>>
  ): Promise<Category> {
    const payload: Record<string, unknown> = {};

    if (typeof updatedFields.name === 'string') {
      payload.name = updatedFields.name.trim();
    }

    if (typeof updatedFields.description === 'string') {
      payload.description = updatedFields.description.trim();
    }

    const response = await apiClient.put<unknown>(
      `/categories/${encodeURIComponent(id)}`,
      payload
    );

    return normalizeCategory(response.data);
  },

  async deleteCategory(id: string): Promise<boolean> {
    await apiClient.delete(`/categories/${encodeURIComponent(id)}`);
    return true;
  },

  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get<unknown[]>('/products');

    if (!Array.isArray(response.data)) {
      throw new Error('The server returned an invalid product response.');
    }

    return response.data.map(normalizeProduct);
  },

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<unknown>(
      `/products/${encodeURIComponent(id)}`
    );

    return normalizeProduct(response.data);
  },

  async addProduct(
    newProduct: Pick<
      Product,
      'name' | 'category' | 'unitPrice' | 'unit'
    > &
      Partial<Pick<Product, 'icon' | 'description'>>
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

    const response = await apiClient.put<unknown>(
      `/products/${encodeURIComponent(id)}`,
      payload
    );

    return normalizeProduct(response.data);
  },

  async deleteProduct(id: string): Promise<boolean> {
    await apiClient.delete(`/products/${encodeURIComponent(id)}`);
    return true;
  },

  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<unknown>('/profile');
    return normalizeProfile(response.data);
  },

  async updateProfile(
    updates: Partial<Pick<UserProfile, 'name'>>
  ): Promise<UserProfile> {
    const payload: Record<string, unknown> = {};

    if (typeof updates.name === 'string') {
      payload.name = updates.name.trim();
    }

    const response = await apiClient.put<unknown>('/profile', payload);
    return normalizeProfile(response.data);
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiMessageResponse> {
    const response = await apiClient.patch<unknown>('/profile/password', {
      currentPassword,
      newPassword,
    });

    const raw = asRecord(response.data);

    return {
      message: asString(raw.message, 'Password updated successfully.'),
    };
  },
};
