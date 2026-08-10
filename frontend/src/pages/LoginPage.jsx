import { Leaf, Lock, Mail, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const roleOptions = [
  { label: 'Customer', value: 'user' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Admin', value: 'admin' }
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user', storeName: '', businessName: '', gstNumber: '', pickupAddress: '', description: '', supportEmail: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const phoneError = mode === 'register' && form.phone && !phonePattern.test(form.phone) ? 'Phone number must contain exactly 10 digits.' : '';

  useEffect(() => {
    if (location.state?.mode === 'register' || new URLSearchParams(location.search).get('mode') === 'register') {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [location.state, location.search]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!emailPattern.test(form.email)) {
        setError('Enter a valid email address.');
        return;
      }

      if (!phonePattern.test(form.phone)) {
        setError('Phone number must contain exactly 10 digits.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.role === 'vendor' ? { ...form, vendorProfile: { storeName: form.storeName, businessName: form.businessName, gstNumber: form.gstNumber, pickupAddress: form.pickupAddress, description: form.description, supportEmail: form.supportEmail } } : form);

      navigate(result.role === 'vendor' ? '/vendor' : result.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
      <section className="bg-leaf p-8 text-white sm:p-10">
        <Leaf className="h-10 w-10" />
        <h1 className="mt-6 text-3xl font-black">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="mt-3 leading-7 text-emerald-50">
          Save your cart, place COD orders, and track FreshMart deliveries from your profile.
        </p>
        <div className="mt-8 rounded-lg bg-white/10 p-4 text-sm">
          Use customer or vendor registration for public sign-up. Admin accounts are created separately.
        </div>
      </section>
      <section className="p-6 sm:p-8">
        <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm font-bold">
          <button onClick={() => setMode('login')} className={`rounded-full py-2 ${mode === 'login' ? 'bg-white text-leaf shadow-sm' : 'text-slate-600'}`}>Login</button>
          <button onClick={() => setMode('register')} className={`rounded-full py-2 ${mode === 'register' ? 'bg-white text-leaf shadow-sm' : 'text-slate-600'}`}>Register</button>
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <Field icon={<User className="h-5 w-5" />} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          )}
          <Field icon={<Mail className="h-5 w-5" />} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {mode === 'register' && (
            <>
              <Field icon={<Phone className="h-5 w-5" />} placeholder="Phone" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} />
              <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 focus-within:border-leaf focus-within:bg-white">
                <span className="text-slate-400"><User className="h-5 w-5" /></span>
                <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-transparent py-3 outline-none">
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </label>
              {phoneError && <p className="-mt-2 text-sm font-semibold text-red-600">{phoneError}</p>}
              {form.role === 'vendor' && (
                <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                  <Field placeholder="Store name" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                  <Field placeholder="Business name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
                  <Field placeholder="GST number" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
                  <Field type="email" placeholder="Support email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
                  <label className="sm:col-span-2">
                    <textarea rows="3" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} placeholder="Pickup address" className="w-full rounded-md border border-slate-200 bg-white px-3 py-3 outline-none focus:border-leaf" />
                  </label>
                  <label className="sm:col-span-2">
                    <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Store description" className="w-full rounded-md border border-slate-200 bg-white px-3 py-3 outline-none focus:border-leaf" />
                  </label>
                </div>
              )}
            </>
          )}
          <Field icon={<Lock className="h-5 w-5" />} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {mode === 'login' && (
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-leaf underline underline-offset-4 transition hover:text-emerald-700"
              >
                Forgot password?
              </Link>
            </div>
          )}
          <button disabled={submitting} className="w-full rounded-md bg-leaf px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300">
            {submitting ? 'Please wait' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </section>
    </div>
  );
};

const Field = ({ icon, ...props }) => (
  <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 focus-within:border-leaf focus-within:bg-white">
    <span className="text-slate-400">{icon}</span>
    <input required className="w-full bg-transparent py-3 outline-none" {...props} />
  </label>
);

export default LoginPage;
