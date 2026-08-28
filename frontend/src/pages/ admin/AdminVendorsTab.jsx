import { Store } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { approveVendor, rejectVendor } from '../../api/adminApi.js';
import { Panel } from '../../components/AdminUI.jsx';

const statusStyles = {
  approved: 'bg-limewash text-leaf',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700'
};

const AdminVendorsTab = () => {
  const { vendors, refresh } = useOutletContext();

  const handleApprove = async (vendorId) => {
    await approveVendor(vendorId);
    await refresh();
  };

  const handleReject = async (vendorId) => {
    if (!window.confirm('Reject this vendor application?')) return;
    await rejectVendor(vendorId, { reason: 'Rejected by administrator' });
    await refresh();
  };

  return (
    <div className="space-y-6">
      <Panel title={`Vendors (${vendors.length})`} icon={<Store />}>
        <div className="space-y-3">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{vendor.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${statusStyles[vendor.vendorStatus] || 'bg-slate-100 text-slate-600'}`}>
                    {vendor.vendorStatus || 'unknown'}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{vendor.email}</p>
                <p className="text-xs text-slate-400">{vendor.vendorProfile?.storeName || 'Store details missing'}</p>
              </div>
              {vendor.vendorStatus === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(vendor._id)} className="rounded-full bg-leaf px-3 py-2 text-sm font-bold text-white">Approve</button>
                  <button onClick={() => handleReject(vendor._id)} className="rounded-full bg-slate-900 px-3 py-2 text-sm font-bold text-white">Reject</button>
                </div>
              )}
              {vendor.vendorStatus === 'approved' && (
                <button onClick={() => handleReject(vendor._id)} className="rounded-full bg-slate-900 px-3 py-2 text-sm font-bold text-white">Revoke</button>
              )}
              {vendor.vendorStatus === 'rejected' && (
                <button onClick={() => handleApprove(vendor._id)} className="rounded-full bg-leaf px-3 py-2 text-sm font-bold text-white">Approve</button>
              )}
            </div>
          ))}
          {!vendors.length && <p className="text-slate-500">No vendors yet.</p>}
        </div>
      </Panel>
    </div>
  );
};

export default AdminVendorsTab;
