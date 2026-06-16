import { Heart, ShoppingBasket, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const outOfStock = product.countInStock < 1;

  const handleAdd = async () => {
    setMessage('');
    setAdding(true);
    try {
      await addToCart(product._id);
      setMessage('Added');
    } catch (error) {
      setMessage(error.response?.status === 401 ? 'Login first' : 'Try again');
    } finally {
      setAdding(false);
      window.setTimeout(() => setMessage(''), 1800);
    }
  };

  return (
    <article className="group overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden bg-limewash">
        <img src={image} alt={product.name} className="h-48 w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-2">
          {discount > 0 && <span className="rounded-full bg-tomato px-2 py-1 text-xs font-bold text-white">{discount}% off</span>}
          {outOfStock && <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-bold text-white">Out of stock</span>}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-bold uppercase text-leaf">{product.category}</p>
          <Link to={`/products/${product._id}`} className="mt-1 block text-base font-semibold hover:text-leaf">
            {product.name}
          </Link>
          <p className="mt-1 text-sm text-slate-500">{product.unit} | {product.countInStock} in stock</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-bold">Rs. {product.price}</span>
            {product.mrp > product.price && <span className="text-sm text-slate-400 line-through">Rs. {product.mrp}</span>}
          </div>
          <span className="flex items-center gap-1 text-sm text-amber-600">
            <Star className="h-4 w-4 fill-current" /> {product.rating?.toFixed?.(1) || '0.0'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            disabled={adding || outOfStock}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-leaf px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ShoppingBasket className="h-4 w-4" /> {adding ? 'Adding' : message || 'Add'}
          </button>
          <button
            onClick={() => setSaved((value) => !value)}
            className={`rounded-md border border-emerald-200 p-2 transition ${saved ? 'bg-rose-50 text-tomato' : 'text-leaf hover:bg-limewash'}`}
            aria-label="Wishlist"
          >
            <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
