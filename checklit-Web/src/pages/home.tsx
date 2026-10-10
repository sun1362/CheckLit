import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShoppingLists } from '../hooks/useShoppingLists';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Plus,
  Search,
  ShoppingBag,
  Calendar,
  Store,
  Trash2,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { lists, loading, error, successMessage, deleteList, stats } = useShoppingLists();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derived filtered lists during render
  const filteredLists = lists.filter((list) => {
    const matchesSearch =
      list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.notes && list.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = statusFilter === 'All' || list.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteList(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // Error handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Success Feedback Banner */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error State Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Hero Banner Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Grocery Budget & Shopping List Manager</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Organize your groceries & calculate list totals in real-time.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Create lists with categorized food ingredients (Vegetables, Fruits, Meat, Seasonings & more). Pick items and quantities while CheckLit computes your totals and budget running balance automatically.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base rounded-2xl shadow-lg shadow-emerald-500/25 hover:scale-102 transition-all active:scale-98"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Create New List</span>
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-2xl border border-white/15 transition-colors"
              >
                <Store className="w-5 h-5" />
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard Widget */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Lists</p>
              <p className="text-2xl font-black text-slate-800">{stats.totalListsCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-xl">
              <span className="w-6 h-6 flex items-center justify-center font-extrabold text-xl text-teal-700 leading-none">₱</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spent</p>
              <p className="text-2xl font-black text-slate-800">₱{stats.totalSpent.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Lists</p>
              <p className="text-2xl font-black text-slate-800">{stats.activeListsCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg List Cost</p>
              <p className="text-2xl font-black text-slate-800">₱{stats.averageListCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Controls Section: Search & Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span>Your Shopping Checklists</span>
            </h2>

            <div className="w-full sm:w-auto flex items-center gap-3">
              <Link
                to="/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New List</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search list by title, store name, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative flex items-center">
              <Filter className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer appearance-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lists Content Area */}
        {loading ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 font-medium text-sm">Loading your grocery lists...</p>
          </div>
        ) : filteredLists.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-5">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-slate-800">No Shopping Lists Found</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {searchQuery || statusFilter !== 'All'
                  ? 'No shopping lists match your search filters. Try clearing search criteria.'
                  : "You haven't created any grocery lists yet. Start building your list with ingredients and live total calculations!"}
              </p>
            </div>
            <div>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First List</span>
              </Link>
            </div>
          </div>
        ) : (
          /* List Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => {
              const completedCount = list.items.filter((i) => i.completed).length;
              const totalItemsCount = list.items.length;
              const progressPct = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0;
              const isOverBudget = list.budget > 0 && list.totalCost > list.budget;

              return (
                <div
                  key={list.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {list.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                          <Store className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{list.store || 'General Grocery'}</span>
                        </div>
                      </div>
                      {getStatusBadge(list.status)}
                    </div>

                    {/* Progress Bar for Shopping Checklist */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Items Picked</span>
                        <span className="font-bold text-slate-700">{completedCount} of {totalItemsCount} ({progressPct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Cost & Budget Summary Box */}
                    <div className="bg-slate-50 rounded-xl p-3.5 flex items-center justify-between border border-slate-100">
                      <div>
                        <span className="text-xs text-slate-500 font-medium block">Total Price</span>
                        <span className="text-xl font-black text-slate-900">₱{list.totalCost.toFixed(2)}</span>
                      </div>
                      {list.budget > 0 && (
                        <div className="text-right">
                          <span className="text-xs text-slate-500 font-medium block">Budget</span>
                          <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-700'}`}>
                            ₱{list.budget.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Items Sample */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">Preview Items:</span>
                      <ul className="space-y-1">
                        {list.items.slice(0, 3).map((item) => (
                          <li key={item.id} className="flex items-center justify-between truncate">
                            <span className={`truncate ${item.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                              {item.name} ({item.quantity} {item.unit})
                            </span>
                            <span className="font-semibold text-slate-700 shrink-0 ml-2">
                              ₱{item.totalPrice.toFixed(2)}
                            </span>
                          </li>
                        ))}
                        {list.items.length > 3 && (
                          <li className="text-emerald-600 font-medium text-[11px] pt-0.5">
                            +{list.items.length - 3} more items in list...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{list.targetDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/edit/${list.id}`}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit List"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTargetId(list.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete List"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/list/${list.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Step Modal */}
        <ConfirmationModal
          isOpen={!!deleteTargetId}
          title="Delete Shopping List"
          message="Are you sure you want to delete this shopping list? This action cannot be undone."
          confirmLabel="Delete List"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTargetId(null)}
        />
      </div>
    </div>
  );
};
