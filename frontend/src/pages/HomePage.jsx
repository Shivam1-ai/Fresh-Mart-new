import { ChevronDown, Clock3, Flame, Search, ShieldCheck, SlidersHorizontal, Sparkles, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Grains', 'Beverages', 'Snacks', 'Household'];
const categoryCards = [
  {
    name: 'Fruits',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=500&q=80',
    tone: 'bg-rose-50 text-rose-700'
  },
  {
    name: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80',
    tone: 'bg-emerald-50 text-emerald-700'
  },
  {
    name: 'Dairy',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=500&q=80',
    tone: 'bg-sky-50 text-sky-700'
  },
  {
    name: 'Beverages',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80',
    tone: 'bg-orange-50 text-orange-700'
  },
  {
    name: 'Snacks',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=500&q=80',
    tone: 'bg-violet-50 text-violet-700'
  }
];

const sorts = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price low to high', value: 'price' },
  { label: 'Price high to low', value: '-price' },
  { label: 'Top rated', value: '-rating' }
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const featured = products.filter((product) => product.isFeatured).slice(0, 3);

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      setLoading(true);
      setError('');
      const params = {
        search: search || undefined,
        category: category === 'All' ? undefined : category,
        sort,
        page,
        limit: 100
      };
      const { data } = await api.get('/products', { params, signal: controller.signal });
      setProducts((currentProducts) => (page === 1 ? data.products : [...currentProducts, ...data.products]));
      setTotalProducts(data.total || data.products.length);
      setTotalPages(data.pages || 1);
      setLoading(false);
    };
    loadProducts().catch((err) => {
      if (err.name === 'CanceledError') return;
      setError('Could not load products. Start the backend and make sure MongoDB Atlas allows your current IP address.');
      setLoading(false);
    });
    return () => controller.abort();
  }, [search, category, sort, page]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-lg bg-slate-950 text-white shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85"
          alt="Fresh groceries arranged at a market"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative grid min-h-[420px] gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:p-10">
          <div className="flex max-w-2xl flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-black text-leaf">
              <Sparkles className="h-4 w-4" /> Morning market picks
            </span>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">Fresh groceries for tonight, tomorrow, and the whole week.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/90">
              Fruits, vegetables, chilled dairy, drinks, and snacks delivered fresh with simple COD checkout.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => { setCategory('Vegetables'); document.getElementById('shop-groceries')?.scrollIntoView({ behavior: 'smooth' }); }} className="rounded-full bg-white px-5 py-3 text-sm font-black text-leaf transition hover:bg-limewash" >
                Shop fresh produce
              </button>
              <button onClick={() => { setCategory('Snacks'); document.getElementById('shop-groceries')?.scrollIntoView({ behavior: 'smooth' }); }} className="rounded-full border border-white/70 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15" >
                Browse snacks
              </button>
            </div>
          </div>
          <div className="self-end rounded-lg bg-white/95 p-4 text-slate-950 shadow-xl backdrop-blur">
            <div className="grid gap-3">
              <HeroPoint icon={<Truck className="h-5 w-5" />} title="Free delivery" text="On orders above Rs. 499" />
              <HeroPoint icon={<Clock3 className="h-5 w-5" />} title="Quick dispatch" text="Packed fresh from local inventory" />
              <HeroPoint icon={<ShieldCheck className="h-5 w-5" />} title="Quality checked" text="Produce and dairy inspected before delivery" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-500">Fresh stock</p>
          <p className="mt-1 text-3xl font-black">Daily</p>
        </div>
        <div className="rounded-lg bg-[#fff7ed] p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-orange-700">Weekend basket</p>
          <p className="mt-1 text-3xl font-black">Save up to 20%</p>
        </div>
        <div className="rounded-lg bg-[#eef6ff] p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-sky-700">Payments</p>
          <p className="mt-1 text-3xl font-black">COD ready</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Shop by aisle</h2>
            <p className="mt-1 text-sm text-slate-500">Jump straight into the sections people reorder most.</p>
          </div>
          <button onClick={() => setCategory('All')} className="hidden text-sm font-black text-leaf sm:block">View all</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categoryCards.map((item) => (
            <button
              key={item.name}
              onClick={() => setCategory(item.name)}
              className={`group overflow-hidden rounded-lg bg-white text-left shadow-sm ring-1 ring-emerald-100 transition hover:-translate-y-1 hover:shadow-xl ${category === item.name ? 'ring-2 ring-leaf' : ''}`}
            >
              <img src={item.image} alt={item.name} className="h-32 w-full object-cover transition duration-300 group-hover:scale-105" />
              <div className="flex items-center justify-between p-4">
                <span className="font-black">{item.name}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${item.tone}`}>Open</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 focus-within:border-leaf focus-within:bg-white">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search groceries"
              className="w-full border-0 bg-transparent py-3 outline-none"
            />
          </label>
          <label className="relative flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
            <SlidersHorizontal className="h-5 w-5 text-slate-400" />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full appearance-none bg-transparent py-3 pr-8 font-semibold outline-none"
            >
              {sorts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
          </label>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
              category === item ? 'bg-leaf text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-limewash hover:text-leaf'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div id="shop-groceries" className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Shop groceries</h2>
          <p className="mt-1 text-sm text-slate-500">
            {loading && page === 1 ? 'Finding the freshest matches...' : `${products.length} of ${totalProducts} products shown`}
          </p>
        </div>
        {(search || category !== 'All') && (
          <button onClick={() => { setSearch(''); setCategory('All'); }} className="text-sm font-bold text-leaf">
            Clear filters
          </button>
        )}
      </div>

      {error && <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

      {!loading && !error && featured.length > 0 && category === 'All' && !search && (
        <section className="rounded-lg bg-slate-950 p-5 text-white shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black"><Flame className="h-6 w-6 text-orange-300" /> Featured deals</h2>
              <p className="mt-1 text-sm text-white/70">Best value picks from today's fresh stock.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((product) => (
              <button
                key={product._id}
                onClick={() => setSearch(product.name)}
                className="flex items-center gap-3 rounded-lg bg-white/10 p-3 text-left transition hover:bg-white/15"
              >
                <img src={product.images?.[0]?.url} alt={product.name} className="h-16 w-16 rounded-md object-cover" />
                <span>
                  <span className="block font-black">{product.name}</span>
                  <span className="text-sm text-white/70">Rs. {product.price} per {product.unit}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-lg bg-white shadow-sm" />
          ))}
        </section>
      ) : products.length ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </section>
          {page < totalPages && (
            <div className="flex justify-center">
              <button
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={loading}
                className="rounded-full bg-leaf px-6 py-3 font-bold text-white shadow-sm transition hover:bg-leaf-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Loading...' : 'Load more products'}
              </button>
            </div>
          )}
        </>
      ) : (
        <section className="rounded-lg bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-bold">No products found</h3>
          <p className="mt-2 text-slate-600">Try another search or switch categories.</p>
          <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-4 rounded-full bg-leaf px-5 py-2 font-bold text-white">
            Show all products
          </button>
        </section>
      )}
    </div>
  );
};

const HeroPoint = ({ icon, title, text }) => (
  <div className="flex gap-3 rounded-lg border border-slate-100 p-3">
    <span className="grid h-10 w-10 place-items-center rounded-full bg-limewash text-leaf">{icon}</span>
    <span>
      <span className="block font-black">{title}</span>
      <span className="text-sm text-slate-500">{text}</span>
    </span>
  </div>
);

export default HomePage;
