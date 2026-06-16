import { Leaf, LogOut, Menu, ShoppingCart, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `rounded-full px-3 py-2 transition ${
      isActive ? 'bg-leaf text-white shadow-sm' : 'text-slate-700 hover:bg-limewash hover:text-leaf'
    }`;

  const close = () => setOpen(false);

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
            className="rounded-full border border-emerald-100 p-2 text-slate-700 md:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden items-center gap-2 text-sm font-semibold md:flex">
            <NavLinks user={user} logout={logout} itemCount={itemCount} linkClass={linkClass} close={close} />
          </div>
        </div>
        <div className={`${open ? 'grid' : 'hidden'} mt-4 gap-2 text-sm font-semibold md:hidden`}>
          <NavLinks user={user} logout={logout} itemCount={itemCount} linkClass={linkClass} close={close} />
        </div>
      </nav>
    </header>
  );
};

const NavLinks = ({ user, logout, itemCount, linkClass, close }) => (
  <>
    <NavLink to="/" onClick={close} className={linkClass}>Shop</NavLink>
    <NavLink to="/vendor" onClick={close} className={linkClass}>Vendor</NavLink>
    <NavLink to="/cart" onClick={close} className={({ isActive }) => `${linkClass({ isActive })} relative flex items-center gap-2`}>
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
      <span>Cart</span>
      {itemCount > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1 text-xs text-white">
          {itemCount}
        </span>
      )}
    </NavLink>
    {user ? (
      <>
        <NavLink to="/profile" onClick={close} className={({ isActive }) => `${linkClass({ isActive })} flex items-center gap-2`}>
          <User className="h-5 w-5" aria-hidden="true" />
          <span>Profile</span>
        </NavLink>
        {user.role === 'admin' && <NavLink to="/admin" onClick={close} className={linkClass}>Admin</NavLink>}
        <button
          onClick={() => {
            logout();
            close();
          }}
          className="flex items-center gap-2 rounded-full border border-emerald-100 px-3 py-2 text-slate-700 transition hover:bg-limewash hover:text-leaf"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </>
    ) : (
      <NavLink to="/login" onClick={close} className="rounded-full bg-leaf px-4 py-2 text-center text-white shadow-sm transition hover:bg-emerald-700">
        Login
      </NavLink>
    )}
  </>
);

export default Header;
