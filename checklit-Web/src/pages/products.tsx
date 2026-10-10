import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { Search, Store } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { filteredProducts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories, loading } = useProducts();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                Grocery Products Catalog
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Browse predefined food ingredients, category pricing, and default measurement units.
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search food catalog by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Cat:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 font-medium text-sm">Loading grocery catalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 bg-slate-50 rounded-xl">{p.icon || '🛒'}</span>
                    <span className="text-[11px] font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full">
                      {p.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{p.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.description || 'Fresh grocery ingredient'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Unit Price</span>
                  <span className="text-lg font-black text-emerald-700">₱{p.unitPrice.toFixed(2)} / {p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
