
import { useState, type FormEvent } from 'react';
import type { Category, Product } from '../types';
import { apiService, getApiErrorMessage } from '../services/api';
import { useProducts } from '../hooks/useProducts';

export function AdminProductsPage() {
  const {
    products,
    categoryRecords,
    loading,
    loadingCategories,
    isMutating,
    error,
    successMessage,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
    fetchCategories,
    clearMessages,
  } = useProducts();

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    unitPrice: '',
    unit: 'pcs',
    icon: '',
    description: '',
  });

  const [editingProductId, setEditingProductId] = useState('');
  const [productError, setProductError] = useState('');
  const [productMessage, setProductMessage] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categoryMessage, setCategoryMessage] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const visibleProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'All' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      unitPrice: '',
      unit: 'pcs',
      icon: '',
      description: '',
    });
    setEditingProductId('');
    setProductError('');
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
    });
    setEditingCategoryId('');
    setCategoryError('');
  };

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductError('');
    setProductMessage('');
    clearMessages();

    const name = productForm.name.trim();
    const category = productForm.category.trim();
    const unit = productForm.unit.trim();
    const unitPrice = Number(productForm.unitPrice);

    if (!name || !category || !unit) {
      setProductError('Please complete the required product fields.');
      return;
    }

    if (
      productForm.unitPrice.trim() === '' ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      setProductError('Enter a valid unit price that is zero or greater.');
      return;
    }

    setSavingProduct(true);

    try {
      const payload = {
        name,
        category,
        unitPrice,
        unit,
        icon: productForm.icon.trim(),
        description: productForm.description.trim(),
      };

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setProductMessage('Product updated successfully.');
      } else {
        await createProduct(payload);
        setProductMessage('Product added successfully.');
      }

      resetProductForm();
      await fetchProducts();
    } catch (err) {
      setProductError(getApiErrorMessage(err, 'Unable to save the product.'));
    } finally {
      setSavingProduct(false);
    }
  };

  const startProductEdit = (product: Product) => {
    setEditingProductId(product.id || product._id || '');
    setProductForm({
      name: product.name,
      category: product.category,
      unitPrice: String(product.unitPrice),
      unit: product.unit,
      icon: product.icon ?? '',
      description: product.description ?? '',
    });
    setProductError('');
    setProductMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductDelete = async (product: Product) => {
    const productId = product.id || product._id;

    if (!productId) {
      setProductError('Unable to identify this product.');
      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}" from the product catalog? Existing shopping lists will retain their saved item details.`
    );

    if (!confirmed) return;

    setProductError('');
    setProductMessage('');

    try {
      await deleteProduct(productId);
      setProductMessage('Product deleted successfully.');

      if (editingProductId === productId) {
        resetProductForm();
      }
    } catch (err) {
      setProductError(getApiErrorMessage(err, 'Unable to delete the product.'));
    }
  };

  const handleCategorySubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setCategoryError('');
    setCategoryMessage('');

    const name = categoryForm.name.trim();

    if (name.length < 2) {
      setCategoryError('Category name must contain at least 2 characters.');
      return;
    }

    setSavingCategory(true);

    try {
      if (editingCategoryId) {
        await apiService.updateCategory(editingCategoryId, {
          name,
          description: categoryForm.description.trim(),
        });
        setCategoryMessage(
          'Category updated. Products using this category have been synchronized.'
        );
      } else {
        await apiService.addCategory({
          name,
          description: categoryForm.description.trim(),
        });
        setCategoryMessage('Category added successfully.');
      }

      resetCategoryForm();
      await Promise.all([fetchCategories(), fetchProducts()]);
    } catch (err) {
      setCategoryError(
        getApiErrorMessage(err, 'Unable to save the category.')
      );
    } finally {
      setSavingCategory(false);
    }
  };

  const startCategoryEdit = (category: Category) => {
    setEditingCategoryId(category.id || category._id || '');
    setCategoryForm({
      name: category.name,
      description: category.description ?? '',
    });
    setCategoryError('');
    setCategoryMessage('');
  };

  const handleCategoryDelete = async (category: Category) => {
    const categoryId = category.id || category._id;

    if (!categoryId) {
      setCategoryError('Unable to identify this category.');
      return;
    }

    const confirmed = window.confirm(
      `Delete the "${category.name}" category? Categories assigned to existing products cannot be deleted.`
    );

    if (!confirmed) return;

    setCategoryError('');
    setCategoryMessage('');

    try {
      await apiService.deleteCategory(categoryId);
      setCategoryMessage('Category deleted successfully.');

      if (editingCategoryId === categoryId) {
        resetCategoryForm();
      }

      if (
        selectedCategory.toLowerCase() === category.name.toLowerCase()
      ) {
        setSelectedCategory('All');
      }

      await Promise.all([fetchCategories(), fetchProducts()]);
    } catch (err) {
      setCategoryError(
        getApiErrorMessage(
          err,
          'Unable to delete the category. Check whether products still use it.'
        )
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Product Catalog Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage catalog products and the categories available throughout CheckLit.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {products.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Categories</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {categoryRecords.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Filtered Products</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {visibleProducts.length}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              {editingProductId ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Products are saved in the backend catalog.
            </p>
          </div>

          {(productError || error) && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {productError || error}
            </p>
          )}

          {(productMessage || successMessage) && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
            >
              {productMessage || successMessage}
            </p>
          )}

          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Product Name *
                </span>
                <input
                  required
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Category *
                </span>
                <select
                  required
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  disabled={loadingCategories || categoryRecords.length === 0}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Select a category</option>
                  {categoryRecords.map((category) => (
                    <option
                      key={category.id || category._id}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoryRecords.length === 0 && !loadingCategories && (
                  <span className="mt-1 block text-xs text-gray-500">
                    Add a category before creating a product.
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Unit Price *
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.unitPrice}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      unitPrice: event.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Unit *
                </span>
                <input
                  required
                  value={productForm.unit}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      unit: event.target.value,
                    }))
                  }
                  placeholder="pcs, kg, pack, bottle"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Icon (optional)
                </span>
                <input
                  value={productForm.icon}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      icon: event.target.value,
                    }))
                  }
                  placeholder="Emoji or icon value"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Description (optional)
                </span>
                <input
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Product description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={savingProduct || isMutating || categoryRecords.length === 0}
                className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProduct
                  ? 'Saving...'
                  : editingProductId
                    ? 'Save Changes'
                    : 'Add Product'}
              </button>

              {editingProductId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              Category Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create or rename categories to keep the product catalog organized.
            </p>
          </div>

          {categoryError && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {categoryError}
            </p>
          )}

          {categoryMessage && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
            >
              {categoryMessage}
            </p>
          )}

          <form onSubmit={handleCategorySubmit} className="mb-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Category Name *
                </span>
                <input
                  required
                  minLength={2}
                  maxLength={50}
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter category name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Description (optional)
                </span>
                <input
                  maxLength={250}
                  value={categoryForm.description}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe this category"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={savingCategory}
                className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
              >
                {savingCategory
                  ? 'Saving...'
                  : editingCategoryId
                    ? 'Save Category'
                    : 'Add Category'}
              </button>

              {editingCategoryId && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {loadingCategories ? (
            <p className="py-6 text-center text-gray-500">
              Loading categories...
            </p>
          ) : categoryRecords.length === 0 ? (
            <p className="py-6 text-center text-gray-500">
              No categories found. Add your first category above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="px-3 py-3 font-semibold">Category</th>
                    <th className="px-3 py-3 font-semibold">Description</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRecords.map((category) => (
                    <tr
                      key={category.id || category._id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-4 font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-3 py-4 text-gray-600">
                        {category.description || '—'}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => startCategoryEdit(category)}
                            className="font-medium text-blue-700 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCategoryDelete(category)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Product Catalog
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Edit prices, update details, or remove products from the catalog.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="All">All Categories</option>
                {categoryRecords.map((category) => (
                  <option
                    key={category.id || category._id}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="py-10 text-center text-gray-500">
              Loading catalog...
            </p>
          ) : visibleProducts.length === 0 ? (
            <p className="py-10 text-center text-gray-500">
              No products match your search.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="px-3 py-3 font-semibold">Product</th>
                    <th className="px-3 py-3 font-semibold">Category</th>
                    <th className="px-3 py-3 font-semibold">Unit</th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Unit Price
                    </th>
                    <th className="px-3 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => (
                    <tr
                      key={product.id || product._id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-4">
                        <div className="font-medium text-gray-900">
                          {product.icon ? `${product.icon} ` : ''}
                          {product.name}
                        </div>
                        {product.description && (
                          <p className="mt-1 max-w-xs text-xs text-gray-500">
                            {product.description}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-4 text-gray-600">
                        {product.category}
                      </td>
                      <td className="px-3 py-4 text-gray-600">
                        {product.unit}
                      </td>
                      <td className="px-3 py-4 text-right font-medium text-gray-900">
                        ₱{product.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => startProductEdit(product)}
                            className="font-medium text-blue-700 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleProductDelete(product)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminProductsPage;