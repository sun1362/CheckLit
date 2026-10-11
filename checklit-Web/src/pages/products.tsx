
import { useProducts } from '../hooks/useProducts';

export function ProductsPage() {
  const {
    filteredProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
  } = useProducts();

  const handleRetry = async () => {
    await Promise.allSettled([fetchProducts(), fetchCategories()]);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            CheckLit Catalog
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Browse Products
          </h1>
          <p className="mt-2 text-gray-600">
            Browse available products and their current catalog prices before
            adding them to your shopping list.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Matching Products</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {filteredProducts.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Available Categories</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {Math.max(categories.length - 1, 0)}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Search products
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by product name or description..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Filter by category
              </span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              {selectedCategory === 'All'
                ? 'Showing all available categories.'
                : `Category: ${selectedCategory}`}
            </p>

            {(searchQuery || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-sm font-semibold text-green-700 hover:text-green-900"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {error && (
          <section
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="font-medium text-red-800">
              Unable to load the catalog
            </p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void handleRetry()}
              className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Try Again
            </button>
          </section>
        )}

        {loading ? (
          <section className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-medium text-gray-700">Loading product catalog...</p>
            <p className="mt-2 text-sm text-gray-500">
              Retrieving products and categories from the server.
            </p>
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-4xl" aria-hidden="true">
              🛒
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No products found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Try another search term or select a different category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-5 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
            >
              Show All Products
            </button>
          </section>
        ) : (
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Catalog
              </h2>
              <p className="text-sm text-gray-500">
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id || product._id}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">
                      {product.icon || '🛍️'}
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="mt-4 break-words text-lg font-semibold text-gray-900">
                    {product.name}
                  </h3>

                  <p className="mt-2 min-h-10 flex-1 text-sm leading-5 text-gray-500">
                    {product.description || 'No description available.'}
                  </p>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <p className="text-2xl font-bold text-green-800">
                      ₱
                      {product.unitPrice.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      per {product.unit}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default ProductsPage;
