
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ShoppingItem, ShoppingList, ShoppingListStatus } from '../types';
import { apiService, getApiErrorMessage } from '../services/api';

type NewShoppingList = Omit<
  ShoppingList,
  'id' | '_id' | 'createdAt' | 'updatedAt'
>;

function calculateItemTotal(item: ShoppingItem): number {
  return Math.round((item.unitPrice * item.quantity + Number.EPSILON) * 100) / 100;
}

function calculateListTotal(items: ShoppingItem[]): number {
  return Math.round(
    (items.reduce((total, item) => total + calculateItemTotal(item), 0) +
      Number.EPSILON) *
      100
  ) / 100;
}

function calculateListStatus(items: ShoppingItem[]): ShoppingListStatus {
  if (items.length === 0) {
    return 'Pending';
  }

  const purchasedCount = items.filter((item) => item.completed).length;

  if (purchasedCount === 0) {
    return 'Pending';
  }

  if (purchasedCount === items.length) {
    return 'Completed';
  }

  return 'In Progress';
}

function normalizeList(list: ShoppingList): ShoppingList {
  const items = list.items.map((item) => ({
    ...item,
    totalPrice: calculateItemTotal(item),
  }));

  return {
    ...list,
    items,
    totalCost: calculateListTotal(items),
    status: calculateListStatus(items),
  };
}

function matchesListId(list: ShoppingList, id: string): boolean {
  return list.id === id || list._id === id;
}

export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getLists();
      setLists(data.map(normalizeList));
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Failed to load shopping lists.'
      );
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadLists = async () => {
      try {
        const data = await apiService.getLists();

        if (active) {
          setLists(data.map(normalizeList));
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(
            getApiErrorMessage(err, 'Failed to load shopping lists.')
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadLists();

    return () => {
      active = false;
    };
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const createList = async (newListData: NewShoppingList) => {
    clearMessages();
    setIsMutating(true);

    try {
      const normalizedData = normalizeList({
        ...newListData,
        id: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const created = await apiService.createList({
        ...normalizedData,
        status: calculateListStatus(normalizedData.items),
        totalCost: calculateListTotal(normalizedData.items),
      });

      const normalizedCreated = normalizeList(created);

      setLists((previous) => [
        normalizedCreated,
        ...previous.filter(
          (list) => !matchesListId(list, normalizedCreated.id)
        ),
      ]);

      showSuccess(`Shopping list "${normalizedCreated.title}" created.`);
      return normalizedCreated;
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Failed to create shopping list.'
      );
      setError(message);
      throw new Error(message);
    } finally {
      setIsMutating(false);
    }
  };

  const updateList = async (
    id: string,
    updatedFields: Partial<ShoppingList>
  ) => {
    clearMessages();
    setIsMutating(true);

    try {
      const existing = lists.find((list) => matchesListId(list, id));

      const nextItems = (
        updatedFields.items ?? existing?.items ?? []
      ).map((item) => ({
        ...item,
        totalPrice: calculateItemTotal(item),
      }));

      const payload: Partial<ShoppingList> = {
        ...updatedFields,
        items: updatedFields.items ? nextItems : undefined,
        status: calculateListStatus(nextItems),
        totalCost: calculateListTotal(nextItems),
      };

      const updated = await apiService.updateList(id, payload);
      const normalizedUpdated = normalizeList(updated);

      setLists((previous) =>
        previous.map((list) =>
          matchesListId(list, id) ? normalizedUpdated : list
        )
      );

      showSuccess(`Shopping list "${normalizedUpdated.title}" updated.`);
      return normalizedUpdated;
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Failed to update shopping list.'
      );
      setError(message);
      throw new Error(message);
    } finally {
      setIsMutating(false);
    }
  };

  const deleteList = async (id: string) => {
    clearMessages();
    setIsMutating(true);

    try {
      await apiService.deleteList(id);

      setLists((previous) =>
        previous.filter((list) => !matchesListId(list, id))
      );

      showSuccess('Shopping list deleted successfully.');
      return true;
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        'Failed to delete shopping list.'
      );
      setError(message);
      throw new Error(message);
    } finally {
      setIsMutating(false);
    }
  };

  const toggleItemCompletion = async (
    listId: string,
    itemId: string
  ) => {
    const targetList = lists.find((list) =>
      matchesListId(list, listId)
    );

    if (!targetList) {
      throw new Error('Shopping list not found.');
    }

    const targetItem = targetList.items.find(
      (item) => item.id === itemId
    );

    if (!targetItem) {
      throw new Error('Shopping list item not found.');
    }

    const updatedItems = targetList.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            completed: !item.completed,
            totalPrice: calculateItemTotal(item),
          }
        : item
    );

    return updateList(listId, {
      items: updatedItems,
      status: calculateListStatus(updatedItems),
      totalCost: calculateListTotal(updatedItems),
    });
  };

  const stats = useMemo(() => {
    const totalListsCount = lists.length;

    const activeListsCount = lists.filter(
      (list) => calculateListStatus(list.items) !== 'Completed'
    ).length;

    const completedListsCount = lists.filter(
      (list) => calculateListStatus(list.items) === 'Completed'
    ).length;

    const totalSpent = lists.reduce(
      (total, list) =>
        total +
        list.items
          .filter((item) => item.completed)
          .reduce((itemTotal, item) => itemTotal + item.totalPrice, 0),
      0
    );

    const totalItemsCount = lists.reduce(
      (total, list) =>
        total + list.items.reduce((quantity, item) => quantity + item.quantity, 0),
      0
    );

    const averageListCost =
      totalListsCount > 0
        ? lists.reduce((total, list) => total + list.totalCost, 0) /
          totalListsCount
        : 0;

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
    isMutating,
    error,
    successMessage,
    fetchLists,
    createList,
    updateList,
    deleteList,
    toggleItemCompletion,
    stats,
    clearMessages,
  };
}
