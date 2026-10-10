import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, PlusCircle, LayoutDashboard, Store, BarChart2, User, Menu, X, CheckSquare } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-emerald-600 bg-emerald-50 font-semibold'
      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50 font-medium';
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Products Catalog', path: '/products', icon: Store },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'About', path: '/about', icon: CheckSquare },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-900 bg-clip-text text-transparent tracking-tight">
                CheckLit
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Grocery Calc
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all ${isActive(
                    link.path
                  )}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons & Auth */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/create"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create List</span>
            </Link>

            <Link
              to="/login"
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="User Account"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/create"
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  location.pathname === link.path
                    ? 'text-emerald-600 bg-emerald-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 px-3 py-2"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Login / Account</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
