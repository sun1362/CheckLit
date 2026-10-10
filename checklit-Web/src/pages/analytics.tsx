import React from 'react';
import { useShoppingLists } from '../hooks/useShoppingLists';
import { BarChart2, PieChart } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { lists, stats } = useShoppingLists();

  // Category breakdown across all lists
  const globalCategoryTotals = lists.reduce((acc, list) => {
    list.items.forEach((item) => {
      const cat = item.category || 'Other';
      acc[cat] = (acc[cat] || 0) + item.totalPrice;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl">
              <BarChart2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                Spending Analytics & Summaries
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Derived expenditure insights and distribution calculations across all shopping lists.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accumulated Spend</span>
            <p className="text-3xl font-black text-slate-900">₱{stats.totalSpent.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Shopping Lists</span>
            <p className="text-3xl font-black text-slate-900">{stats.totalListsCount}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average List Expenditure</span>
            <p className="text-3xl font-black text-emerald-600">₱{stats.averageListCost.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Items Calculated</span>
            <p className="text-3xl font-black text-slate-900">{stats.totalItemsCount}</p>
          </div>
        </div>

        {/* Category Spending Breakdown Table & Chart Representation */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600" />
            <span>Category Spending Distribution</span>
          </h2>

          <div className="space-y-4">
            {Object.entries(globalCategoryTotals).map(([category, amount]) => {
              const pct = stats.totalSpent > 0 ? Math.round((amount / stats.totalSpent) * 100) : 0;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-bold text-slate-800">
                    <span>{category}</span>
                    <span>₱{amount.toFixed(2)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
