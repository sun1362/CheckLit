import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  Check,
  LoaderCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useShoppingLists } from '../hooks/useShoppingLists';
import type { Product, ShoppingItem, ShoppingListStatus } from '../types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);

const MAX_BUDGET = 1_000_000;

const shoppingListSchema = z.object({
  listTitle: z
    .string()
    .trim()
    .min(1, 'Enter a title for your shopping list.')
    .max(150, 'The list title cannot exceed 150 characters.'),
  storeName: z.string().trim().max(150, 'Store name cannot exceed 150 characters.'),
  targetDate: z.string(),
  budget: z.string().refine(
    (value) =>
      value.trim() === '' ||
      (Number.isFinite(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= MAX_BUDGET),
    'Budget must be between ₱0 and ₱1,000,000, or left blank.'
  ),
  notes: z.string().max(2000, 'Notes cannot exceed 2000 characters.'),
});

type ShoppingListFormValues = z.infer<typeof shoppingListSchema>;

const defaultListFormValues: ShoppingListFormValues = {
  listTitle: '',
  storeName: '',
  targetDate: '',
  budget: '',
  notes: '',
};

const roundCurrency = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

const createItemId = () =>
  `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const calculateStatus = (items: ShoppingItem[]): ShoppingListStatus => {
  if (items.length === 0) return 'Pending';

  const purchasedCount = items.filter((item) => item.completed).length;

  if (purchasedCount === 0) return 'Pending';
  if (purchasedCount === items.length) return 'Completed';

  return 'In Progress';
};

export const CreateListPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    filteredProducts,
    loading: productsLoading,
    error: productsError,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    fetchProducts,
  } = useProducts();

  const {
    lists,
    createList,
    updateList,
    loading: listsLoading,
    isMutating,
    error: listsError,
  } = useShoppingLists();

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShoppingListFormValues>({
    resolver: zodResolver(shoppingListSchema),
    defaultValues: defaultListFormValues,
    mode: 'onBlur',
  });

  const budget = watch('budget');
  const [selectedItems, setSelectedItems] = useState<ShoppingItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [initializedListId, setInitializedListId] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode) {
      if (initializedListId !== null) {
        reset(defaultListFormValues);
        setSelectedItems([]);
        setFormError(null);
        setInitializedListId(null);
      }
      return;
    }

    if (!id || listsLoading || initializedListId === id) return;

    const existing = lists.find(
      (list) => list.id === id || list._id === id
    );

    if (!existing) {
      setFormError('Shopping list not found or could not be loaded.');
      setInitializedListId(id);
      return;
    }

    reset({
      listTitle: existing.title,
      storeName: existing.store || '',
      targetDate: existing.targetDate || '',
      budget: existing.budget > 0 ? String(existing.budget) : '',
      notes: existing.notes || '',
    });
    setSelectedItems(
      existing.items.map((item) => ({
        ...item,
        totalPrice: roundCurrency(item.unitPrice * item.quantity),
      }))
    );
    setFormError(null);
    setInitializedListId(id);
  }, [id, isEditMode, lists, listsLoading, initializedListId, reset]);

  const selectedItemsWithTotals = useMemo(
    () =>
      selectedItems.map((item) => ({
        ...item,
        totalPrice: roundCurrency(item.unitPrice * item.quantity),
      })),
    [selectedItems]
  );

  const grandTotalCost = useMemo(
    () =>
      roundCurrency(
        selectedItemsWithTotals.reduce(
          (total, item) => total + item.totalPrice,
          0
        )
      ),
    [selectedItemsWithTotals]
  );

  const totalQuantity = useMemo(
    () =>
      selectedItemsWithTotals.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [selectedItemsWithTotals]
  );

  const budgetValue = budget.trim() === '' ? null : Number(budget);
  const isOverBudget =
    budgetValue !== null &&
    Number.isFinite(budgetValue) &&
    budgetValue > 0 &&
    grandTotalCost > budgetValue;

  const categoryBreakdown = useMemo(
    () =>
      selectedItemsWithTotals.reduce<Record<string, number>>(
        (result, item) => {
          result[item.category] =
            (result[item.category] || 0) + item.totalPrice;
          return result;
        },
        {}
      ),
    [selectedItemsWithTotals]
  );

  const addProduct = (product: Product) => {
    setFormError(null);

    setSelectedItems((current) => {
      const existing = current.find(
        (item) => item.productId === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                unitPrice: product.unitPrice,
                name: product.name,
                category: product.category,
                unit: product.unit,
                quantity: roundCurrency(item.quantity + 1),
                totalPrice: roundCurrency(
                  product.unitPrice * (item.quantity + 1)
                ),
              }
            : item
        );
      }

      return [
        ...current,
        {
          id: createItemId(),
          productId: product.id,
          name: product.name,
          category: product.category,
          unitPrice: product.unitPrice,
          quantity: 1,
          unit: product.unit,
          totalPrice: roundCurrency(product.unitPrice),
          completed: false,
          purchaseDate: null,
        },
      ];
    });
  };

  const changeQuantity = (itemId: string, value: string) => {
    const quantity = value === '' ? 0 : Number(value);

    if (!Number.isFinite(quantity) || quantity < 0) return;

    setSelectedItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: roundCurrency(item.unitPrice * quantity),
            }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setSelectedItems((current) =>
      current.filter((item) => item.id !== itemId)
    );
  };

  const handleSaveList = async (values: ShoppingListFormValues) => {
    setFormError(null);

    const parsedBudget = values.budget.trim() === '' ? null : Number(values.budget);

    if (parsedBudget !== null && parsedBudget > MAX_BUDGET) {
      setFormError('The budget cannot exceed ₱1,000,000.');
      return;
    }

    if (
      parsedBudget !== null &&
      (!Number.isFinite(parsedBudget) || parsedBudget < 0)
    ) {
      setFormError('Enter a valid non-negative budget or leave it blank.');
      return;
    }

    if (
      selectedItemsWithTotals.some(
        (item) =>
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.unitPrice) ||
          item.unitPrice < 0
      )
    ) {
      setFormError(
        'Each selected product must have a positive quantity and a valid price.'
      );
      return;
    }

    if (selectedItemsWithTotals.some((item) => !item.productId)) {
      setFormError('One or more items are missing their product identifiers.');
      return;
    }

    const itemsToSave = selectedItemsWithTotals.map((item) => ({
      ...item,
      totalPrice: roundCurrency(item.unitPrice * item.quantity),
    }));

    const payload = {
      title: values.listTitle.trim(),
      store: values.storeName.trim(),
      targetDate: values.targetDate,
      budget: parsedBudget ?? 0,
      notes: values.notes.trim(),
      items: itemsToSave,
      totalCost: grandTotalCost,
      status: calculateStatus(itemsToSave),
    };

    try {
      if (isEditMode && id) {
        const updated = await updateList(id, payload);
        navigate(`/list/${updated.id || id}`);
      } else {
        const created = await createList(payload);
        navigate(`/list/${created.id}`);
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to save the shopping list.'
      );
    }
  };

  if (isEditMode && listsLoading && !initializedListId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <LoaderCircle className="animate-spin" size={20} />
          Loading shopping list...
        </div>
      </div>
    );
  }

  if (isEditMode && initializedListId === id && formError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto text-red-600" size={36} />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Shopping list unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-600">{formError}</p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    );
  }

  const visibleProductError = productsError || listsError;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleSaveList)}
      className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to={isEditMode && id ? `/list/${id}` : '/'}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700"
          >
            <ArrowLeft size={16} />
            {isEditMode ? 'Back to list' : 'Back to Home'}
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit Shopping List' : 'Create Shopping List'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose catalog products and review their calculated costs.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isMutating}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" size={17} />
          ) : (
            <Check size={17} />
          )}
          {isEditMode ? 'Save Changes' : 'Save List'}
        </button>
      </div>

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <span>{formError}</span>
        </div>
      )}

      {visibleProductError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1">{visibleProductError}</div>
          <button
            type="button"
            onClick={() => void fetchProducts().catch(() => undefined)}
            className="font-semibold underline"
          >
            Retry catalog
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label
            htmlFor="list-title"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            List title <span className="text-red-600">*</span>
          </label>
          <input
            id="list-title"
            {...register('listTitle')}
            maxLength={150}
            required
            placeholder="Weekly grocery list"
            aria-invalid={Boolean(errors.listTitle)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.listTitle?.message && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.listTitle.message}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label
            htmlFor="store-name"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
          >
            <Store size={16} />
            Store
          </label>
          <input
            id="store-name"
            {...register('storeName')}
            maxLength={150}
            placeholder="Optional"
            aria-invalid={Boolean(errors.storeName)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.storeName?.message && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.storeName.message}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label
            htmlFor="target-date"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
          >
            <CalendarDays size={16} />
            Target date
          </label>
          <input
            id="target-date"
            type="date"
            {...register('targetDate')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {errors.targetDate?.message && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.targetDate.message}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label
            htmlFor="list-budget"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Budget (₱)
          </label>
          <input
            id="list-budget"
            type="number"
            min="0"
            max={MAX_BUDGET}
            step="0.01"
            {...register('budget')}
            placeholder="No budget"
            aria-describedby="budget-limit-note"
            aria-invalid={Boolean(errors.budget)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <p
            id="budget-limit-note"
            className={`mt-2 text-xs ${errors.budget ? 'text-red-600' : 'text-slate-500'}`}
          >
            {errors.budget?.message || 'Optional. Maximum budget: ₱1,000,000.'}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <label
          htmlFor="list-notes"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Notes and instructions
        </label>
        <textarea
          id="list-notes"
          {...register('notes')}
          rows={2}
          maxLength={2000}
          placeholder="Optional shopping notes"
          aria-invalid={Boolean(errors.notes)}
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        {errors.notes?.message && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.notes.message}
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Product Catalog
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select products already registered in the catalog.
            </p>
          </div>

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'All categories' : category}
              </option>
            ))}
          </select>

          {productsLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
              <LoaderCircle className="animate-spin" size={18} />
              Loading products...
            </div>
          ) : productsError ? (
            <div className="py-10 text-center text-sm text-slate-500">
              The product catalog could not be loaded.
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
              No matching products found.
            </div>
          ) : (
            <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const selectedItem = selectedItems.find(
                  (item) => item.productId === product.id
                );

                return (
                  <article
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl">
                        {product.icon || '🛒'}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-slate-900">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {product.category} · {formatCurrency(product.unitPrice)} / {product.unit}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addProduct(product)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                    >
                      <Plus size={15} />
                      {selectedItem
                        ? `Add more (${selectedItem.quantity})`
                        : 'Add'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Selected Items
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedItems.length} distinct products · {totalQuantity} total quantity
              </p>
            </div>
            <ShoppingBag className="text-emerald-700" size={22} />
          </div>

          {selectedItemsWithTotals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center">
              <ShoppingBag className="mx-auto text-slate-300" size={30} />
              <p className="mt-3 text-sm font-medium text-slate-700">
                Your list is empty
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Add products from the catalog to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedItemsWithTotals.map((item) => (
                <article
                  key={item.id}
                  className="space-y-3 rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatCurrency(item.unitPrice)} per {item.unit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="w-32">
                      <label
                        htmlFor={`quantity-${item.id}`}
                        className="mb-1 block text-xs font-medium text-slate-500"
                      >
                        Quantity
                      </label>
                      <div className="flex items-center rounded-lg border border-slate-300">
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item.id,
                              String(Math.max(0, item.quantity - 1))
                            )
                          }
                          aria-label={`Decrease ${item.name} quantity`}
                          className="px-2 py-2 text-slate-600 hover:bg-slate-50"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(event) =>
                            changeQuantity(item.id, event.target.value)
                          }
                          className="min-w-0 w-full border-x border-slate-200 px-1 py-2 text-center text-sm outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item.id,
                              String(roundCurrency(item.quantity + 1))
                            )
                          }
                          aria-label={`Increase ${item.name} quantity`}
                          className="px-2 py-2 text-slate-600 hover:bg-slate-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">Subtotal</p>
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Products selected</span>
              <span className="font-medium text-slate-900">
                {selectedItems.length}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">List total</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(grandTotalCost)}
              </span>
            </div>

            {budgetValue !== null && budgetValue > 0 && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Budget</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(budgetValue)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Budget balance</span>
                  <span
                    className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}
                  >
                    {formatCurrency(budgetValue - grandTotalCost)}
                  </span>
                </div>
              </>
            )}

            {isOverBudget && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                The list total is above your budget. You can still save the list.
              </div>
            )}

            {Object.keys(categoryBreakdown).length > 0 && (
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category totals
                </h3>
                {Object.entries(categoryBreakdown).map(([category, total]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-slate-600">{category}</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isMutating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" size={17} />
            ) : (
              <Check size={17} />
            )}
            {isEditMode ? 'Save List Changes' : 'Save Shopping List'}
          </button>
        </section>
      </div>
    </form>
  );
};
