
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '../types';
import { apiService, getApiErrorMessage } from '../services/api';

type NewProduct = Pick<
  Product,
  'name' | 'category' | 'unitPrice' | 'unit'
> &
  Partial<Pick<Product, 'icon' | 'description'>>;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryRecords, setCategoryRecords] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    setLoadingProducts(true);
    setError('');

    try {
      const data = await apiService.getProducts();
      setProducts(data);
      return data;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load products.'));
      throw err;
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    setLoadingCategories(true);
    setError('');

    try {
      const data = await apiService.getCategories();
      setCategoryRecords(data);
      return data;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load categories.'));
      throw err;
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts().catch(() => undefined);
    void fetchCategories().catch(() => undefined);
  }, [fetchProducts, fetchCategories]);

  const categories = useMemo(() => {
    const names = categoryRecords
      .map((category) => category.name)
      .filter((name) => name.trim() !== '')
      .filter(
        (name, index, namesList) =>
          namesList.findIndex(
            (candidate) => candidate.toLowerCase() === name.toLowerCase()
          ) === index
      );

    return ['All', ...names];
  }, [categoryRecords]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const searchableText = [
        product.name,
        product.category,
        product.description ?? '',
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        query.length === 0 || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const createProduct = useCallback(
    async (newProduct: NewProduct): Promise<Product> => {
      setIsMutating(true);
      setError('');
      setSuccessMessage('');

      try {
        const createdProduct = await apiService.addProduct(newProduct);

        setProducts((current) => {
          const exists = current.some(
            (product) => product.id === createdProduct.id
          );

          return exists
            ? current.map((product) =>
                product.id === createdProduct.id ? createdProduct : product
              )
            : [createdProduct, ...current];
        });

        setSuccessMessage('Product created successfully.');
        return createdProduct;
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to create product.'));
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (
      id: string,
      updates: Partial<Product>
    ): Promise<Product> => {
      setIsMutating(true);
      setError('');
      setSuccessMessage('');

      try {
        const updatedProduct = await apiService.updateProduct(id, updates);

        setProducts((current) =>
          current.map((product) =>
            product.id === id || product._id === id
              ? updatedProduct
              : product
          )
        );

        setSuccessMessage('Product updated successfully.');
        return updatedProduct;
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to update product.'));
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setIsMutating(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiService.deleteProduct(id);

      setProducts((current) =>
        current.filter(
          (product) => product.id !== id && product._id !== id
        )
      );

      setSuccessMessage('Product deleted successfully.');
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete product.'));
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMessage('');
  }, []);

  return {
    products,
    filteredProducts,
    categories,
    categoryRecords,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loading: loadingProducts || loadingCategories,
    loadingProducts,
    loadingCategories,
    isMutating,
    error,
    successMessage,
    fetchProducts,
    fetchCategories,
    createProduct,
    addCustomProduct: createProduct,
    updateProduct,
    deleteProduct,
    clearMessages,
  };
}
