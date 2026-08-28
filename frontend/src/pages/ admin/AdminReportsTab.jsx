import { BarChart3, CheckCircle2, Receipt } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Panel } from '../../components/AdminUI.jsx';

const AdminReportsTab = () => {
  const { analytics, transactions } = useOutletContext();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Monthly sales" icon={<CheckCircle2 />}>
          <div className="space-y-3">
            {analytics?.monthlySales?.map((item) => (
              <div key={`${item._id.year}-${item._id.month}`} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm">
                <span>{item._id.year}-{String(item._id.month).padStart(2, '0')}</span>
                <span className="font-bold">Rs. {item.sales}</span>
              </div>
            ))}
            {!analytics?.monthlySales?.length && <p className="text-slate-500">No analytics data available yet.</p>}
          </div>
        </Panel>

        <Panel title="Top products" icon={<BarChart3 />}>
          <div className="space-y-3">
            {analytics?.topProducts?.map((product) => (
              <div key={product._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.quantity} sold</p>
                </div>
                <span className="font-bold">Rs. {product.revenue}</span>
              </div>
            ))}
            {!analytics?.topProducts?.length && <p className="text-slate-500">No product sales data yet.</p>}
          </div>
        </Panel>
      </section>

      <Panel title={`Transactions (${transactions.length})`} icon={<Receipt />}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-500">
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 25).map((order) => (
                <tr key={order._id} className="border-b border-slate-50">
                  <td className="py-3 pr-3 font-mono text-xs text-slate-500">{order._id.slice(-8)}</td>
                  <td className="py-3 pr-3">{order.user?.name || 'Guest'}</td>
                  <td className="py-3 pr-3 font-bold">Rs. {order.totalPrice}</td>
                  <td className="py-3 pr-3">
                    <span className="rounded-full bg-limewash px-3 py-1 text-xs font-bold text-leaf">
                      {order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!transactions.length && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

export default AdminReportsTab;
