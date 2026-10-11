
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Search,
  Package,
  CircleDollarSign,
  Clock3,
  CheckCircle2,
  CalendarDays,
  Store,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  ListChecks,
} from 'lucide-react';
import { useShoppingLists } from '../hooks/useShoppingLists';
import type { ShoppingList, ShoppingListStatus } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);

const getListId = (list: ShoppingList) => list.id || list._id || '';

const getStatusClass = (status: ShoppingListStatus) => {
  if (status === 'Completed') {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (status === 'In Progress') {
    return 'bg-blue-100 text-blue-800';
  }

  return 'bg-amber-100 text-amber-800';
};

export const HomePage = () => {
  const {
    lists,
    loading,
    isMutating,
    error,
    successMessage,
    fetchLists,
    deleteList,
    stats,
  } = useShoppingLists();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ShoppingListStatus>('All');
  const [deleteTarget, setDeleteTarget] = useState<ShoppingList | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredLists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...lists]
      .filter((list) => {
        const matchesSearch =
          !query ||
          list.title.toLowerCase().includes(query) ||
          list.store.toLowerCase().includes(query) ||
          (list.notes ?? '').toLowerCase().includes(query) ||
          list.items.some((item) =>
            item.name.toLowerCase().includes(query)
          );

        const matchesStatus =
          statusFilter === 'All' || list.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
  }, [lists, searchQuery, statusFilter]);

  const activeLists = filteredLists.filter(
    (list) => list.status !== 'Completed'
  );

  const completedLists = filteredLists.filter(
    (list) => list.status === 'Completed'
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const id = getListId(deleteTarget);

    if (!id) {
      setDeleteError('This shopping list does not have a valid ID.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteList(id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete shopping list.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchLists();
    } catch {
      return;
    }
  };

  const renderListCard = (list: ShoppingList) => {
    const listId = getListId(list);
    const purchasedCount = list.items.filter(
      (item) => item.completed
    ).length;
    const totalItemCount = list.items.length;
    const progress =
      totalItemCount > 0
        ? Math.round((purchasedCount / totalItemCount) * 100)
        : 0;

    return (
      <article
        key={listId}
        className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words text-base font-semibold text-slate-900">
              {list.title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Store size={14} />
              {list.store || 'No store specified'}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(list.status)}`}
          >
            {list.status}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">List total</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatCurrency(list.totalCost)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Budget</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {list.budget > 0
                ? formatCurrency(list.budget)
                : 'Not set'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Purchased items</span>
            <span>
              {purchasedCount} of {totalItemCount}
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${list.title} purchase progress`}
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {list.targetDate && (
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={14} />
            Target date: {list.targetDate}
          </p>
        )}

        {list.items.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Items
            </p>
            <div className="flex flex-wrap gap-2">
              {list.items.slice(0, 4).map((item) => (
                <span
                  key={item.id}
                  className="max-w-full truncate rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                >
                  {item.name}
                </span>
              ))}
              {list.items.length > 4 && (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  +{list.items.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4">
          <Link
            to={`/list/${listId}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Eye size={15} />
            View
          </Link>

          <Link
            to={`/edit/${listId}`}
            className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label={`Edit ${list.title}`}
          >
            <Pencil size={16} />
          </Link>

          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setDeleteTarget(list);
            }}
            className="flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
            aria-label={`Delete ${list.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            CheckLit Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Your Shopping Lists
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Organize your shopping and keep track of your costs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <Link
            to="/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={17} />
            Create List
          </Link>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={handleRefresh}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          <CheckCircle2 size={17} />
          {successMessage}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
              <ShoppingBag size={20} />
            </span>
            <div>
              <p className="text-sm text-slate-500">Total Lists</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalListsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
              <CircleDollarSign size={20} />
            </span>
            <div>
              <p className="text-sm text-slate-500">Actual Spending</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(stats.totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
              <Clock3 size={20} />
            </span>
            <div>
              <p className="text-sm text-slate-500">Active Lists</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.activeListsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-violet-50 p-2.5 text-violet-700">
              <Package size={20} />
            </span>
            <div>
              <p className="text-sm text-slate-500">Average List Cost</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(stats.averageListCost)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <ListChecks className="text-emerald-700" size={21} />
            <h2 className="text-lg font-semibold text-slate-900">
              Shopping Lists
            </h2>
          </div>

          <span className="text-sm text-slate-500">
            {filteredLists.length} {filteredLists.length === 1 ? 'list' : 'lists'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search titles, stores, notes, or products..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'All' | ShoppingListStatus)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </section>

      {loading && lists.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            Loading shopping lists...
          </div>
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <ShoppingBag size={27} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {lists.length === 0
              ? 'No Shopping Lists Yet'
              : 'No Matching Lists'}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {lists.length === 0
              ? 'Create your first shopping list to start organizing products and calculating costs.'
              : 'Try a different search term or select another status.'}
          </p>

          {lists.length === 0 && (
            <Link
              to="/create"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={17} />
              Create Your First List
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {activeLists.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Active Lists
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({activeLists.length})
                </span>
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {activeLists.map(renderListCard)}
              </div>
            </section>
          )}

          {completedLists.length > 0 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <CheckCircle2 size={20} className="text-emerald-700" />
                Completed Lists
                <span className="text-sm font-normal text-slate-500">
                  ({completedLists.length})
                </span>
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {completedLists.map(renderListCard)}
              </div>
            </section>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Shopping List"
        message={`Are you sure you want to delete "${deleteTarget?.title ?? ''}"? This action cannot be undone.`}
        isLoading={isDeleting || isMutating}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      />

      {deleteError && (
        <div
          role="alert"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border border-red-200 bg-white p-4 text-sm text-red-700 shadow-lg"
        >
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{deleteError}</span>
          </div>
        </div>
      )}
    </div>
  );
};
