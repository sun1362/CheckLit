import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/create" element={<CreateListPage />} />
            <Route path="/edit/:id" element={<CreateListPage />} />
            <Route path="/list/:id" element={<ListDetailsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
