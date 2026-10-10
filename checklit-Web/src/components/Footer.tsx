import React from 'react';
import { ShoppingBag, Heart, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">

          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500 rounded-xl text-slate-900 font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CheckLit</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart grocery shopping list and real-time total price calculator application. Organize, calculate, and track your food budgets effortlessly.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="/" className="hover:text-emerald-400 transition-colors">Home Dashboard</a></li>
              <li><a href="/create" className="hover:text-emerald-400 transition-colors">Create Shopping List</a></li>
              <li><a href="/products" className="hover:text-emerald-400 transition-colors">Product Catalog</a></li>
              <li><a href="/analytics" className="hover:text-emerald-400 transition-colors">Spending Analytics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Grocery Categories</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><span className="hover:text-emerald-400">🥦 Vegetables & Greens</span></li>
              <li><span className="hover:text-emerald-400">🍎 Fresh Fruits</span></li>
              <li><span className="hover:text-emerald-400">🥩 Meat & Seafood</span></li>
              <li><span className="hover:text-emerald-400">🧂 Seasonings & Oils</span></li>
              <li><span className="hover:text-emerald-400">🥛 Dairy & Bakery</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Full-Stack Tech</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Axios', 'Node.js', 'Express', 'MongoDB'].map((tech) => (
                <span key={tech} className="px-2.5 py-1 bg-slate-800 text-emerald-400 text-xs font-mono rounded-lg border border-slate-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>CheckLit Full-Stack Web Application &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Web Development Project</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
