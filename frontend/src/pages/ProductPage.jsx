import { Minus, Plus, ShieldCheck, ShoppingBasket, Star, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById, submitProductReview } from '../api/productApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductById(id)
      .then((data) => setProduct(data))
      .catch(() => setStatus('Could not load this product.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-[520px] animate-pulse rounded-lg bg-white shadow-sm" />;
  if (!product) return <p className="rounded-lg bg-white p-6 text-center font-semibold">{status || 'Product not found.'}</p>;

  const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const outOfStock = product.countInStock < 1;
  const reviews = product.reviews || [];

  const handleAdd = async () => {
    setStatus('');
    try {
      await addToCart(product._id, quantity);
      setStatus(`${quantity} item${quantity > 1 ? 's' : ''} added to cart.`);
    } catch (error) {
      setStatus(error.response?.status === 401 ? 'Please login to add items to your cart.' : 'Could not add this item.');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setSubmittingReview(true);
    setStatus('');

    try {
      await submitProductReview(product._id, review);
      const refreshed = await fetchProductById(product._id);
      setProduct(refreshed);
      setReview({ rating: 5, title: '', comment: '' });
      setStatus('Your review was saved.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Could not save your review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8">
      <Link to="/" className="text-sm font-bold text-leaf">Back to shop</Link>
      <div className="grid gap-8 rounded-lg bg-white p-4 shadow-sm md:grid-cols-2 md:p-6">
        <div className="relative overflow-hidden rounded-lg bg-limewash">
          <img src={image} alt={product.name} className="h-[360px] w-full object-cover sm:h-[480px]" />
          {discount > 0 && <span className="absolute left-4 top-4 rounded-full bg-tomato px-3 py-1 text-sm font-bold text-white">{discount}% off</span>}
        </div>
        <section className="flex flex-col justify-center space-y-5">
          <div>
            <p className="text-sm font-bold uppercase text-leaf">{product.category}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-3 leading-7 text-slate-600">{product.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-black">Rs. {product.price}</span>
            {product.mrp > product.price && <span className="text-lg text-slate-400 line-through">Rs. {product.mrp}</span>}
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
              <Star className="h-4 w-4 fill-current" /> {product.rating?.toFixed?.(1) || '0.0'} ({product.numReviews || 0})
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-100 p-4">
              <Truck className="mb-2 h-5 w-5 text-leaf" />
              <p className="font-bold">Fast local delivery</p>
              <p className="text-sm text-slate-500">Free over Rs. 499</p>
            </div>
            <div className="rounded-lg border border-emerald-100 p-4">
              <ShieldCheck className="mb-2 h-5 w-5 text-leaf" />
              <p className="font-bold">Freshness checked</p>
              <p className="text-sm text-slate-500">{product.countInStock} {product.unit} available</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center rounded-md border border-slate-200">
              <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3 text-slate-600" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center font-bold">{quantity}</span>
              <button onClick={() => setQuantity((value) => Math.min(product.countInStock || 1, value + 1))} className="p-3 text-slate-600" aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-leaf px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300 sm:flex-none"
            >
              <ShoppingBasket className="h-5 w-5" /> {outOfStock ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
          {status && <p className="rounded-lg bg-limewash p-3 text-sm font-bold text-leaf">{status}</p>}
        </section>
      </div>
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Customer notes</h2>
        {reviews.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {reviews.slice(0, 4).map((review) => (
              <article key={review._id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <strong>{review.name}</strong>
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-600"><Star className="h-4 w-4 fill-current" /> {review.rating}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{review.comment || 'Rated this product.'}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-slate-600">No reviews yet. Be the first to rate this item after trying it.</p>
        )}
        {user ? (
          <form onSubmit={handleReviewSubmit} className="mt-6 space-y-3 rounded-lg border border-slate-100 p-4">
            <h3 className="text-lg font-bold">Write a review</h3>
            <input
              value={review.title}
              onChange={(event) => setReview({ ...review, title: event.target.value })}
              placeholder="Review title"
              className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-leaf"
            />
            <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
              <select
                value={review.rating}
                onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })}
                className="rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-leaf"
              >
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
              </select>
              <input
                value={review.comment}
                onChange={(event) => setReview({ ...review, comment: event.target.value })}
                placeholder="Share your experience"
                className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-leaf"
              />
            </div>
            <button disabled={submittingReview} className="rounded-md bg-leaf px-4 py-2 font-bold text-white disabled:bg-slate-300">
              {submittingReview ? 'Saving review' : 'Submit review'}
            </button>
          </form>
        ) : (
          <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Login to leave a review.</p>
        )}
      </section>
    </div>
  );
};

export default ProductPage;
