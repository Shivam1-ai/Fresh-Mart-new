import { BadgeIndianRupee, ClipboardList, CornerDownLeft, PackagePlus, Store, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  createVendorProduct,
  deleteVendorProduct,
  fetchVendorDashboard,
  fetchVendorProfile,
  registerVendor,
  replyToInquiry,
  updateVendorOrderStatus,
  updateVendorProduct,
  updateVendorProfile
} from '../api/vendorApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyProduct = {
  name: '',
  description: '',
  category: 'Vegetables',
  price: '',
  mrp: '',
  unit: 'kg',
  countInStock: '',
  brand: '',
  isFeatured: false
};

const emptyVendorForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  storeName: '',
  businessName: '',
  gstNumber: '',
  pickupAddress: '',
  description: '',
  supportEmail: ''
};

const categoryOptions = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Grains', 'Beverages', 'Snacks', 'Household'];

const VendorPage = () => {
  const { user } = useAuth();
  const approvedVendor = user?.role === 'vendor' && user?.vendorStatus === 'approved';
  const [vendorForm, setVendorForm] = useState({ ...emptyVendorForm, name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', vendorProfile: {} });
  const [dashboard, setDashboard] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderDrafts, setOrderDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!approvedVendor) return;

    const loadVendorData = async () => {
      try {
        setError('');
        const [profile, summary] = await Promise.all([fetchVendorProfile(), fetchVendorDashboard()]);
        setProfileForm({
          name: profile.name || '',
          phone: profile.phone || '',
          vendorProfile: {
            ...(profile.vendorProfile || {})
          }
        });
        setDashboard(summary);
        setOrderDrafts((summary.recentOrders || []).reduce((accumulator, order) => ({ ...accumulator, [order._id]: { status: order.status, note: '' } }), {}));
        setReplyDrafts((summary.inquiries || []).reduce((accumulator, inquiry) => ({ ...accumulator, [inquiry._id]: '' }), {}));
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load vendor dashboard.');
      }
    };

    loadVendorData();
  }, [approvedVendor]);

  const refresh = async () => {
    const [profile, summary] = await Promise.all([fetchVendorProfile(), fetchVendorDashboard()]);
    setProfileForm({
      name: profile.name || '',
      phone: profile.phone || '',
      vendorProfile: {
        ...(profile.vendorProfile || {})
      }
    });
    setDashboard(summary);
    setOrderDrafts((summary.recentOrders || []).reduce((accumulator, order) => ({ ...accumulator, [order._id]: { status: order.status, note: '' } }), {}));
    setReplyDrafts((summary.inquiries || []).reduce((accumulator, inquiry) => ({ ...accumulator, [inquiry._id]: '' }), {}));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await registerVendor(vendorForm);
      setVendorForm(emptyVendorForm);
      setMessage('Vendor registration submitted for approval.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit vendor registration.');
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await updateVendorProfile(profileForm);
      setMessage('Vendor profile updated.');
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update vendor profile.');
    }
  };

  const handleProductSave = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        mrp: Number(productForm.mrp || 0),
        countInStock: Number(productForm.countInStock),
        isFeatured: Boolean(productForm.isFeatured)
      };

      if (editingProduct) await updateVendorProduct(editingProduct._id, payload);
      else await createVendorProduct(payload);

      setProductForm(emptyProduct);
      setEditingProduct(null);
      setMessage(editingProduct ? 'Product updated.' : 'Product created.');
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save product.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    await deleteVendorProduct(productId);
    await refresh();
  };

  const handleOrderStatus = async (orderId) => {
    await updateVendorOrderStatus(orderId, orderDrafts[orderId]);
    await refresh();
  };

  const handleReplyInquiry = async (inquiryId) => {
    await replyToInquiry(inquiryId, { answer: replyDrafts[inquiryId] });
    await refresh();
  };

  if (!approvedVendor) {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-limewash text-leaf"><Store className="h-6 w-6" /></span>
            <div>
              <h1 className="text-3xl font-black">Vendor registration</h1>
              <p className="text-slate-500">Apply for approval and manage your store from one dashboard.</p>
            </div>
          </div>
          <form onSubmit={handleRegister} className="mt-6 grid gap-3 sm:grid-cols-2">
            {['name', 'email', 'phone', 'password', 'storeName', 'businessName', 'gstNumber', 'pickupAddress', 'supportEmail'].map((field) => (
              <input
                key={field}
                type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                required={field !== 'phone' && field !== 'supportEmail' && field !== 'gstNumber'}
                value={vendorForm[field]}
                onChange={(event) => setVendorForm({ ...vendorForm, [field]: event.target.value })}
                placeholder={field[0].toUpperCase() + field.slice(1)}
                className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf"
              />
            ))}
            <textarea
              required
              rows="4"
              value={vendorForm.description}
              onChange={(event) => setVendorForm({ ...vendorForm, description: event.target.value })}
              placeholder="Business description"
              className="sm:col-span-2 rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf"
            />
            <button className="sm:col-span-2 rounded-md bg-leaf px-4 py-3 font-bold text-white">Submit vendor application</button>
          </form>
        </section>

        <section className="rounded-lg bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-2xl font-black">What vendors can do</h2>
          <div className="mt-6 space-y-3 text-sm text-white/80">
            <Feature icon={<PackagePlus className="h-5 w-5" />} title="Catalog management" text="Add, update, and archive your products." />
            <Feature icon={<ClipboardList className="h-5 w-5" />} title="Order operations" text="Update shipping and delivery status per order." />
            <Feature icon={<BadgeIndianRupee className="h-5 w-5" />} title="Earnings" text="Track sales and report performance." />
            <Feature icon={<CornerDownLeft className="h-5 w-5" />} title="Customer inquiries" text="Answer product questions from buyers." />
          </div>
          <p className="mt-6 rounded-lg bg-white/10 p-4 text-sm text-white/80">{message || 'Your application will stay pending until an administrator approves it.'}</p>
        </section>
      </div>
    );
  }

  const counts = dashboard?.counts || {};
  const products = dashboard?.products || [];
  const orders = dashboard?.recentOrders || [];
  const inquiries = dashboard?.inquiries || [];
  const lowStockProducts = dashboard?.lowStockProducts || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Vendor dashboard</h1>
        <p className="mt-1 text-slate-500">Manage inventory, pricing, orders, earnings, and customer questions.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      {message && <p className="rounded-lg bg-limewash p-4 text-sm font-bold text-leaf">{message}</p>}

      <section className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Store />} label="Products" value={counts.products || products.length} />
        <Metric icon={<ClipboardList />} label="Orders" value={counts.orders || orders.length} />
        <Metric icon={<BadgeIndianRupee />} label="Earnings" value={`Rs. ${counts.earnings || 0}`} />
        <Metric icon={<Truck />} label="Items sold" value={counts.itemsSold || 0} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Panel title="Vendor profile" icon={<Store />}>
          <form onSubmit={handleProfileSave} className="grid gap-3 sm:grid-cols-2">
            <input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} placeholder="Name" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} placeholder="Phone" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={profileForm.vendorProfile.storeName || ''} onChange={(event) => setProfileForm({ ...profileForm, vendorProfile: { ...(profileForm.vendorProfile || {}), storeName: event.target.value } })} placeholder="Store name" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={profileForm.vendorProfile.businessName || ''} onChange={(event) => setProfileForm({ ...profileForm, vendorProfile: { ...(profileForm.vendorProfile || {}), businessName: event.target.value } })} placeholder="Business name" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={profileForm.vendorProfile.gstNumber || ''} onChange={(event) => setProfileForm({ ...profileForm, vendorProfile: { ...(profileForm.vendorProfile || {}), gstNumber: event.target.value } })} placeholder="GST number" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={profileForm.vendorProfile.supportEmail || ''} onChange={(event) => setProfileForm({ ...profileForm, vendorProfile: { ...(profileForm.vendorProfile || {}), supportEmail: event.target.value } })} placeholder="Support email" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <textarea rows="3" value={profileForm.vendorProfile.pickupAddress || ''} onChange={(event) => setProfileForm({ ...profileForm, vendorProfile: { ...(profileForm.vendorProfile || {}), pickupAddress: event.target.value } })} placeholder="Pickup address" className="sm:col-span-2 rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <textarea rows="4" value={profileForm.vendorProfile.description || ''} onChange={(event) => setProfileForm({ ...profileForm, vendorProfile: { ...(profileForm.vendorProfile || {}), description: event.target.value } })} placeholder="Store description" className="sm:col-span-2 rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <button className="sm:col-span-2 rounded-md bg-leaf px-4 py-3 font-bold text-white">Save vendor profile</button>
          </form>
        </Panel>

        <Panel title="Low stock" icon={<PackagePlus />}>
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <span className="font-semibold">{product.name}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">{product.countInStock} left</span>
              </div>
            ))}
            {!lowStockProducts.length && <p className="text-slate-500">No low stock alerts.</p>}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Panel title={editingProduct ? 'Edit product' : 'Add product'} icon={<PackagePlus />}>
          <form onSubmit={handleProductSave} className="grid gap-3 sm:grid-cols-2">
            <input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} placeholder="Name" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf">
              {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <input value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} placeholder="Price" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={productForm.mrp} onChange={(event) => setProductForm({ ...productForm, mrp: event.target.value })} placeholder="MRP" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={productForm.unit} onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })} placeholder="Unit" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={productForm.countInStock} onChange={(event) => setProductForm({ ...productForm, countInStock: event.target.value })} placeholder="Stock" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })} placeholder="Brand" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600">
              <input type="checkbox" checked={productForm.isFeatured} onChange={(event) => setProductForm({ ...productForm, isFeatured: event.target.checked })} /> Featured product
            </label>
            <textarea rows="4" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} placeholder="Description" className="sm:col-span-2 rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <button className="sm:col-span-2 rounded-md bg-slate-950 px-4 py-3 font-bold text-white">{editingProduct ? 'Update product' : 'Create product'}</button>
          </form>
        </Panel>

        <Panel title="Recent orders" icon={<ClipboardList />}>
          <div className="space-y-3">
            {orders.map((order) => {
              const draft = orderDrafts[order._id] || { status: order.status, note: '' };
              return (
                <div key={order._id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-slate-500">{order.user?.name || 'Customer'}</p>
                    </div>
                    <strong>Rs. {order.totalPrice}</strong>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <select value={draft.status} onChange={(event) => setOrderDrafts({ ...orderDrafts, [order._id]: { ...draft, status: event.target.value } })} className="rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-leaf">
                      {['Pending', 'Paid', 'Packed', 'Out for delivery', 'Delivered', 'Cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <input value={draft.note} onChange={(event) => setOrderDrafts({ ...orderDrafts, [order._id]: { ...draft, note: event.target.value } })} placeholder="Tracking note" className="rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-leaf" />
                  </div>
                  <button onClick={() => handleOrderStatus(order._id)} className="mt-3 rounded-full bg-leaf px-3 py-2 text-sm font-bold text-white">Update status</button>
                </div>
              );
            })}
            {!orders.length && <p className="text-slate-500">No vendor orders yet.</p>}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Products" icon={<Store />}>
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product._id} className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-slate-500">Rs. {product.price} | Stock {product.countInStock}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingProduct(product); setProductForm({ ...product, price: product.price ?? '', mrp: product.mrp ?? '', countInStock: product.countInStock ?? '' }); }} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">Edit</button>
                  <button onClick={() => handleDeleteProduct(product._id)} className="rounded-full bg-slate-900 px-3 py-2 text-sm font-bold text-white">Archive</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Customer inquiries" icon={<CornerDownLeft />}>
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <div key={inquiry._id} className="rounded-lg border border-slate-100 p-3">
                <p className="font-semibold">{inquiry.product?.name || 'Product inquiry'}</p>
                <p className="text-sm text-slate-500">{inquiry.question}</p>
                <textarea value={replyDrafts[inquiry._id] || inquiry.answer || ''} onChange={(event) => setReplyDrafts({ ...replyDrafts, [inquiry._id]: event.target.value })} rows="3" placeholder="Write reply" className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-leaf" />
                <button onClick={() => handleReplyInquiry(inquiry._id)} className="mt-3 rounded-full bg-leaf px-3 py-2 text-sm font-bold text-white">Send reply</button>
              </div>
            ))}
            {!inquiries.length && <p className="text-slate-500">No customer inquiries yet.</p>}
          </div>
        </Panel>
      </section>
    </div>
  );
};

const Metric = ({ icon, label, value }) => (
  <section className="rounded-lg bg-white p-5 shadow-sm">
    <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-limewash text-leaf">{icon}</div>
    <p className="text-sm font-bold uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-black">{value}</p>
  </section>
);

const Panel = ({ title, icon, children }) => (
  <section className="rounded-lg bg-white p-5 shadow-sm">
    <div className="flex items-center gap-2">
      <span className="text-leaf">{icon}</span>
      <h2 className="text-xl font-black">{title}</h2>
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

const Feature = ({ icon, title, text }) => (
  <div className="flex gap-3 rounded-lg border border-white/10 p-3">
    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10">{icon}</span>
    <span>
      <span className="block font-bold text-white">{title}</span>
      <span className="text-white/70">{text}</span>
    </span>
  </div>
);

export default VendorPage;