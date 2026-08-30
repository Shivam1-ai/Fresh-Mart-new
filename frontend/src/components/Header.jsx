import { Leaf, LogOut, Menu, ShoppingCart, User, X } from 'lucide-react';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const { itemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeVendorSection, setActiveVendorSection] = useState('vendor-dashboard-top');

  const linkClass = ({ isActive }) =>
    `rounded-full px-3 py-2 transition ${
      isActive ? 'bg-leaf text-white shadow-sm' : 'text-slate-700 hover:bg-limewash hover:text-leaf'
    }`;

  const vendorLinkClass = (sectionId) =>
    `rounded-full px-3 py-2 transition ${
      activeVendorSection === sectionId ? 'bg-leaf text-white shadow-sm' : 'text-slate-700 hover:bg-limewash hover:text-leaf'
    }`;

  const close = () => setOpen(false);

  const scrollToVendorSection = (sectionId) => (event) => {
    event.preventDefault();
    close();
    setActiveVendorSection(sectionId);
    const scrollToId = () => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    if (window.location.hash.startsWith('#/vendor')) {
      scrollToId();
    } else {
      navigate('/vendor');
      setTimeout(scrollToId, 150);
    }
  };

  const handleLogout = (event) => {
    event?.preventDefault();

    flushSync(() => {
      clearCart();
      logout();
      close();
    });

    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" onClick={close} className="flex items-center gap-2 text-xl font-black text-leaf">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-limewash">
              <Leaf className="h-6 w-6" />
            </span>
            FreshMart
          </Link>
          <button
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-emerald-100 p-2 text-slate-700 lg:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden items-center gap-2 text-sm font-semibold lg:flex lg:flex-wrap lg:justify-end">
            <NavLinks user={user} itemCount={itemCount} linkClass={linkClass} close={close} onLogout={handleLogout} scrollToVendorSection={scrollToVendorSection} vendorLinkClass={vendorLinkClass} />
          </div>
        </div>
        <div className={`${open ? 'grid' : 'hidden'} mt-4 gap-2 text-sm font-semibold lg:hidden`}>
          <NavLinks user={user} itemCount={itemCount} linkClass={linkClass} close={close} onLogout={handleLogout} scrollToVendorSection={scrollToVendorSection} vendorLinkClass={vendorLinkClass} />
        </div>
      </nav>
    </header>
  );
};

const NavLinks = ({ user, itemCount, linkClass, close, onLogout, scrollToVendorSection, vendorLinkClass }) => (
  <>
    {!user ? (
      <>
        <NavLink to="/" onClick={close} className={linkClass}>Home</NavLink>
        <NavLink to="/products" onClick={close} className={linkClass}>Products</NavLink>
        <NavLink to="/login" onClick={close} className="rounded-full px-3 py-2 transition text-slate-700 hover:bg-limewash hover:text-leaf">
          Login
        </NavLink>
        <NavLink to="/login" state={{ mode: 'register' }} onClick={close} className="rounded-full bg-leaf px-4 py-2 text-center text-white shadow-sm transition hover:bg-emerald-700">
          Register
        </NavLink>
      </>
    ) : user.role === 'vendor' ? (
      <>
        <Link to="/vendor" onClick={scrollToVendorSection('vendor-dashboard-top')} className={vendorLinkClass('vendor-dashboard-top')}>Dashboard</Link>
        <Link to="/vendor" onClick={scrollToVendorSection('vendor-orders-section')} className={vendorLinkClass('vendor-orders-section')}>Orders</Link>
        <Link to="/vendor" onClick={scrollToVendorSection('vendor-products-list-section')} className={vendorLinkClass('vendor-products-list-section')}>Products</Link>
        <Link to="/vendor" onClick={scrollToVendorSection('vendor-profile-section')} className={`${vendorLinkClass('vendor-profile-section')} flex items-center gap-2`}>
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name || 'Profile'} className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <User className="h-5 w-5" aria-hidden="true" />
          )}
          <span>Profile</span>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full border border-emerald-100 px-3 py-2 text-slate-700 transition hover:bg-limewash hover:text-leaf"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </>
    ) : user.role === 'admin' ? (
      <>
        <NavLink to="/admin" end onClick={close} className={linkClass}>Dashboard</NavLink>
        <NavLink to="/admin/users" onClick={close} className={linkClass}>Users</NavLink>
        <NavLink to="/admin/vendors" onClick={close} className={linkClass}>Vendors</NavLink>
        <NavLink to="/products" onClick={close} className={linkClass}>Products</NavLink>
        <NavLink to="/admin/categories" onClick={close} className={linkClass}>Categories</NavLink>
        <NavLink to="/admin/reports" onClick={close} className={linkClass}>Reports</NavLink>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full border border-emerald-100 px-3 py-2 text-slate-700 transition hover:bg-limewash hover:text-leaf"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </>
    ) : (
      <>
        <NavLink to="/" onClick={close} className={linkClass}>Home</NavLink>
        <NavLink to="/products" onClick={close} className={linkClass}>Products</NavLink>
        <NavLink to="/cart" onClick={close} className={({ isActive }) => `${linkClass({ isActive })} relative flex items-center gap-2`}>
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          <span>Cart</span>
          {itemCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1 text-xs text-white">
              {itemCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/orders" onClick={close} className={({ isActive }) => `${linkClass({ isActive })} flex items-center gap-2`}>
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name || 'Profile'} className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <User className="h-5 w-5" aria-hidden="true" />
          )}
          <span>Orders</span>
        </NavLink>
        <NavLink to="/profile" onClick={close} className={({ isActive }) => `${linkClass({ isActive })} flex items-center gap-2`}>
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name || 'Profile'} className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <User className="h-5 w-5" aria-hidden="true" />
          )}
          <span>Profile</span>
        </NavLink>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full border border-emerald-100 px-3 py-2 text-slate-700 transition hover:bg-limewash hover:text-leaf"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </>
    )}
  </>
);

export default Header;
