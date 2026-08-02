import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import { AdminRoute, CustomerRoute, VendorRoute } from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const VendorPage = lazy(() => import('./pages/VendorPage.jsx'));

const getDashboardPath = (role) => {
  if (role === 'vendor') return '/vendor';
  if (role === 'admin') return '/admin';
  return '/';
};

const LoadingShell = () => (
  <div className="grid gap-4">
    <div className="h-10 w-40 animate-pulse rounded-full bg-white/80" />
    <div className="h-80 animate-pulse rounded-2xl bg-white" />
    <div className="h-40 animate-pulse rounded-2xl bg-white" />
  </div>
);

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />;
  return children;
};

const NotFoundPage = () => (
  <div className="rounded-lg bg-white p-8 shadow-sm">
    <h1 className="text-3xl font-black">Page not found</h1>
    <p className="mt-2 text-slate-600">The page you tried to open does not exist.</p>
  </div>
);

const App = () => (
  <div className="min-h-screen bg-[#f5f7f1] text-slate-950">
    <Header />
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Suspense fallback={<LoadingShell />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
          <Route path="/orders" element={<CustomerRoute><ProfilePage /></CustomerRoute>} />
          <Route path="/profile" element={<CustomerRoute><ProfilePage /></CustomerRoute>} />
          <Route path="/vendor" element={<VendorRoute><VendorPage /></VendorRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </main>
    <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 text-sm text-slate-500 sm:px-6 lg:px-8">
      FreshMart delivers local produce, pantry staples, and everyday essentials with care.
    </footer>
  </div>
);

export default App;
