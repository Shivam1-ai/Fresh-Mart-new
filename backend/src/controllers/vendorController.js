import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ProductInquiry from '../models/ProductInquiry.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

const vendorPayload = (vendor) => ({
  _id: vendor._id,
  name: vendor.name,
  email: vendor.email,
  phone: vendor.phone,
  role: vendor.role,
  vendorStatus: vendor.vendorStatus,
  vendorProfile: vendor.vendorProfile,
  token: generateToken(vendor._id)
});

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const isOwnedByVendor = (vendorId, product) => !product.vendor || String(product.vendor) === String(vendorId);

export const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.user._id).select('-password');
  res.json(vendor);
});

export const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.user._id);

  const nextEmail = req.body.email?.trim().toLowerCase();
  const nextPhone = req.body.phone ? String(req.body.phone).replace(/\D/g, '') : vendor.phone;

  if (nextEmail && !emailPattern.test(nextEmail)) {
    res.status(400);
    throw new Error('Enter a valid email address');
  }

  if (nextPhone && !phonePattern.test(nextPhone)) {
    res.status(400);
    throw new Error('Phone number must contain exactly 10 digits');
  }

  if (nextEmail && nextEmail !== vendor.email) {
    const duplicate = await User.findOne({ email: nextEmail, _id: { $ne: vendor._id } });
    if (duplicate) {
      res.status(409);
      throw new Error('Email is already registered');
    }
    vendor.email = nextEmail;
  }

  vendor.name = req.body.name ?? vendor.name;
  vendor.phone = nextPhone;
  vendor.vendorProfile = {
    ...(vendor.vendorProfile || {}),
    ...req.body.vendorProfile
  };

  await vendor.save();
  res.json(vendorPayload(vendor));
});

export const getVendorDashboard = asyncHandler(async (req, res) => {
  const products = await Product.find({ vendor: req.user._id, isActive: true }).sort('-createdAt');
  const orders = await Order.find({ 'items.vendor': req.user._id }).sort('-createdAt').populate('user', 'name email');
  const inquiries = await ProductInquiry.find({ vendor: req.user._id }).sort('-createdAt').populate('product user', 'name email');

  const earningsSummary = await Order.aggregate([
    { $unwind: '$items' },
    { $match: { 'items.vendor': req.user._id } },
    {
      $group: {
        _id: null,
        earnings: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        itemsSold: { $sum: '$items.quantity' }
      }
    }
  ]);

  const lowStockProducts = products.filter((product) => product.countInStock <= 20);

  res.json({
    counts: {
      products: products.length,
      orders: orders.length,
      inquiries: inquiries.length,
      earnings: earningsSummary[0]?.earnings || 0,
      itemsSold: earningsSummary[0]?.itemsSold || 0
    },
    products,
    recentOrders: orders.slice(0, 8),
    lowStockProducts,
    inquiries
  });
});

export const getVendorProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ vendor: req.user._id }).sort('-createdAt');
  res.json(products);
});

export const createVendorProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    vendor: req.user._id,
    slug: req.body.slug || slugify(req.body.name)
  });

  res.status(201).json(product);
});

export const updateVendorProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!isOwnedByVendor(req.user._id, product)) {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  Object.assign(product, req.body);
  if (req.body.name && !req.body.slug) product.slug = slugify(req.body.name);
  await product.save();
  res.json(product);
});

export const deleteVendorProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!isOwnedByVendor(req.user._id, product)) {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  product.isActive = false;
  await product.save();
  res.json({ message: 'Product archived' });
});

export const getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'items.vendor': req.user._id })
    .sort('-createdAt')
    .populate('user', 'name email phone')
    .populate('items.product', 'name images price unit')
    .populate('items.vendor', 'name email role');
  res.json(orders);
});

export const updateVendorOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.items.some((item) => String(item.vendor) === String(req.user._id))) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  const nextStatus = req.body.status || order.status;
  const needsRestock = ['Rejected', 'Cancelled'].includes(nextStatus) && !['Rejected', 'Cancelled'].includes(order.status);

  if (needsRestock) {
    await Promise.all(
      order.items.map((item) => Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.quantity } }))
    );
  }

  order.status = nextStatus;
  if (['Delivered'].includes(order.status)) order.deliveredAt = new Date();
  order.trackingEvents = order.trackingEvents || [];
  order.trackingEvents.push({
    status: order.status,
    note:
      req.body.note ||
      {
        Accepted: 'Order accepted by vendor',
        Rejected: 'Order rejected by vendor',
        Packed: 'Order packed and ready for shipment',
        Shipped: 'Order shipped from vendor',
        Delivered: 'Order delivered to customer'
      }[order.status] || `Vendor updated status to ${order.status}`,
    location: req.body.location,
    createdAt: new Date()
  });
  await order.save();

  res.json(order);
});

export const getVendorEarningsReport = asyncHandler(async (req, res) => {
  const [summary] = await Order.aggregate([
    { $unwind: '$items' },
    { $match: { 'items.vendor': req.user._id } },
    {
      $group: {
        _id: null,
        earnings: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $addToSet: '$_id' },
        sold: { $sum: '$items.quantity' }
      }
    }
  ]);

  const monthly = await Order.aggregate([
    { $unwind: '$items' },
    { $match: { 'items.vendor': req.user._id } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        earnings: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    earnings: summary?.earnings || 0,
    sold: summary?.sold || 0,
    orderCount: summary?.orders?.length || 0,
    monthly
  });
});

export const getVendorInquiries = asyncHandler(async (req, res) => {
  const inquiries = await ProductInquiry.find({ vendor: req.user._id }).sort('-createdAt').populate('product user', 'name email');
  res.json(inquiries);
});

export const replyToInquiry = asyncHandler(async (req, res) => {
  const inquiry = await ProductInquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  if (String(inquiry.vendor) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to reply to this inquiry');
  }

  inquiry.answer = req.body.answer;
  inquiry.status = 'Answered';
  inquiry.answeredBy = req.user._id;
  inquiry.answeredAt = new Date();
  await inquiry.save();

  res.json(inquiry);
});