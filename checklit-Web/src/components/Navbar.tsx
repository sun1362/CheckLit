
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Home,
  Package,
  BarChart3,
  UserRound,
  Info,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
} from '../services/api';

export function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = getAuthToken();
  const user = getAuthUser();
  const isAuthenticated = Boolean(token && user);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Package },
    ...(isAuthenticated
      ? [{ to: '/analytics', label: 'Analytics', icon: BarChart3 }]
      : []),
    { to: '/about', label: 'About', icon: Info },
    ...(isAuthenticated
      ? [{ to: '/profile', label: 'Profile', icon: UserRound }]
      : []),
    ...(isAdmin
      ? [{ to: '/admin/products', label: 'Manage Catalog', icon: ShieldCheck }]
      : []),
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-50 text-emerald-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return;

    clearAuthSession();
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const handleGuestExit = () => {
    if (
      !window.confirm(
        'Exit guest mode? Your temporary shopping lists will be lost. Download any lists you want to keep before leaving.'
      )
    ) {
      return;
    }

    sessionStorage.removeItem('checklit_guest_shopping_lists_v1');
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ShoppingBag size={20} />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            CheckLit
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={linkClass}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              <span className="max-w-36 truncate text-sm text-slate-600">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGuestExit}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Exit Guest
              </button>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <LogIn size={16} />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <UserPlus size={16} />
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={linkClass}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 border-t border-slate-200 pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <p className="truncate text-sm text-slate-600">
                  Signed in as {user?.name}
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  <LogIn size={16} />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <UserPlus size={16} />
                  Register
                </Link>
                <button
                  type="button"
                  onClick={handleGuestExit}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Exit Guest
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
