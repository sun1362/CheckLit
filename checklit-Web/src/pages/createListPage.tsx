import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useShoppingLists } from '../hooks/useShoppingLists';
import type { ShoppingItem, ProductCategory } from '../types';
import {
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Store,
  Calendar,
  ShoppingBag,
  PlusCircle,
  Sparkles,
  Tag,
  FileText,
  Edit3
} from 'lucide-react';

export const CreateListPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { filteredProducts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories, addCustomProduct } = useProducts();
  const { lists, createList, updateList } = useShoppingLists();

  const isEditMode = Boolean(id);

  // List Form Metadata
  const [listTitle, setListTitle] = useState('');
  const [storeName, setStoreName] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [budget, setBudget] = useState<number | ''>(500.0);
  const [notes, setNotes] = useState('');

  // Selected Shopping Items List State
  const [selectedItems, setSelectedItems] = useState<ShoppingItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Item Modal/Toggle
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<ProductCategory>('Vegetables');
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [customUnit, setCustomUnit] = useState('kg');

  // Pre-fill list details if in Edit Mode
  useEffect(() => {
    if (isEditMode && id && lists.length > 0) {
      const existing = lists.find((l) => l.id === id || l._id === id);
      if (existing) {
        setListTitle(existing.title);
        setStoreName(existing.store || '');
        setTargetDate(existing.targetDate || new Date().toISOString().split('T')[0]);
        setBudget(existing.budget || 0);
        setNotes(existing.notes || '');
        setSelectedItems(existing.items || []);
      }
    }
  }, [id, isEditMode, lists]);

  // Add Product to Selected List (or increment quantity if already added)
  const handleAddProduct = (product: { id: string; name: string; category: ProductCategory; unitPrice: number; unit: string }) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id || item.name === product.name);
      if (existing) {
        return prev.map((item) => {
          if (item.productId === product.id || item.name === product.name) {
            const newQty = item.quantity + 1;
            return {
              ...item,
              quantity: newQty,
              totalPrice: Number((item.unitPrice * newQty).toFixed(2)),
            };
          }
          return item;
        });
      }

      const newItem: ShoppingItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        name: product.name,
        category: product.category,
        unitPrice: product.unitPrice,
        quantity: 1,
        unit: product.unit,
        totalPrice: Number(product.unitPrice.toFixed(2)),
        completed: false,
      };

      return [...prev, newItem];
    });
  };

  // Change Quantity of Item
  const handleQuantityChange = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQty,
            totalPrice: Number((item.unitPrice * newQty).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Handle Custom Product Addition
  const handleAddCustomProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPrice || Number(customPrice) <= 0) return;

    const newProd = await addCustomProduct({
      name: customName.trim(),
      category: customCategory,
      unitPrice: Number(customPrice),
      unit: customUnit,
      icon: '🛒',
    });

    handleAddProduct(newProd);
    setCustomName('');
    setCustomPrice('');
    setShowCustomModal(false);
  };

  // Live Calculations Computed directly during render (derived state)
  const grandTotalCost = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const budgetNum = Number(budget) || 0;
  const isOverBudget = budgetNum > 0 && grandTotalCost > budgetNum;
  const remainingBudget = budgetNum - grandTotalCost;

  // Category summary breakdown
  const categoryBreakdown = selectedItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.totalPrice;
    return acc;
  }, {} as Record<string, number>);

  // Handle Save / Confirm / Update Shopping List
  const handleSaveList = async () => {
    if (!listTitle.trim()) {
      setFormError('Please enter a list title before confirming.');
      return;
    }
    if (selectedItems.length === 0) {
      setFormError('Please select at least one product ingredient for your shopping list.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        await updateList(id, {
          title: listTitle.trim(),
          store: storeName.trim() || 'General Grocery Store',
          targetDate: targetDate || new Date().toISOString().split('T')[0],
          budget: budgetNum,
          notes: notes.trim(),
          items: selectedItems,
          totalCost: grandTotalCost,
        });
        navigate(`/list/${id}`);
      } else {
        await createList({
          title: listTitle.trim(),
          store: storeName.trim() || 'General Grocery Store',
          targetDate: targetDate || new Date().toISOString().split('T')[0],
          budget: budgetNum,
          notes: notes.trim(),
          items: selectedItems,
          totalCost: grandTotalCost,
          status: 'Pending',
        });
        navigate('/');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save list.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Back Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(isEditMode && id ? `/list/${id}` : '/')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEditMode ? 'Back to List Details' : 'Back to Dashboard'}</span>
          </button>

          <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            {isEditMode ? 'List Edit Mode' : 'List Creation Wizard'}
          </span>
        </div>

        {/* Page Title & Instructions */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                {isEditMode ? <Edit3 className="w-8 h-8 text-emerald-600" /> : <ShoppingBag className="w-8 h-8 text-emerald-600" />}
                <span>{isEditMode ? 'Edit Shopping List' : 'Create Grocery Shopping List'}</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {isEditMode
                  ? 'Add or remove ingredients, update quantities, and adjust list metadata.'
                  : 'Select ingredients by category, adjust quantities, and watch your total list price compute live!'}
              </p>
            </div>

            <button
              onClick={handleSaveList}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-98"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              <span>{isEditMode ? 'Save List Changes' : 'Confirm & Save List'}</span>
            </button>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* List Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                List Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Weekly Meal Prep Grocery"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>Store / Market</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Fresh Mart Superstore"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Target Shopping Date</span>
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <span className="text-emerald-600 font-black">₱</span>
                <span>Budget Limit (₱)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>List Notes / Special Instructions</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Check expiration dates, buy organic items if available..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Main Grid: Ingredients Picker (Left) & Shopping List Calculations (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Side: Categorized Ingredients Selection Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-600" />
                  <span>Select Food Ingredients</span>
                </h2>

                <button
                  onClick={() => setShowCustomModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Add Custom Item</span>
                </button>
              </div>

              {/* Search Product Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vegetables, fruits, meat, seasonings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filter Pills (Vegetables, Fruits, Meat, Seasonings, etc.) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Products Catalog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredProducts.map((product) => {
                  const existingInList = selectedItems.find(
                    (i) => i.productId === product.id || i.name === product.name
                  );

                  return (
                    <div
                      key={product.id}
                      className="bg-slate-50/80 hover:bg-white p-3.5 rounded-2xl border border-slate-200/70 hover:border-emerald-400 transition-all flex items-center justify-between gap-3 group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
                          {product.icon || '🛒'}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{product.name}</h4>
                          <span className="text-xs text-slate-500 block">
                            ₱{product.unitPrice.toFixed(2)} / {product.unit}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddProduct(product)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          existingInList
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-white hover:bg-emerald-600 text-slate-700 hover:text-white border border-slate-200'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{existingInList ? `Added (${existingInList.quantity})` : 'Add'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Selected Items & Dynamic Real-Time Calculations (5 cols) */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-lg space-y-5 sticky top-20">

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>Selected Checklist ({selectedItems.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">{totalItemCount} items total</span>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                  Real-time Totaling
                </span>
              </div>

              {/* Items Table / List with Remove & Quantity Controls */}
              {selectedItems.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-500 font-medium">Your shopping list is currently empty.</p>
                  <p className="text-xs text-slate-400">Click "+ Add" on ingredients from the left catalog to start calculating!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-800 truncate">{item.name}</h5>
                          <span className="text-xs font-black text-emerald-700 ml-2">
                            ₱{item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          ₱{item.unitPrice.toFixed(2)} / {item.unit}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                          title="Decrease Quantity"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                          title="Increase Quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Item Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="Remove item from list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Dynamic Summary & Calculations Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3.5">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>Subtotal Items Count</span>
                  <span className="font-bold text-white">{totalItemCount} items</span>
                </div>

                {budgetNum > 0 && (
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>Budget Target</span>
                    <span className="font-bold text-white">₱{budgetNum.toFixed(2)}</span>
                  </div>
                )}

                {/* Category breakdown snippet */}
                {Object.keys(categoryBreakdown).length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Category Breakdown:</span>
                    {Object.entries(categoryBreakdown).map(([cat, cost]) => (
                      <div key={cat} className="flex justify-between text-[11px] text-slate-400">
                        <span>{cat}</span>
                        <span className="font-semibold text-slate-200">₱{cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Running Grand Total</span>
                    <span className="text-2xl font-black text-white">₱{grandTotalCost.toFixed(2)}</span>
                  </div>

                  {budgetNum > 0 && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Remaining</span>
                      <span className={`text-xs font-bold ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                        ₱{remainingBudget.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Over Budget Alert */}
                {isOverBudget && (
                  <div className="p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>Warning: Total exceeds set budget by ₱{Math.abs(remainingBudget).toFixed(2)}!</span>
                  </div>
                )}
              </div>

              {/* Confirm Save / Update Button */}
              <button
                onClick={handleSaveList}
                disabled={isSubmitting || selectedItems.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isEditMode ? 'Update Shopping List' : 'Confirm Shopping List'} (₱{grandTotalCost.toFixed(2)})</span>
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Add Custom Ingredient Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Add Custom Ingredient</span>
            </h3>

            <form onSubmit={handleAddCustomProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Almond Milk"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Seasonings & Oils">Seasonings & Oils</option>
                    <option value="Dairy & Bakery">Dairy & Bakery</option>
                    <option value="Snacks & Beverages">Snacks & Beverages</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                <input
                  type="text"
                  placeholder="e.g. kg, bottle, pack"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
                >
                  Add Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
