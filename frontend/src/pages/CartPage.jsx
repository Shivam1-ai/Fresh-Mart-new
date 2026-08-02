import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const CartPage = () => {
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const [shippingAddress, setShippingAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');

  const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  const placeOrder = async (event) => {
    event.preventDefault();
    setMessage('');
    setPlacing(true);
    try {
      await api.post('/orders', { shippingAddress, paymentMethod: 'COD' });
      clearCart();
      setShippingAddress({ street: '', city: '', state: '', pincode: '', phone: '' });
      setMessage('Order placed successfully. You can track it from your profile.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not place this order.');
    } finally {
      setPlacing(false);
    }
  };

  if (!user) {
    return (
      <section className="mx-auto max-w-xl rounded-lg bg-white p-8 text-center shadow-sm">
        <ShoppingBag className="mx-auto h-10 w-10 text-leaf" />
        <h1 className="mt-4 text-2xl font-black">Login to use your cart</h1>
        <p className="mt-2 text-slate-600">Your cart is saved to your FreshMart account.</p>
        <Link to="/login" className="mt-5 inline-flex rounded-full bg-leaf px-5 py-3 font-bold text-white">Login or register</Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-3">
        <div>
          <h1 className="text-3xl font-black">Cart</h1>
          <p className="mt-1 text-sm text-slate-500">Review quantities and confirm delivery details.</p>
        </div>
        {cart.items?.length ? cart.items.map((item) => (
          <div key={item.product._id} className="grid gap-4 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-[80px_1fr_auto_auto] sm:items-center">
            <img src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'} alt={item.product.name} className="h-20 w-20 rounded-md object-cover" />
            <div className="flex-1">
              <h2 className="font-semibold">{item.product.name}</h2>
              <p className="text-sm text-slate-600">Rs. {item.product.price} per {item.product.unit}</p>
            </div>
            <div className="flex w-fit items-center rounded-md border border-slate-200">
              <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-2" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
              <span className="min-w-10 text-center font-bold">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-2" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={() => removeFromCart(item.product._id)} className="rounded p-2 text-tomato" aria-label="Remove">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-10 w-10 text-leaf" />
            <h2 className="mt-4 text-xl font-black">Your cart is empty</h2>
            <Link to="/" className="mt-4 inline-flex rounded-full bg-leaf px-5 py-2 font-bold text-white">Start shopping</Link>
          </div>
        )}
      </section>
      <aside className="h-fit rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Order summary</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>Rs. {subtotal}</strong></div>
          <div className="flex justify-between"><span>Delivery</span><strong>{shipping ? `Rs. ${shipping}` : 'Free'}</strong></div>
          <div className="flex justify-between"><span>Tax</span><strong>Rs. {tax}</strong></div>
          <div className="border-t border-slate-100 pt-3 flex justify-between text-base"><span>Total</span><strong>Rs. {total}</strong></div>
        </div>
        <form onSubmit={placeOrder} className="mt-5 space-y-3">
          {['street', 'city', 'state', 'pincode', 'phone'].map((field) => (
            <input
              key={field}
              required
              value={shippingAddress[field]}
              onChange={(event) => setShippingAddress({ ...shippingAddress, [field]: event.target.value })}
              placeholder={field === 'pincode' ? 'PIN code' : field[0].toUpperCase() + field.slice(1)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-leaf"
            />
          ))}
          <button disabled={!cart.items?.length || placing} className="w-full rounded-md bg-leaf px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300">
            {placing ? 'Placing order' : 'Place COD order'}
          </button>
        </form>
        {message && <p className="mt-4 rounded-lg bg-limewash p-3 text-sm font-bold text-leaf">{message}</p>}
      </aside>
    </div>
  );
};

export default CartPage;
