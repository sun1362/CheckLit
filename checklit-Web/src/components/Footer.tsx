import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, CheckCircle2 } from 'lucide-react';

export const Footer: FC = () => (
  <footer className="mt-auto border-t border-slate-800 bg-slate-900 pb-8 pt-12 text-slate-300">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 border-b border-slate-800 pb-8 md:grid-cols-4">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-500 p-2 text-slate-900"><ShoppingBag className="h-5 w-5" /></div>
            <span className="text-xl font-bold tracking-tight text-white">CheckLit</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Build grocery lists, calculate item totals, track purchased items, and plan your food budget.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Quick Navigation</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link to="/" className="hover:text-emerald-400">Home Dashboard</Link></li>
            <li><Link to="/create" className="hover:text-emerald-400">Create Shopping List</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400">Product Catalog</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400">About CheckLit</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Catalog Categories</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            {['Vegetables', 'Fruits', 'Meat', 'Seafood', 'Seasonings', 'Oils', 'Dairy', 'Bakery', 'Snacks', 'Beverage', 'Other'].map((name) => <li key={name}>{name}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Full-Stack Tech</h4>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Tailwind CSS', 'Axios', 'Node.js', 'Express', 'MongoDB'].map((tech) => (
              <span key={tech} className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-xs text-emerald-400">{tech}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 pt-6 text-xs text-slate-500 sm:flex-row">
        <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><span>CheckLit Full-Stack Web Application © {new Date().getFullYear()}</span></div>
        <div className="flex items-center gap-2"><span>Built with</span><Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /><span>for Web Development</span></div>
      </div>
    </div>
  </footer>
);
