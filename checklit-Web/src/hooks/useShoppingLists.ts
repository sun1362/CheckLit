import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ShoppingList } from '../types';
import { apiService } from '../services/api';

export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getLists();
      setLists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shopping lists.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const createList = async (newListData: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const created = await apiService.createList(newListData);
      setLists((prev) => [created, ...prev]);
      showSuccess(`Shopping list "${created.title}" created successfully!`);
      return created;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create list.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateList = async (id: string, updatedFields: Partial<ShoppingList>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiService.updateList(id, updatedFields);
      setLists((prev) => prev.map((l) => (l.id === id || l._id === id ? updated : l)));
      showSuccess(`List updated successfully!`);
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update list.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id && l._id !== id));
      showSuccess(`List deleted successfully.`);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete list.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemCompletion = async (listId: string, itemId: string) => {
    const targetList = lists.find((l) => l.id === listId || l._id === listId);
    if (!targetList) return;

    const updatedItems = targetList.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const allCompleted = updatedItems.length > 0 && updatedItems.every((i) => i.completed);
    const newStatus = allCompleted ? 'Completed' : updatedItems.some((i) => i.completed) ? 'In Progress' : 'Pending';

    await updateList(listId, { items: updatedItems, status: newStatus });
  };

  // Dynamic Derived Calculations (computed during render without redundant state)
  const stats = useMemo(() => {
    const totalListsCount = lists.length;
    const totalSpent = lists.reduce((acc, l) => acc + l.totalCost, 0);
    const activeListsCount = lists.filter((l) => l.status !== 'Completed').length;
    const completedListsCount = lists.filter((l) => l.status === 'Completed').length;
    const totalItemsCount = lists.reduce((acc, l) => acc + l.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0);
    const averageListCost = totalListsCount > 0 ? totalSpent / totalListsCount : 0;

    return {
      totalListsCount,
      totalSpent,
      activeListsCount,
      completedListsCount,
      totalItemsCount,
      averageListCost,
    };
  }, [lists]);

  return {
    lists,
    loading,
    error,
    successMessage,
    fetchLists,
    createList,
    updateList,
    deleteList,
    toggleItemCompletion,
    stats,
  };
}
