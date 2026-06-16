import { Leaf, Lock, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      navigate('/');
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
          Admin demo: admin@freshmart.com / Admin@12345
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
            <Field icon={<Phone className="h-5 w-5" />} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          )}
          <Field icon={<Lock className="h-5 w-5" />} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
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
