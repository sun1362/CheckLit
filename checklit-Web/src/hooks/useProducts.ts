
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, ProductCategory } from '../types';
import { PRODUCT_CATEGORIES } from '../types';
import { apiService, getApiErrorMessage } from '../services/api';

type ProductInput = Omit<
  Product,
  'id' | '_id' | 'createdAt' | 'updatedAt'
>;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | 'All'>('All');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Failed to load products.'
      );
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getProducts();

        if (active) {
          setProducts(data);
        }
      } catch (err) {
        if (active) {
          setError(
            getApiErrorMessage(err, 'Failed to load products.')
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const createProduct = async (newProduct: ProductInput) => {
    setError(null);

    try {
      const created = await apiService.addProduct(newProduct);

      setProducts((current) =>
        [...current, created].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      return created;
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Failed to create product.'
      );
      setError(message);
      throw new Error(message);
    }
  };

  const updateProduct = async (
    id: string,
    updatedFields: Partial<Product>
  ) => {
    setError(null);

    try {
      const updated = await apiService.updateProduct(id, updatedFields);

      setProducts((current) =>
        current.map((product) =>
          product.id === id || product._id === id
            ? updated
            : product
        )
      );

      return updated;
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Failed to update product.'
      );
      setError(message);
      throw new Error(message);
    }
  };

  const deleteProduct = async (id: string) => {
    setError(null);

    try {
      await apiService.deleteProduct(id);

      setProducts((current) =>
        current.filter(
          (product) => product.id !== id && product._id !== id
        )
      );
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Failed to delete product.'
      );
      setError(message);
      throw new Error(message);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        product.category === selectedCategory;

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.description ?? '').toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    ...PRODUCT_CATEGORIES,
  ];

  return {
    products,
    filteredProducts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    createProduct,
    updateProduct,
    deleteProduct,
    addCustomProduct: createProduct,
    fetchProducts,
  };
}
