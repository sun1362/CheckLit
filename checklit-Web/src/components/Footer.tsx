
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ShoppingBag size={19} />
            </span>
            <span className="text-lg font-bold text-slate-900">
              CheckLit
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-6 text-slate-500">
            Create shopping lists, calculate costs, track purchases, and manage your grocery budget.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Navigation
          </h2>
          <div className="flex flex-col items-start gap-2 text-sm text-slate-600">
            <Link to="/" className="hover:text-emerald-700">
              Home
            </Link>
            <Link to="/products" className="hover:text-emerald-700">
              Products
            </Link>
            <Link to="/about" className="hover:text-emerald-700">
              About CheckLit
            </Link>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Your Lists
          </h2>
          <div className="flex flex-col items-start gap-2 text-sm text-slate-600">
            <Link to="/create" className="hover:text-emerald-700">
              Create a List
            </Link>
            <Link to="/analytics" className="hover:text-emerald-700">
              Spending Analytics
            </Link>
            <Link to="/profile" className="hover:text-emerald-700">
              My Profile
            </Link>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            About
          </h2>
          <p className="text-sm leading-6 text-slate-500">
            CheckLit helps you organize products, monitor shopping expenses, and keep your shopping plans in one place.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} CheckLit. All rights reserved.</p>
          <p>Shopping lists made simple.</p>
        </div>
      </div>
    </footer>
  );
}
