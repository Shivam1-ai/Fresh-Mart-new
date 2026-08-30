import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resetPassword as resetPasswordApi } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const ResetPasswordPage = () => {
  const { token: paramToken } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setSubmitting(true);
    try {
      const token = paramToken || new URLSearchParams(window.location.search).get('token');
      const { data } = await resetPasswordApi(token, password);
      // backend returns user payload with token
      updateUser(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black">Reset password</h1>
      <p className="mt-2 text-sm text-slate-600">Choose a new password for your account.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 focus-within:border-leaf focus-within:bg-white">
          <span className="text-slate-400"><Lock className="h-5 w-5" /></span>
          <input required type={showPassword ? 'text' : 'password'} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-3 outline-none" />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="text-slate-400 transition hover:text-leaf"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </label>
        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 focus-within:border-leaf focus-within:bg-white">
          <span className="text-slate-400"><Lock className="h-5 w-5" /></span>
          <input required type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full bg-transparent py-3 outline-none" />
          <button
            type="button"
            onClick={() => setShowConfirm((value) => !value)}
            className="text-slate-400 transition hover:text-leaf"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </label>
        <button disabled={submitting} className="w-full rounded-md bg-leaf px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300">
          {submitting ? 'Please wait' : 'Reset password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
