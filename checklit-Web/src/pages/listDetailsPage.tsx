import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useShoppingLists } from '../hooks/useShoppingLists';
import type { ShoppingList, ShoppingItem, ProductCategory } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  ArrowLeft,
  CheckSquare,
  Square,
  Trash2,
  Printer,
  Store,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Sparkles,
  Edit3
} from 'lucide-react';

export const ListDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lists, toggleItemCompletion, deleteList, updateList, loading, successMessage } = useShoppingLists();

  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync current list from hook state or URL params
  useEffect(() => {
    if (id && lists.length > 0) {
      const found = lists.find((l) => l.id === id || l._id === id);
      if (found) {
        setCurrentList(found);
      }
    }
  }, [id, lists]);

  // Derived calculations during render
  const items = currentList?.items || [];
  const completedItems = useMemo(() => items.filter((i) => i.completed), [items]);
  const completedCount = completedItems.length;
  const totalItemsCount = items.length;
  const progressPct = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0;

  const totalCost = currentList?.totalCost || 0;
  const budget = currentList?.budget || 0;
  const isOverBudget = budget > 0 && totalCost > budget;

  // Group items by Category
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<ProductCategory | string, ShoppingItem[]>);
  }, [items]);

  // Toggle Checkbox Item Completion
  const handleToggle = async (itemId: string) => {
    if (!currentList) return;
    await toggleItemCompletion(currentList.id, itemId);
  };

  // Toggle List Status
  const handleStatusChange = async (newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    if (!currentList) return;
    await updateList(currentList.id, { status: newStatus });
  };

  // Delete List Handler
  const handleDeleteConfirm = async () => {
    if (!currentList) return;
    setIsDeleting(true);
    try {
      await deleteList(currentList.id);
      navigate('/');
    } catch {
      // Handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  // Print Summary
  const handlePrint = () => {
    window.print();
  };

  if (loading && !currentList) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium text-sm">Loading shopping list details...</p>
        </div>
      </div>
    );
  }

  if (!currentList && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md w-full space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Shopping List Not Found</h2>
          <p className="text-slate-500 text-sm">
            The shopping list you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">

      {/* Printable Minimal Products List View (Visible ONLY when printing) */}
      <div className="hidden print:block p-8 space-y-6 bg-white text-black font-sans">
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{currentList?.title}</h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              Store: {currentList?.store || 'General Grocery'} &bull; Date: {currentList?.targetDate}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase block">Total Cost</span>
            <span className="text-xl font-black text-slate-900">₱{totalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Product Items Table for Print */}
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300 text-slate-800 uppercase text-xs">
              <th className="py-2.5 px-2 font-black w-10">[ ]</th>
              <th className="py-2.5 px-2 font-black">Item Name</th>
              <th className="py-2.5 px-2 font-black">Category</th>
              <th className="py-2.5 px-2 font-black text-center">Qty / Unit</th>
              <th className="py-2.5 px-2 font-black text-right">Unit Price</th>
              <th className="py-2.5 px-2 font-black text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => (
              <tr key={item.id} className="py-2">
                <td className="py-2 px-2 text-slate-400 font-mono">[ ]</td>
                <td className="py-2 px-2 font-bold text-slate-900">{item.name}</td>
                <td className="py-2 px-2 text-slate-600">{item.category}</td>
                <td className="py-2 px-2 text-center text-slate-800 font-semibold">{item.quantity} {item.unit}</td>
                <td className="py-2 px-2 text-right text-slate-700">₱{item.unitPrice.toFixed(2)}</td>
                <td className="py-2 px-2 text-right font-black text-slate-900">₱{item.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900 font-black text-base">
              <td colSpan={5} className="py-3 px-2 text-right uppercase">Grand Total:</td>
              <td className="py-3 px-2 text-right">₱{totalCost.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Screen Interactive View (Hidden during printing) */}
      <div className="max-w-5xl mx-auto space-y-8 print:hidden">

        {/* Top Action Nav */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Lists</span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              to={`/edit/${currentList?.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-sm font-semibold transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit List</span>
            </Link>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors"
              title="Print Product List"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Print Products List</span>
            </button>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete List</span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* List Header Details Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                    {currentList?.title}
                  </h1>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      {currentList?.store || 'General Grocery'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Target: {currentList?.targetDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Switcher & Edit Quick Action */}
            <div className="flex items-center gap-3">
              <Link
                to={`/edit/${currentList?.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Items</span>
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                <select
                  value={currentList?.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {currentList?.notes && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-700 block">Notes & Shopping Instructions:</span>
              <p>{currentList.notes}</p>
            </div>
          )}

          {/* Interactive In-Store Checklist Progress Bar */}
          <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-950">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>In-Store Grocery Checklist Progress</span>
              </span>
              <span>{completedCount} of {totalItemsCount} items picked ({progressPct}%)</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5 border border-emerald-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Cost & Budget Overview Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 text-white p-4 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Calculated Total</span>
              <span className="text-2xl font-black text-emerald-400">₱{totalCost.toFixed(2)}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Set Budget</span>
              <span className="text-2xl font-black text-slate-800">
                {budget > 0 ? `₱${budget.toFixed(2)}` : 'No Limit'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Budget Balance</span>
              <span className={`text-2xl font-black ${isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}>
                {budget > 0 ? `₱${(budget - totalCost).toFixed(2)}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Categorized Food Ingredients Checklist */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Categorized Items & Prices
            </h2>

            <Link
              to={`/edit/${currentList?.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add / Remove Products</span>
            </Link>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedItems).map(([category, catItems]) => {
              const categoryTotal = catItems.reduce((s, i) => s + i.totalPrice, 0);

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-100/80 px-4 py-2 rounded-xl">
                    <span className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      {category}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      Category Total: ₱{categoryTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        className={`py-3.5 px-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          item.completed ? 'bg-emerald-50/40 text-slate-400' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            className="text-emerald-600 focus:outline-none shrink-0"
                          >
                            {item.completed ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </button>
                          <div>
                            <span className={`text-sm font-bold block ${item.completed ? 'line-through text-slate-400' : ''}`}>
                              {item.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              Quantity: {item.quantity} {item.unit} &bull; ₱{item.unitPrice.toFixed(2)} each
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm font-black ${item.completed ? 'text-slate-400' : 'text-slate-900'}`}>
                            ₱{item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete Modal Confirmation */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Delete Shopping List"
          message={`Are you sure you want to delete "${currentList?.title}"?`}
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
        />

      </div>
    </div>
  );
};
