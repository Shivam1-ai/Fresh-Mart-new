import { Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CartPage from './pages/CartPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import VendorPage from './pages/VendorPage.jsx';

const App = () => (
  <div className="min-h-screen bg-[#f5f7f1] text-slate-950">
    <Header />
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/vendor" element={<VendorPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </main>
    <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 text-sm text-slate-500 sm:px-6 lg:px-8">
      FreshMart delivers local produce, pantry staples, and everyday essentials with care.
    </footer>
  </div>
);

export default App;
