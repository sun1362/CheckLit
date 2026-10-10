import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, ProductCategory } from '../types';
import { apiService } from '../services/api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addCustomProduct = async (newProd: Omit<Product, 'id'>) => {
    setLoading(true);
    try {
      const added = await apiService.addProduct(newProd);
      setProducts((prev) => [...prev, added]);
      return added;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add custom product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Filtered Products computed derived state during render
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Vegetables',
    'Fruits',
    'Meat & Seafood',
    'Seasonings & Oils',
    'Dairy & Bakery',
    'Snacks & Beverages',
    'Other',
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
    addCustomProduct,
    fetchProducts,
  };
}
