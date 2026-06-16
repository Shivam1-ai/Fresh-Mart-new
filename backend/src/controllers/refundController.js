import Order from '../models/Order.js';
import RefundRequest from '../models/RefundRequest.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const createRefundRequest = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (String(order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to request a refund for this order');
  }

  const refund = await RefundRequest.create({
    order: order._id,
    user: req.user._id,
    amount: req.body.amount ?? order.totalPrice,
    type: req.body.type || 'Refund',
    reason: req.body.reason
  });

  res.status(201).json(refund);
});

export const getMyRefundRequests = asyncHandler(async (req, res) => {
  const refunds = await RefundRequest.find({ user: req.user._id }).sort('-createdAt').populate('order', 'totalPrice status trackingNumber');
  res.json(refunds);
});

export const getRefundRequests = asyncHandler(async (_req, res) => {
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