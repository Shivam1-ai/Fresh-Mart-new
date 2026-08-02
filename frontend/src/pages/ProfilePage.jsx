import { Package, Save, ShieldAlert, Truck, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { fetchMyOrders, fetchOrderTracking } from '../api/orderApi.js';
import { createRefundRequest } from '../api/refundApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const phonePattern = /^\d{10}$/;

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [tracking, setTracking] = useState(null);
  const [trackingMessage, setTrackingMessage] = useState('');
  const [refundForm, setRefundForm] = useState({ orderId: '', type: 'Refund', reason: '', amount: '' });
  const phoneError = profile?.phone && !phonePattern.test(profile.phone) ? 'Phone number must contain exactly 10 digits.' : '';

  useEffect(() => {
    if (!user) return;
    setProfile(user);
    api.get('/users/profile').then(({ data }) => setProfile(data)).catch(() => {});
    fetchMyOrders().then(setOrders).catch(() => {});
  }, [user]);

  const updateProfile = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!phonePattern.test(profile?.phone || '')) {
      setMessage('Phone number must contain exactly 10 digits.');
      return;
    }

    try {
      const { data } = await api.put('/users/profile', { name: profile.name, email: profile.email, phone: profile.phone });
      setProfile(data);
      updateUser(data);
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update profile.');
    }
  };

  const loadTracking = async (orderId) => {
    setTrackingMessage('');
    try {
      const data = await fetchOrderTracking(orderId);
      setTracking(data);
      setRefundForm((current) => ({ ...current, orderId }));
      setTrackingMessage('Tracking details loaded.');
    } catch (error) {
      setTrackingMessage(error.response?.data?.message || 'Could not load tracking details.');
    }
  };

  const requestRefund = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await createRefundRequest({
        orderId: refundForm.orderId,
        type: refundForm.type,
        reason: refundForm.reason,
        amount: refundForm.amount ? Number(refundForm.amount) : undefined
      });
      setMessage('Refund request submitted.');
      setRefundForm({ orderId: '', type: 'Refund', reason: '', amount: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not submit refund request.');
    }
  };

  if (!user) return <p className="rounded-lg bg-white p-6 shadow-sm">Please login to view your profile.</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="h-fit rounded-lg bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-limewash text-leaf"><User className="h-6 w-6" /></span>
          <div>
            <h1 className="text-2xl font-black">Profile</h1>
            <p className="text-sm text-slate-500">{profile?.email}</p>
          </div>
        </div>
        <form onSubmit={updateProfile} className="mt-5 space-y-3">
          <input className="w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" value={profile?.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <input type="email" className="w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" value={profile?.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <input
            inputMode="numeric"
            maxLength={10}
            className="w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf"
            value={profile?.phone || ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '') })}
          />
          {phoneError && <p className="text-sm font-semibold text-red-600">{phoneError}</p>}
          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-leaf px-4 py-3 font-bold text-white">
            <Save className="h-4 w-4" /> Save profile
          </button>
        </form>
        {message && <p className="mt-3 rounded-lg bg-limewash p-3 text-sm font-bold text-leaf">{message}</p>}
      </section>
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-leaf" />
          <h2 className="text-2xl font-black">Orders</h2>
        </div>
        <div className="mt-4 space-y-3">
          {orders.length ? orders.map((order) => (
            <article key={order._id} className="rounded-lg border border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-limewash px-3 py-1 text-sm font-bold text-leaf">{order.status}</span>
                  <button onClick={() => loadTracking(order._id)} className="rounded-full border border-slate-200 px-3 py-1 text-sm font-bold text-slate-700">
                    Track
                  </button>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                <strong>Rs. {order.totalPrice}</strong>
              </div>
            </article>
          )) : <p className="rounded-lg bg-slate-50 p-5 text-slate-600">No orders yet.</p>}
        </div>
        {tracking && (
          <section className="mt-6 rounded-lg border border-slate-100 p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-leaf" />
              <h3 className="text-lg font-black">Tracking #{tracking.trackingNumber || tracking._id.slice(-6).toUpperCase()}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-500">Current status: {tracking.status}</p>
            <div className="mt-4 space-y-3">
              {tracking.trackingEvents?.length ? tracking.trackingEvents.map((event, index) => (
                <div key={`${event.createdAt}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <strong>{event.status}</strong>
                    <span className="text-slate-500">{new Date(event.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-slate-600">{event.note}</p>
                </div>
              )) : <p className="text-slate-500">No tracking events available yet.</p>}
            </div>
          </section>
        )}
        {trackingMessage && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{trackingMessage}</p>}
        <form onSubmit={requestRefund} className="mt-6 space-y-3 rounded-lg border border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-tomato" />
            <h3 className="text-lg font-black">Refund or return request</h3>
          </div>
          <select
            required
            value={refundForm.orderId}
            onChange={(event) => setRefundForm({ ...refundForm, orderId: event.target.value })}
            className="w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf"
          >
            <option value="">Select order</option>
            {orders.map((order) => <option key={order._id} value={order._id}>Order {order._id.slice(-6).toUpperCase()}</option>)}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={refundForm.type}
              onChange={(event) => setRefundForm({ ...refundForm, type: event.target.value })}
              className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf"
            >
              <option value="Refund">Refund</option>
              <option value="Return">Return</option>
              <option value="Dispute">Dispute</option>
            </select>
            <input
              value={refundForm.amount}
              onChange={(event) => setRefundForm({ ...refundForm, amount: event.target.value })}
              placeholder="Requested amount"
              className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf"
            />
          </div>
          <textarea
            required
            rows="4"
            value={refundForm.reason}
            onChange={(event) => setRefundForm({ ...refundForm, reason: event.target.value })}
            placeholder="Reason for refund or dispute"
            className="w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf"
          />
          <button className="rounded-md bg-tomato px-4 py-3 font-bold text-white">Submit request</button>
        </form>
      </section>
    </div>
  );
};

export default ProfilePage;
