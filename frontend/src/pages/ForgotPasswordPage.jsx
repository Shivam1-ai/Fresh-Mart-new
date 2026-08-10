import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword as forgotPasswordApi } from '../api/authApi.js';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await forgotPasswordApi(email);
      setMessage('If that email exists, a reset link has been sent.');
    } catch (err) {
      if (!err.response) {
        setError('Could not reach the server. Check VITE_API_URL and make sure the backend is running.');
      } else {
        setError(err.response?.data?.message || 'Could not send the reset link. Check backend SMTP settings.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-600">Enter your email and we'll send a password reset link.</p>
      {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-700">{message}</p>}
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 focus-within:border-leaf focus-within:bg-white">
          <span className="text-slate-400"><Mail className="h-5 w-5" /></span>
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-3 outline-none" />
        </label>
        <button disabled={submitting} className="w-full rounded-md bg-leaf px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300">
          {submitting ? 'Please wait' : 'Send reset link'}
        </button>
      </form>
      <Link to="/login" className="mt-4 inline-block text-sm font-bold text-leaf underline underline-offset-4 hover:text-emerald-700">
        Back to login
      </Link>
    </div>
  );
};

export default ForgotPasswordPage;
