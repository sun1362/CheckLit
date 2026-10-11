
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  Plus,
  Package,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../services/api';

const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Meat',
  'Seafood',
  'Seasonings',
  'Oils',
  'Dairy',
  'Bakery',
  'Snacks',
  'Beverage',
  'Other',
];

interface AdminProduct {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
  icon?: string;
  description?: string;
}

const EMPTY_FORM = {
  name: '',
  category: 'Vegetables',
  unitPrice: '',
  unit: 'kg',
  icon: '',
  description: '',
};

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get<AdminProduct[]>('/products');
      setProducts(response.data);
    } catch {
      setError(
        'Unable to load products from the server. Check that the Express backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'All' || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openEditForm = (product: AdminProduct) => {
    const id = product._id ?? product.id;

    if (!id) {
      setError('This product has no usable ID.');
      return;
    }

    setEditingId(id);
    setForm({
      name: product.name,
      category: product.category,
      unitPrice: String(product.unitPrice),
      unit: product.unit,
      icon: product.icon ?? '',
      description: product.description ?? '',
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const price = Number(form.unitPrice);

    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid price greater than or equal to zero.');
      return;
    }

    if (!form.unit.trim()) {
      setError('Measurement unit is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      unitPrice: price,
      unit: form.unit.trim(),
      icon: form.icon.trim(),
      description: form.description.trim(),
    };

    setSaving(true);

    try {
      if (editingId) {
        await apiClient.put(`/products/${editingId}`, payload);
        setSuccess('Product updated successfully.');
      } else {
        await apiClient.post('/products', payload);
        setSuccess('Product added successfully.');
      }

      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadProducts();
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'message' in err.response.data
          ? String(err.response.data.message)
          : 'Unable to save the product. Please try again.';

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    const id = product._id ?? product.id;

    if (!id) {
      setError('This product has no usable ID.');
      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}" from the master catalog? Existing shopping-list items will not automatically be deleted.`
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');
    setDeletingId(id);

    try {
      await apiClient.delete(`/products/${id}`);
      setProducts((current) =>
        current.filter((item) => (item._id ?? item.id) !== id)
      );
      setSuccess(`"${product.name}" was deleted from the catalog.`);
    } catch {
      setError('Unable to delete this product. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  ADMINISTRATION
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                  Product Management
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage the master catalog available to CheckLit users.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadProducts()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Catalog products</p>
              <p className="mt-1 text-2xl font-black text-slate-800">
                {products.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Categories used</p>
              <p className="mt-1 text-2xl font-black text-slate-800">
                {new Set(products.map((product) => product.category)).size}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Matching products</p>
              <p className="mt-1 text-2xl font-black text-slate-800">
                {filteredProducts.length}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
          >
            {success}
          </div>
        )}

        {showForm && (
          <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the details that users will see in the catalog.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close product form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  Product name *
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Fresh Tomato"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  Category *
                  <select
                    required
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  Unit price (₱) *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(event) =>
                      setForm({ ...form, unitPrice: event.target.value })
                    }
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  Measurement unit *
                  <input
                    required
                    maxLength={30}
                    value={form.unit}
                    onChange={(event) =>
                      setForm({ ...form, unit: event.target.value })
                    }
                    placeholder="kg, piece, pack, bottle"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                  Icon or emoji
                  <input
                    maxLength={20}
                    value={form.icon}
                    onChange={(event) =>
                      setForm({ ...form, icon: event.target.value })
                    }
                    placeholder="e.g. 🍅"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
                  Description
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Optional product details"
                    className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Changes'
                      : 'Add Product'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 md:grid-cols-3 md:p-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product name or description..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm">Loading products from MongoDB...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-bold text-slate-800">
                {products.length === 0
                  ? 'Your catalog is empty'
                  : 'No matching products'}
              </h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                {products.length === 0
                  ? 'Add your first product to make it available in the catalog.'
                  : 'Try another search term or select a different category.'}
              </p>
              {products.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Add First Product
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-bold">Product</th>
                      <th className="px-5 py-4 font-bold">Category</th>
                      <th className="px-5 py-4 font-bold">Price</th>
                      <th className="px-5 py-4 font-bold">Unit</th>
                      <th className="px-5 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product._id ?? product.id}
                        className="hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                              {product.icon || '🛒'}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {product.name}
                              </p>
                              <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                                {product.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          ₱{Number(product.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          / {product.unit}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              aria-label={`Edit ${product.name}`}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(product)}
                              disabled={
                                deletingId === (product._id ?? product.id)
                              }
                              aria-label={`Delete ${product.name}`}
                              className="rounded-lg border border-slate-200 p-2 text-red-600 hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {filteredProducts.map((product) => (
                  <article
                    key={product._id ?? product.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                        {product.icon || '🛒'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-800">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {product.category}
                        </p>
                        <p className="mt-2 font-bold text-emerald-700">
                          ₱{Number(product.unitPrice).toFixed(2)} / {product.unit}
                        </p>
                        {product.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product)}
                        disabled={
                          deletingId === (product._id ?? product.id)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {!loading && products.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
