import { BadgeIndianRupee, ClipboardList, CornerDownLeft, PackagePlus, Store, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  createVendorProduct,
  deleteVendorProduct,
  fetchVendorDashboard,
  fetchVendorOrders,
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
  const { user, updateUser } = useAuth();
  const approvedVendor = user?.role === 'vendor' && user?.vendorStatus === 'approved';
  const [vendorForm, setVendorForm] = useState({ ...emptyVendorForm, name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', vendorProfile: {} });
  const [dashboard, setDashboard] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!approvedVendor) return;

    const loadVendorData = async () => {
      try {
        setError('');
        const [profile, summary, vendorOrders] = await Promise.all([fetchVendorProfile(), fetchVendorDashboard(), fetchVendorOrders()]);
        setProfileForm({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          vendorProfile: {
            ...(profile.vendorProfile || {})
          }
        });
        setDashboard(summary);
        setOrders(vendorOrders);
        setReplyDrafts((summary.inquiries || []).reduce((accumulator, inquiry) => ({ ...accumulator, [inquiry._id]: '' }), {}));
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load vendor dashboard.');
      }
    };

    loadVendorData();
  }, [approvedVendor]);

  const refresh = async () => {
    const [profile, summary, vendorOrders] = await Promise.all([fetchVendorProfile(), fetchVendorDashboard(), fetchVendorOrders()]);
    setProfileForm({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      vendorProfile: {
        ...(profile.vendorProfile || {})
      }
    });
    setDashboard(summary);
    setOrders(vendorOrders);
    setReplyDrafts((summary.inquiries || []).reduce((accumulator, inquiry) => ({ ...accumulator, [inquiry._id]: '' }), {}));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const data = await registerVendor(vendorForm);
      updateUser(data);
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
      const data = await updateVendorProfile(profileForm);
      updateUser(data);
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

  const handleOrderAction = async (orderId, status, note) => {
    await updateVendorOrderStatus(orderId, { status, note });
    await refresh();
    setSelectedOrder(null);
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
            <input value={profileForm.email} type="email" onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} placeholder="Email" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
            <input inputMode="numeric" maxLength={10} value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value.replace(/\D/g, '') })} placeholder="Phone" className="rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" />
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

        <Panel title="Order management" icon={<ClipboardList />}>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-slate-500">{order.user?.name || 'Customer'} · {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-limewash px-3 py-1 text-sm font-bold text-leaf">{order.status}</span>
                    <strong>Rs. {order.totalPrice}</strong>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(order)} className="mt-3 rounded-full bg-leaf px-3 py-2 text-sm font-bold text-white">
                  View preview
                </button>
              </div>
            ))}
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

      {selectedOrder && (
        <OrderPreviewModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAction={handleOrderAction}
        />
      )}
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

const OrderPreviewModal = ({ order, onClose, onAction }) => {
  const shippingAddress = order.shippingAddress || {};
  const actions = [
    { label: 'Accept Order', status: 'Accepted', tone: 'bg-leaf' },
    { label: 'Reject Order', status: 'Rejected', tone: 'bg-slate-900' },
    { label: 'Mark as Packed', status: 'Packed', tone: 'bg-amber-600' },
    { label: 'Mark as Shipped', status: 'Shipped', tone: 'bg-sky-600' },
    { label: 'Mark as Delivered', status: 'Delivered', tone: 'bg-emerald-700' }
  ];

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/60 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-slate-500">Order preview</p>
            <h3 className="text-2xl font-black">Order #{order._id.slice(-6).toUpperCase()}</h3>
            <p className="text-sm text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Close order preview">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black">Ordered products</h4>
                <span className="rounded-full bg-limewash px-3 py-1 text-sm font-bold text-leaf">{order.items?.length || 0} items</span>
              </div>
              <div className="mt-4 space-y-3">
                {order.items?.map((item) => {
                  const image = item.product?.images?.[0]?.url || item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
                  const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
                  return (
                    <div key={`${order._id}-${item.product?._id || item.name}`} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                      <img src={image} alt={item.product?.name || item.name} className="h-16 w-16 rounded-md object-cover" />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{item.product?.name || item.name}</p>
                            <p className="text-sm text-slate-500">Qty: {item.quantity} · Rs. {item.price} each</p>
                          </div>
                          <strong>Rs. {lineTotal}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Customer" lines={[order.user?.name, order.user?.email, order.user?.phone].filter(Boolean)} />
              <InfoCard
                title="Shipping address"
                lines={[
                  shippingAddress.fullName,
                  shippingAddress.phone,
                  shippingAddress.line1,
                  shippingAddress.line2,
                  [shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(', '),
                  shippingAddress.country
                ].filter(Boolean)}
              />
            </div>
          </div>

          <aside className="space-y-4">
            <InfoCard title="Order details" lines={[
              `Status: ${order.status}`,
              `Payment: ${order.paymentMethod || 'COD'}`,
              `Total: Rs. ${order.totalPrice}`,
              `Date: ${new Date(order.createdAt).toLocaleDateString()}`
            ]} />

            <div className="rounded-xl border border-slate-100 p-4">
              <h4 className="font-black">Actions</h4>
              <div className="mt-3 grid gap-2">
                {actions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => onAction(order._id, action.status)}
                    className={`rounded-full px-4 py-2 text-sm font-bold text-white ${action.tone}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

const InfoCard = ({ title, lines }) => (
  <div className="rounded-xl border border-slate-100 p-4">
    <h4 className="font-black">{title}</h4>
    <div className="mt-2 space-y-1 text-sm text-slate-600">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  </div>
);

export default VendorPage;