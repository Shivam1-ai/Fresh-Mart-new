import { BadgePercent, CircleAlert, PackageSearch, ShieldCheck, Store, Users } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  approveVendor,
  createPromotion,
  deletePromotion,
  rejectVendor,
  resolveRefundRequest
} from '../../api/adminApi.js';
import { Metric, Panel } from '../../components/AdminUI.jsx';

const emptyPromotion = {
  code: '',
  title: '',
  description: '',
  discountType: 'percentage',
  value: '',
  minOrderAmount: '',
  categories: ''
};

const AdminDashboardTab = () => {
  const { summary, vendors, promotions, refunds, users, refresh } = useOutletContext();
  const [promotionForm, setPromotionForm] = useState(emptyPromotion);
  const [message, setMessage] = useState('');
  const [refundBusyId, setRefundBusyId] = useState(null);
  const [refundError, setRefundError] = useState('');

  const counts = summary?.counts || {};
  const pendingVendors = vendors.filter((vendor) => vendor.vendorStatus === 'pending');
  const lowStockProducts = summary?.lowStockProducts || [];

  const handleCreatePromotion = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await createPromotion({
        ...promotionForm,
        value: Number(promotionForm.value),
        minOrderAmount: Number(promotionForm.minOrderAmount || 0),
        categories: promotionForm.categories
          ? promotionForm.categories.split(',').map((category) => category.trim()).filter(Boolean)
          : []
      });
      setPromotionForm(emptyPromotion);
      setMessage('Promotion created.');
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not create promotion.');
    }
  };

  const handleApproveVendor = async (vendorId) => {
    await approveVendor(vendorId);
    await refresh();
  };

  const handleRejectVendor = async (vendorId) => {
    if (!window.confirm('Reject this vendor application?')) return;
    await rejectVendor(vendorId, { reason: 'Rejected by administrator' });
    await refresh();
  };

  const handleResolveRefund = async (refundId) => {
    setRefundBusyId(refundId);
    setRefundError('');
    try {
      await resolveRefundRequest(refundId, { status: 'Resolved', resolutionNote: 'Processed by admin' });
      await refresh();
    } catch (err) {
      setRefundError(err.response?.data?.message || 'Could not resolve this refund. Please try again.');
    } finally {
      setRefundBusyId(null);
    }
  };

  const handleDeletePromotion = async (promotionId) => {
    if (!window.confirm('Delete this coupon?')) return;
    await deletePromotion(promotionId);
    await refresh();
  };

  return (
    <div className="space-y-6">
      {message && <p className="rounded-lg bg-limewash p-4 text-sm font-bold text-leaf">{message}</p>}
      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Users />} label="Users" value={counts.users || users.length} />
        <Metric icon={<Store />} label="Vendors" value={counts.vendors || vendors.length} />
        <Metric icon={<PackageSearch />} label="Orders" value={counts.orders || 0} />
        <Metric icon={<BadgePercent />} label="Revenue" value={`Rs. ${counts.revenue || 0}`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Vendor approvals" icon={<ShieldCheck />}>
          <div className="space-y-3">
            {pendingVendors.map((vendor) => (
              <div key={vendor._id} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{vendor.name}</p>
                  <p className="text-sm text-slate-500">{vendor.email}</p>
                  <p className="text-xs text-slate-400">{vendor.vendorProfile?.storeName || 'Store details missing'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveVendor(vendor._id)} className="rounded-full bg-leaf px-3 py-2 text-sm font-bold text-white">Approve</button>
                  <button onClick={() => handleRejectVendor(vendor._id)} className="rounded-full bg-slate-900 px-3 py-2 text-sm font-bold text-white">Reject</button>
                </div>
              </div>
            ))}
            {!pendingVendors.length && <p className="text-slate-500">No pending vendor registrations.</p>}
          </div>
        </Panel>

        <Panel title="Low stock" icon={<PackageSearch />}>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <span className="font-semibold">{product.name}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">{product.countInStock} left</span>
              </div>
            ))}
            {!lowStockProducts.length && <p className="text-slate-500">All products are well stocked.</p>}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Promotions & coupons" icon={<BadgePercent />}>
          <form onSubmit={handleCreatePromotion} className="grid gap-3 sm:grid-cols-2">
            <input value={promotionForm.code} onChange={(event) => setPromotionForm({ ...promotionForm, code: event.target.value })} placeholder="Code" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={promotionForm.title} onChange={(event) => setPromotionForm({ ...promotionForm, title: event.target.value })} placeholder="Title" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <select value={promotionForm.discountType} onChange={(event) => setPromotionForm({ ...promotionForm, discountType: event.target.value })} className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
            <input value={promotionForm.value} onChange={(event) => setPromotionForm({ ...promotionForm, value: event.target.value })} placeholder="Value" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={promotionForm.minOrderAmount} onChange={(event) => setPromotionForm({ ...promotionForm, minOrderAmount: event.target.value })} placeholder="Min order amount" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={promotionForm.categories} onChange={(event) => setPromotionForm({ ...promotionForm, categories: event.target.value })} placeholder="Categories comma separated" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <textarea rows="3" value={promotionForm.description} onChange={(event) => setPromotionForm({ ...promotionForm, description: event.target.value })} placeholder="Description" className="sm:col-span-2 rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <button className="sm:col-span-2 rounded-md bg-leaf px-4 py-3 font-bold text-white">Create promotion</button>
          </form>
          <div className="mt-5 space-y-3">
            {promotions.map((promotion) => (
              <div key={promotion._id} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{promotion.code}</p>
                  <p className="text-sm text-slate-500">{promotion.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">{promotion.discountType === 'percentage' ? `${promotion.value}%` : `Rs. ${promotion.value}`}</span>
                  <button onClick={() => handleDeletePromotion(promotion._id)} className="rounded-full bg-slate-900 px-3 py-2 text-sm font-bold text-white">Delete</button>
                </div>
              </div>
            ))}
            {!promotions.length && <p className="text-slate-500">No active promotions yet.</p>}
          </div>
        </Panel>

        <Panel title="Refunds & disputes" icon={<CircleAlert />}>
          {refundError && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{refundError}</p>}
          <div className="space-y-3">
            {refunds.map((refund) => {
              const isResolved = refund.status === 'Resolved';
              const isBusy = refundBusyId === refund._id;
              return (
                <div key={refund._id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{refund.type}</p>
                      <p className="text-sm text-slate-500">
                        {refund.user?.name || 'Customer'} -{' '}
                        <span className={isResolved ? 'font-bold text-leaf' : ''}>{refund.status}</span>
                      </p>
                    </div>
                    {isResolved ? (
                      <span className="rounded-full bg-limewash px-3 py-2 text-sm font-bold text-leaf">Resolved</span>
                    ) : (
                      <button
                        onClick={() => handleResolveRefund(refund._id)}
                        disabled={isBusy}
                        className="rounded-full bg-leaf px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {isBusy ? 'Resolving...' : 'Resolve'}
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{refund.reason}</p>
                </div>
              );
            })}
            {!refunds.length && <p className="text-slate-500">No refund requests to review.</p>}
          </div>
        </Panel>
      </section>
    </div>
  );
};

export default AdminDashboardTab;
