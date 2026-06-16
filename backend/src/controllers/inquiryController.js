import Product from '../models/Product.js';
import ProductInquiry from '../models/ProductInquiry.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const createInquiry = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const inquiry = await ProductInquiry.create({
    product: product._id,
    user: req.user._id,
    vendor: product.vendor,
    question: req.body.question
  });

  res.status(201).json(inquiry);
});

export const getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await ProductInquiry.find({ user: req.user._id }).sort('-createdAt').populate('product', 'name slug images');
  res.json(inquiries);
});