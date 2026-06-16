import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Promotion from '../models/Promotion.js';
import RefundRequest from '../models/RefundRequest.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

const normalizeRange = (range = 6) => Array.from({ length: range }, (_, index) => index + 1);

export const getDashboardSummary = asyncHandler(async (_req, res) => {
  const [users, vendors, products, orders, pendingVendors, pendingRefunds, promotions, revenueStats] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'vendor' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    User.countDocuments({ role: 'vendor', vendorStatus: 'pending' }),
    RefundRequest.countDocuments({ status: 'Pending' }),
    Promotion.countDocuments({ isActive: true }),
    Order.aggregate([{ $group: { _id: null, revenue: { $sum: '$totalPrice' } } }])
  ]);

  const recentOrders = await Order.find().sort('-createdAt').limit(6).populate('user', 'name email');
  const lowStockProducts = await Product.find({ isActive: true, countInStock: { $lte: 20 } }).sort('countInStock').limit(8);

  res.json({
    counts: {
      users,
      vendors,
      products,
      orders,
      pendingVendors,
      pendingRefunds,
      promotions,
      revenue: revenueStats[0]?.revenue || 0
    },
    recentOrders,
    lowStockProducts
  });
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = req.body.role || user.role;
  if (user.role !== 'vendor') {
    user.vendorStatus = undefined;
  }

  await user.save();
  res.json({ message: 'User role updated' });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = req.body.isActive ?? user.isActive;
  await user.save();
  res.json({ message: 'User status updated' });
});

export const getVendors = asyncHandler(async (_req, res) => {
  const vendors = await User.find({ role: 'vendor' }).select('-password').sort('-createdAt');
  res.json(vendors);
});

export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== 'vendor') {
    res.status(404);
    throw new Error('Vendor not found');
  }

  vendor.vendorStatus = 'approved';
  vendor.vendorProfile = vendor.vendorProfile || {};
  vendor.vendorProfile.rejectionReason = undefined;
  vendor.vendorProfile.approvedAt = new Date();
  vendor.vendorProfile.rejectedAt = undefined;
  await vendor.save();

  res.json({ message: 'Vendor approved' });
});

export const rejectVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findById(req.params.id);
  if (!vendor || vendor.role !== 'vendor') {
    res.status(404);
    throw new Error('Vendor not found');
  }

  vendor.vendorStatus = 'rejected';
  vendor.vendorProfile = vendor.vendorProfile || {};
  vendor.vendorProfile.rejectionReason = req.body.reason || 'Rejected by administrator';
  vendor.vendorProfile.rejectedAt = new Date();
  vendor.vendorProfile.approvedAt = undefined;
  await vendor.save();

  res.json({ message: 'Vendor rejected' });
});

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories.sort());
});

export const getTransactions = asyncHandler(async (_req, res) => {
  const transactions = await Order.find().sort('-createdAt').populate('user', 'name email');
  res.json(transactions);
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  const monthlySales = await Order.aggregate([
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        sales: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);

  res.json({ monthlySales, topProducts });
});

export const listPromotions = asyncHandler(async (_req, res) => {
  const promotions = await Promotion.find().sort('-createdAt');
  res.json(promotions);
});

export const createPromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.create({ ...req.body, code: req.body.code?.toUpperCase(), createdBy: req.user._id });
  res.status(201).json(promotion);
});

export const updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);
  if (!promotion) {
    res.status(404);
    throw new Error('Promotion not found');
  }

  Object.assign(promotion, { ...req.body, code: req.body.code ? req.body.code.toUpperCase() : promotion.code });
  await promotion.save();
  res.json(promotion);
});

export const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);
  if (!promotion) {
    res.status(404);
    throw new Error('Promotion not found');
  }

  await promotion.deleteOne();
  res.json({ message: 'Promotion deleted' });
});

export const listRefundRequests = asyncHandler(async (_req, res) => {
  const refunds = await RefundRequest.find().sort('-createdAt').populate('order user handledBy', 'name email');
  res.json(refunds);
});

export const updateRefundRequest = asyncHandler(async (req, res) => {
  const refund = await RefundRequest.findById(req.params.id);
  if (!refund) {
    res.status(404);
    throw new Error('Refund request not found');
  }

  refund.status = req.body.status || refund.status;
  refund.resolutionNote = req.body.resolutionNote ?? refund.resolutionNote;
  refund.handledBy = req.user._id;
  await refund.save();

  res.json(refund);
});