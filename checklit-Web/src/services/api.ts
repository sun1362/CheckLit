import axios from 'axios';
import type { ShoppingList, Product } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SHOPPING_LISTS,
} from '../data/mockProducts';

// Single configured axios instance with baseURL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// LocalStorage Persistence Helpers
const LOCAL_STORAGE_LISTS_KEY = 'checklit_shopping_lists_v1';
const LOCAL_STORAGE_PRODUCTS_KEY = 'checklit_products_v1';

const getStoredLists = (): ShoppingList[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_LISTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading lists from localStorage', e);
  }

  localStorage.setItem(
    LOCAL_STORAGE_LISTS_KEY,
    JSON.stringify(INITIAL_SHOPPING_LISTS)
  );
  return INITIAL_SHOPPING_LISTS;
};

const setStoredLists = (lists: ShoppingList[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_LISTS_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error('Error writing lists to localStorage', e);
  }
};

const getStoredProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error reading products from localStorage', e);
  }

  localStorage.setItem(
    LOCAL_STORAGE_PRODUCTS_KEY,
    JSON.stringify(INITIAL_PRODUCTS)
  );
  return INITIAL_PRODUCTS;
};

const setStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error writing products to localStorage', e);
  }
};

// Helper to match frontend IDs and MongoDB IDs
const matchesProductId = (product: Product, id: string): boolean => {
  const productWithMongoId = product as Product & { _id?: string };
  return product.id === id || productWithMongoId._id === id;
};

// API Service Methods
// Attempts the backend API first, then falls back to LocalStorage.

export const apiService = {
  // --- Shopping Lists CRUD ---

  async getLists(): Promise<ShoppingList[]> {
    try {
      const response = await apiClient.get<ShoppingList[]>('/lists');
      if (response.data && Array.isArray(response.data)) {
        setStoredLists(response.data);
        return response.data;
      }
    } catch {
      // Fall back to LocalStorage
    }
    return getStoredLists();
  },

  async getListById(id: string): Promise<ShoppingList | null> {
    try {
      const response = await apiClient.get<ShoppingList>(`/lists/${id}`);
      if (response.data) return response.data;
    } catch {
      // Fall back to LocalStorage
    }

    const lists = getStoredLists();
    return lists.find((list) => list.id === id || list._id === id) || null;
  },

  async createList(
    newList: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ShoppingList> {
    const listToCreate: ShoppingList = {
      ...newList,
      id: `list-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await apiClient.post<ShoppingList>('/lists', newList);
      if (response.data) {
        const stored = getStoredLists();
        setStoredLists([response.data, ...stored]);
        return response.data;
      }
    } catch {
      // Fall back to LocalStorage
    }

    const stored = getStoredLists();
    const updated = [listToCreate, ...stored];
    setStoredLists(updated);
    return listToCreate;
  },

  async updateList(
    id: string,
    updatedFields: Partial<ShoppingList>
  ): Promise<ShoppingList> {
    try {
      const response = await apiClient.put<ShoppingList>(
        `/lists/${id}`,
        updatedFields
      );

      if (response.data) {
        const stored = getStoredLists();
        const updatedLists = stored.map((list) =>
          list.id === id || list._id === id ? response.data : list
        );
        setStoredLists(updatedLists);
        return response.data;
      }
    } catch {
      // Fall back to LocalStorage
    }

    const stored = getStoredLists();
    let updatedItem: ShoppingList | null = null;

    const updatedLists = stored.map((list) => {
      if (list.id === id || list._id === id) {
        updatedItem = {
          ...list,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      }
      return list;
    });

    if (updatedItem) {
      setStoredLists(updatedLists);
      return updatedItem;
    }

    throw new Error('List not found to update');
  },

  async deleteList(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/lists/${id}`);
    } catch {
      // Fall back to LocalStorage
    }

    const stored = getStoredLists();
    const filtered = stored.filter(
      (list) => list.id !== id && list._id !== id
    );
    setStoredLists(filtered);
    return true;
  },

  // --- Products Catalog CRUD ---

  async getProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products');
      if (response.data && Array.isArray(response.data)) {
        setStoredProducts(response.data);
        return response.data;
      }
    } catch {
      // Fall back to LocalStorage
    }
    return getStoredProducts();
  },

  async addProduct(newProduct: Omit<Product, 'id'>): Promise<Product> {
    const product: Product = {
      ...newProduct,
      id: `p-${Date.now()}`,
    };

    try {
      const response = await apiClient.post<Product>('/products', newProduct);
      if (response.data) {
        const stored = getStoredProducts();
        setStoredProducts([...stored, response.data]);
        return response.data;
      }
    } catch {
      // Fall back to LocalStorage
    }

    const stored = getStoredProducts();
    setStoredProducts([...stored, product]);
    return product;
  },

  async updateProduct(
    id: string,
    updatedFields: Partial<Product>
  ): Promise<Product> {
    try {
      const response = await apiClient.put<Product>(
        `/products/${id}`,
        updatedFields
      );

      if (response.data) {
        const stored = getStoredProducts();
        const updatedProducts = stored.map((product) =>
          matchesProductId(product, id) ? response.data : product
        );
        setStoredProducts(updatedProducts);
        return response.data;
      }
    } catch {
      // Fall back to LocalStorage
    }

    const stored = getStoredProducts();
    let updatedProduct: Product | null = null;

    const updatedProducts = stored.map((product) => {
      if (matchesProductId(product, id)) {
        updatedProduct = { ...product, ...updatedFields };
        return updatedProduct;
      }
      return product;
    });

    if (updatedProduct) {
      setStoredProducts(updatedProducts);
      return updatedProduct;
    }

    throw new Error('Product not found to update');
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/products/${id}`);

      const stored = getStoredProducts();
      setStoredProducts(
        stored.filter((product) => !matchesProductId(product, id))
      );
      return true;
    } catch {
      // Fall back to LocalStorage
    }

    const stored = getStoredProducts();
    const filtered = stored.filter(
      (product) => !matchesProductId(product, id)
    );

    if (filtered.length === stored.length) {
      throw new Error('Product not found to delete');
    }

    setStoredProducts(filtered);
    return true;
  },
};
