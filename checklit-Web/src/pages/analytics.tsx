
import { useEffect, useMemo, useState } from 'react';
import type { ShoppingList } from '../types';
import { apiService, getApiErrorMessage, getAuthToken } from '../services/api';

type PurchaseRecord = {
  id: string;
  listId: string;
  listTitle: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
};

type DailyTotal = {
  date: string;
  label: string;
  total: number;
  items: number;
};

type CategoryTotal = {
  category: string;
  total: number;
  items: number;
};

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);

  if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) {
    return month;
  }

  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
  });
}

export function AnalyticsPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      if (!getAuthToken()) {
        setLists([]);
        setError('Please sign in to view your shopping analytics.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await apiService.getLists();

        if (active) {
          setLists(data);
        }
      } catch (err) {
        if (active) {
          setError(
            getApiErrorMessage(
              err,
              'Unable to load your shopping analytics.'
            )
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const completedLists = useMemo(
    () => lists.filter((list) => list.status === 'Completed'),
    [lists]
  );

  const monthlyPurchases = useMemo(() => {
    const records: PurchaseRecord[] = [];

    for (const list of completedLists) {
      for (const item of list.items) {
        if (!item.completed || !item.purchaseDate) {
          continue;
        }

        const purchaseDate = new Date(item.purchaseDate);

        if (Number.isNaN(purchaseDate.getTime())) {
          continue;
        }

        const year = purchaseDate.getFullYear();
        const month = String(purchaseDate.getMonth() + 1).padStart(2, '0');
        const itemMonth = `${year}-${month}`;

        if (itemMonth !== selectedMonth) {
          continue;
        }

        records.push({
          id: item.id,
          listId: list.id,
          listTitle: list.title,
          name: item.name,
          category: item.category || 'Other',
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          purchaseDate: item.purchaseDate,
        });
      }
    }

    return records.sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() -
        new Date(a.purchaseDate).getTime()
    );
  }, [completedLists, selectedMonth]);

  const monthlyCompletedLists = useMemo(() => {
    const listIds = new Set(monthlyPurchases.map((purchase) => purchase.listId));
    return listIds.size;
  }, [monthlyPurchases]);

  const totalSpent = useMemo(
    () =>
      monthlyPurchases.reduce(
        (sum, purchase) => sum + purchase.totalPrice,
        0
      ),
    [monthlyPurchases]
  );

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, CategoryTotal>();

    for (const purchase of monthlyPurchases) {
      const current = totals.get(purchase.category) ?? {
        category: purchase.category,
        total: 0,
        items: 0,
      };

      current.total += purchase.totalPrice;
      current.items += 1;
      totals.set(purchase.category, current);
    }

    return Array.from(totals.values()).sort((a, b) => b.total - a.total);
  }, [monthlyPurchases]);

  const dailyTotals = useMemo(() => {
    const totals = new Map<string, DailyTotal>();

    for (const purchase of monthlyPurchases) {
      const date = new Date(purchase.purchaseDate);
      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');

      const current = totals.get(key) ?? {
        date: key,
        label: date.toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
        }),
        total: 0,
        items: 0,
      };

      current.total += purchase.totalPrice;
      current.items += 1;
      totals.set(key, current);
    }

    return Array.from(totals.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }, [monthlyPurchases]);

  const averagePurchase = monthlyPurchases.length
    ? totalSpent / monthlyPurchases.length
    : 0;

  const maxDailyTotal = Math.max(
    ...dailyTotals.map((day) => day.total),
    1
  );

  const maxCategoryTotal = Math.max(
    ...categoryTotals.map((category) => category.total),
    1
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Spending Overview
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Shopping Analytics
            </h1>
            <p className="mt-2 text-gray-600">
              Review purchased items and track spending by month.
            </p>
          </div>

          <label className="block w-full sm:w-56">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Select Month
            </span>
            <input
              type="month"
              value={selectedMonth}
              max={getCurrentMonth()}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </label>
        </header>

        {error && (
          <section
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="font-semibold text-red-800">
              Unable to load analytics
            </p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Try Again
            </button>
          </section>
        )}

        {loading ? (
          <section className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="font-medium text-gray-700">
              Loading your shopping analytics...
            </p>
          </section>
        ) : (
          <>
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {getMonthLabel(selectedMonth)}
              </h2>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="mt-2 break-words text-2xl font-bold text-green-800">
                    {formatCurrency(totalSpent)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    From recorded purchases in this month
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Purchased Items</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {monthlyPurchases.length}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Individual product entries purchased
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Completed Lists</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {monthlyCompletedLists}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Completed lists with purchases this month
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Average per Item</p>
                  <p className="mt-2 break-words text-2xl font-bold text-gray-900">
                    {formatCurrency(averagePurchase)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Average cost per purchased entry
                  </p>
                </div>
              </section>
            </div>

            {monthlyPurchases.length === 0 ? (
              <section className="rounded-xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="text-4xl" aria-hidden="true">
                  📊
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  No recorded purchases for this month
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
                  Analytics uses purchased items from completed lists with a
                  recorded purchase date. Check another month or mark items as
                  purchased and complete their lists.
                </p>
              </section>
            ) : (
              <>
                <section className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900">
                      Spending by Day
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Amount spent on the actual purchase date.
                    </p>

                    <div className="mt-6 space-y-4">
                      {dailyTotals.map((day) => (
                        <div key={day.date}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-gray-700">
                              {day.label}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(day.total)}
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-green-600"
                              style={{
                                width: `${(day.total / maxDailyTotal) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {day.items} purchased{' '}
                            {day.items === 1 ? 'entry' : 'entries'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900">
                      Spending by Category
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Categories ranked by total purchase cost.
                    </p>

                    <div className="mt-6 space-y-4">
                      {categoryTotals.map((category) => (
                        <div key={category.category}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-gray-700">
                              {category.category}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(category.total)}
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-emerald-600"
                              style={{
                                width: `${(category.total / maxCategoryTotal) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {category.items}{' '}
                            {category.items === 1 ? 'entry' : 'entries'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-gray-900">
                      Purchase History
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Purchased items recorded in {getMonthLabel(selectedMonth)}.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="px-3 py-3 font-semibold">
                            Purchase Date
                          </th>
                          <th className="px-3 py-3 font-semibold">Product</th>
                          <th className="px-3 py-3 font-semibold">Category</th>
                          <th className="px-3 py-3 text-right font-semibold">
                            Quantity
                          </th>
                          <th className="px-3 py-3 text-right font-semibold">
                            Unit Price
                          </th>
                          <th className="px-3 py-3 text-right font-semibold">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyPurchases.map((purchase, index) => (
                          <tr
                            key={`${purchase.listId}-${purchase.id}-${index}`}
                            className="border-b border-gray-100 last:border-0"
                          >
                            <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                              {formatDate(purchase.purchaseDate)}
                            </td>
                            <td className="px-3 py-4">
                              <p className="font-medium text-gray-900">
                                {purchase.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {purchase.listTitle}
                              </p>
                            </td>
                            <td className="px-3 py-4 text-gray-600">
                              {purchase.category}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-right text-gray-600">
                              {purchase.quantity} {purchase.unit}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-right text-gray-600">
                              {formatCurrency(purchase.unitPrice)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-right font-semibold text-gray-900">
                              {formatCurrency(purchase.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td
                            colSpan={5}
                            className="px-3 py-4 text-right font-bold text-gray-900"
                          >
                            Total Spent
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-right font-bold text-green-800">
                            {formatCurrency(totalSpent)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default AnalyticsPage;
