
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Circle,
  Download,
  LoaderCircle,
  Printer,
  ShoppingBag,
  Store,
  Trash2,
  Pencil,
  RefreshCw,
} from 'lucide-react';
import { useShoppingLists } from '../hooks/useShoppingLists';
import type { ShoppingItem, ShoppingList } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);

const getListId = (list: ShoppingList) => list.id || list._id || '';

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

export const ListDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    lists,
    loading,
    isMutating,
    error,
    successMessage,
    fetchLists,
    toggleItemCompletion,
    deleteList,
  } = useShoppingLists();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentList = useMemo(
    () => lists.find((list) => list.id === id || list._id === id) ?? null,
    [lists, id]
  );

  const items = currentList?.items ?? [];
  const purchasedItems = items.filter((item) => item.completed);
  const unpurchasedItems = items.filter((item) => !item.completed);

  const purchasedCount = purchasedItems.length;
  const totalItemsCount = items.length;
  const progress =
    totalItemsCount > 0
      ? Math.round((purchasedCount / totalItemsCount) * 100)
      : 0;

  const listTotal = currentList?.totalCost ?? 0;

  const remainingCost = unpurchasedItems.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  const actualSpending = purchasedItems.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  const budget = currentList?.budget ?? 0;
  const isOverBudget = budget > 0 && listTotal > budget;

  const groupedItems = useMemo(() => {
    return items.reduce<Record<string, ShoppingItem[]>>((groups, item) => {
      const category = item.category || 'Other';

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);
      return groups;
    }, {});
  }, [items]);

  const handleToggle = async (itemId: string) => {
    if (!currentList) return;

    setActionError(null);

    try {
      await toggleItemCompletion(getListId(currentList), itemId);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to update the purchased status.'
      );
    }
  };

  const handleDelete = async () => {
    if (!currentList) return;

    const listId = getListId(currentList);

    setIsDeleting(true);
    setActionError(null);

    try {
      await deleteList(listId);
      setDeleteModalOpen(false);
      navigate('/', { replace: true });
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : 'Unable to delete this shopping list.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    if (!currentList) return;

    const rows = [
      [
        'List Title',
        'Store',
        'Category',
        'Product',
        'Quantity',
        'Unit',
        'Unit Price',
        'Subtotal',
        'Purchased',
      ],
      ...items.map((item) => [
        currentList.title,
        currentList.store,
        item.category,
        item.name,
        item.quantity,
        item.unit,
        item.unitPrice.toFixed(2),
        item.totalPrice.toFixed(2),
        item.completed ? 'Yes' : 'No',
      ]),
      [],
      ['List Total', '', '', '', '', '', '', listTotal.toFixed(2), ''],
      ['Actual Spending', '', '', '', '', '', '', actualSpending.toFixed(2), ''],
      ['Remaining Cost', '', '', '', '', '', '', remainingCost.toFixed(2), ''],
      ['Budget', '', '', '', '', '', '', budget > 0 ? budget.toFixed(2) : 'Not set', ''],
    ];

    const csv = rows
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `${currentList.title
      .trim()
      .replace(/[^a-z0-9_-]+/gi, '-') || 'shopping-list'}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  if (loading && !currentList) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <LoaderCircle className="animate-spin" size={20} />
          Loading shopping list...
        </div>
      </div>
    );
  }

  if (!currentList) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto text-amber-600" size={36} />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Shopping list unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {error || 'The shopping list could not be found.'}
        </p>
        <button
          type="button"
          onClick={() => void fetchLists().catch(() => undefined)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Retry
        </button>
        <Link
          to="/"
          className="ml-2 mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <ArrowLeft size={16} />
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 print:max-w-none print:px-0 print:py-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <h1 className="mt-3 break-words text-2xl font-bold text-slate-900">
            {currentList.title}
          </h1>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
            {currentList.store && (
              <span className="flex items-center gap-1.5">
                <Store size={15} />
                {currentList.store}
              </span>
            )}

            {currentList.targetDate && (
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} />
                Target date: {currentList.targetDate}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/edit/${getListId(currentList)}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={16} />
            Edit
          </Link>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Printer size={16} />
            Print / Save PDF
          </button>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 print:hidden"
        >
          <CheckCircle2 size={17} />
          {successMessage}
        </div>
      )}

      {(actionError || error) && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 print:hidden"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <span>{actionError || error}</span>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">List Total</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(listTotal)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Actual Spending</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {formatCurrency(actualSpending)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Remaining Cost</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(remainingCost)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Budget</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {budget > 0 ? formatCurrency(budget) : 'Not set'}
          </p>
          {budget > 0 && (
            <p
              className={`mt-1 text-xs ${isOverBudget ? 'text-red-600' : 'text-slate-500'}`}
            >
              {isOverBudget
                ? `Over budget by ${formatCurrency(listTotal - budget)}`
                : `${formatCurrency(budget - listTotal)} remaining`}
            </p>
          )}
        </div>
      </section>

      {isOverBudget && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold">Budget exceeded</p>
            <p className="mt-1">
              Your list total exceeds the budget by{' '}
              {formatCurrency(listTotal - budget)}. You can still manage and
              purchase the selected items.
            </p>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Shopping Progress
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {purchasedCount} of {totalItemsCount} products purchased
            </p>
          </div>

          <span className="text-sm font-semibold text-emerald-700">
            {progress}%
          </span>
        </div>

        <div
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Shopping progress"
        >
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              currentList.status === 'Completed'
                ? 'bg-emerald-100 text-emerald-800'
                : currentList.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
            }`}
          >
            {currentList.status}
          </span>
        </div>
      </section>

      {currentList.notes && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Notes and Instructions
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
            {currentList.notes}
          </p>
        </section>
      )}

      <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ShoppingBag size={21} className="text-emerald-700" />
          <h2 className="text-lg font-semibold text-slate-900">
            Products
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-12 text-center">
            <ShoppingBag className="mx-auto text-slate-300" size={30} />
            <p className="mt-3 text-sm font-medium text-slate-700">
              This list is empty
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add products to this list when you are ready.
            </p>
            <Link
              to={`/edit/${getListId(currentList)}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 print:hidden"
            >
              <Pencil size={16} />
              Add Products
            </Link>
          </div>
        ) : (
          <div className="space-y-7">
            {Object.entries(groupedItems).map(([category, categoryItems]) => {
              const categoryTotal = categoryItems.reduce(
                (total, item) => total + item.totalPrice,
                0
              );

              return (
                <div key={category}>
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-semibold text-slate-700">
                      {category}
                    </h3>
                    <span className="text-xs font-medium text-slate-500">
                      {formatCurrency(categoryTotal)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-4 rounded-lg border p-3 ${
                          item.completed
                            ? 'border-emerald-100 bg-emerald-50/50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => void handleToggle(item.id)}
                          disabled={isMutating}
                          aria-pressed={item.completed}
                          className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:opacity-60 print:hidden"
                        >
                          {item.completed ? (
                            <CheckCircle2
                              className="mt-0.5 shrink-0 text-emerald-600"
                              size={20}
                            />
                          ) : (
                            <Circle
                              className="mt-0.5 shrink-0 text-slate-400"
                              size={20}
                            />
                          )}

                          <span className="min-w-0">
                            <span
                              className={`block break-words text-sm font-medium ${
                                item.completed
                                  ? 'text-slate-500 line-through'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.name}
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                              Quantity: {item.quantity} {item.unit} ·{' '}
                              {formatCurrency(item.unitPrice)} per {item.unit}
                            </span>
                          </span>
                        </button>

                        <span className="hidden shrink-0 text-sm text-slate-500 print:block">
                          {item.completed ? 'Purchased' : 'Not purchased'}
                        </span>

                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-semibold ${
                              item.completed
                                ? 'text-emerald-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {formatCurrency(item.totalPrice)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.completed ? 'Purchased' : 'Remaining'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Shopping List"
        message={`Are you sure you want to delete "${currentList.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
          }
        }}
      />
    </div>
  );
};
