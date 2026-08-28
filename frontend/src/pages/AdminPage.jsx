import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  fetchAdminAnalytics,
  fetchAdminSummary,
  fetchAdminUsers,
  fetchAdminVendors,
  fetchCategories,
  fetchPromotions,
  fetchRefundRequests,
  fetchTransactions
} from '../api/adminApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const AdminPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');
      const [summaryData, vendorData, promotionData, refundData, analyticsData, userData, categoryData, transactionData] =
        await Promise.all([
          fetchAdminSummary(),
          fetchAdminVendors(),
          fetchPromotions(),
          fetchRefundRequests(),
          fetchAdminAnalytics(),
          fetchAdminUsers(),
          fetchCategories(),
          fetchTransactions()
        ]);

      setSummary(summaryData);
      setVendors(vendorData);
      setPromotions(promotionData);
      setRefunds(refundData);
      setAnalytics(analyticsData);
      setUsers(userData);
      setCategories(categoryData);
      setTransactions(transactionData);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin dashboard.');
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [user, refresh]);

  if (user?.role !== 'admin') {
    return <p className="rounded-lg bg-white p-6 font-semibold shadow-sm">Admin access is required.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Admin control center</h1>
        <p className="mt-1 text-slate-500">Vendor approvals, refunds, coupons, and platform analytics in one place.</p>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      {loading && !summary ? (
        <div className="grid gap-4">
          <div className="h-24 animate-pulse rounded-lg bg-white" />
          <div className="h-64 animate-pulse rounded-lg bg-white" />
        </div>
      ) : (
        <Outlet
          context={{
            summary,
            vendors,
            promotions,
            refunds,
            analytics,
            users,
            categories,
            transactions,
            refresh
          }}
        />
      )}
    </div>
  );
};

export default AdminPage;
