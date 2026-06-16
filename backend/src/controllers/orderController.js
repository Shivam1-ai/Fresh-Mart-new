import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js';

const buildTrackingEvent = (status, note, location) => ({
  status,
  note,
  location,
  createdAt: new Date()
});

const generateTrackingNumber = () => `FM-${Date.now().toString(36).toUpperCase()}`;

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const items = cart.items.map((entry) => ({
    product: entry.product._id,
    vendor: entry.product.vendor || undefined,
    name: entry.product.name,
    image: entry.product.images?.[0]?.url,
    price: entry.product.price,
    quantity: entry.quantity
  }));

  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice >= 499 ? 0 : 49;
  const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod || 'COD',
    trackingNumber: generateTrackingNumber(),
    trackingEvents: [buildTrackingEvent('Placed', 'Order placed successfully')],
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  });

  await Promise.all(
    cart.items.map((entry) =>
      Product.findByIdAndUpdate(entry.product._id, { $inc: { countInStock: -entry.quantity } })
    )
  );

  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name images price vendor')
    .populate('items.vendor', 'name email role');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isVendor = req.user.role === 'vendor' && order.items.some((item) => item.vendor?._id?.toString() === req.user._id.toString());

  if (req.user.role !== 'admin' && !isOwner && !isVendor) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

export const getOrderTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).select('user trackingNumber status trackingEvents totalPrice createdAt');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOwner = String(order.user) === String(req.user._id);
  if (req.user.role !== 'admin' && !isOwner) {
    res.status(403);
    throw new Error('Not authorized to view tracking information');
  }

  res.json(order);
});

export const getOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = req.body.status || order.status;
  if (order.status === 'Delivered') order.deliveredAt = new Date();
  order.trackingEvents = order.trackingEvents || [];
  order.trackingEvents.push(buildTrackingEvent(order.status, req.body.note || `Status updated to ${order.status}`, req.body.location));
  await order.save();
  res.json(order);
});

export const updateOrderTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isVendor = req.user.role === 'vendor' && order.items.some((item) => item.vendor?.toString() === req.user._id.toString());

  if (req.user.role !== 'admin' && !isVendor) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  if (req.body.status) order.status = req.body.status;
  if (req.body.status === 'Delivered') order.deliveredAt = new Date();

  order.trackingEvents = order.trackingEvents || [];
  order.trackingEvents.push(buildTrackingEvent(req.body.status || order.status, req.body.note || 'Tracking updated', req.body.location));
  await order.save();

  res.json(order);
});

