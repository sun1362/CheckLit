
import { type ReactNode } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/home';
import { CreateListPage } from './pages/createListPage';
import { ListDetailsPage } from './pages/listDetailsPage';
import { ProductsPage } from './pages/products';
import { AnalyticsPage } from './pages/analytics';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ProfilePage } from './pages/profile';
import { AboutPage } from './pages/about';
import { NotFoundPage } from './pages/notFound';
import { AdminProductsPage } from './pages/adminProducts';
import { getAuthToken, getAuthUser } from './services/api';

const GUEST_MODE_KEY = 'checklit_guest_mode';

function hasAuthenticatedSession() {
  return Boolean(getAuthToken() && getAuthUser());
}

function hasGuestSession() {
  return sessionStorage.getItem(GUEST_MODE_KEY) === 'true';
}

function hasActiveSession() {
  return hasAuthenticatedSession() || hasGuestSession();
}

function GuestOrAuthenticatedRoute() {
  const location = useLocation();

  if (!hasActiveSession()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

function AuthenticatedRoute() {
  const location = useLocation();

  if (!hasAuthenticatedSession()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

function AdminRoute() {
  if (!hasAuthenticatedSession()) {
    return <Navigate to="/login" replace />;
  }

  if (getAuthUser()?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function LoginRegisterRoute({ children }: { children: ReactNode }) {
  if (hasAuthenticatedSession()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ApplicationLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginRegisterRoute>
              <LoginPage />
            </LoginRegisterRoute>
          }
        />

        <Route
          path="/register"
          element={
            <LoginRegisterRoute>
              <RegisterPage />
            </LoginRegisterRoute>
          }
        />

        <Route element={<GuestOrAuthenticatedRoute />}>
          <Route path="/" element={<ApplicationLayout />}>
            <Route index element={<HomePage />} />
            <Route path="create" element={<CreateListPage />} />
            <Route path="edit/:id" element={<CreateListPage />} />
            <Route path="list/:id" element={<ListDetailsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="about" element={<AboutPage />} />

            <Route element={<AuthenticatedRoute />}>
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route
                path="admin/products"
                element={<AdminProductsPage />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
