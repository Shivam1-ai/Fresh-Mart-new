import Product from '../models/Product.js';
import Review from '../models/Review.js';
import asyncHandler from '../middleware/asyncHandler.js';

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const keyword = req.query.search
    ? { $text: { $search: req.query.search } }
    : {};
  const category = req.query.category ? { category: req.query.category } : {};
  const price = {};

  if (req.query.minPrice) price.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) price.$lte = Number(req.query.maxPrice);

  const filter = {
    isActive: true,
    ...keyword,
    ...category,
    ...(Object.keys(price).length ? { price } : {})
  };

  const products = await Product.find(filter)
    .sort(req.query.sort || '-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Product.countDocuments(filter);

  res.json({ products, page, pages: Math.ceil(total / limit), total });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const reviews = await Review.find({ product: product._id }).populate('user', 'name role').sort('-createdAt');
  const numReviews = reviews.length;
  const rating = numReviews ? reviews.reduce((sum, review) => sum + review.rating, 0) / numReviews : 0;

  res.json({
    ...product.toObject(),
    reviews,
    numReviews,
    rating
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    slug: req.body.slug || slugify(req.body.name)
  });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  Object.assign(product, req.body);
  if (req.body.name && !req.body.slug) product.slug = slugify(req.body.name);
  await product.save();
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isActive = false;
  await product.save();
  res.json({ message: 'Product archived' });
});

export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, title } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existing = await Review.findOne({ product: product._id, user: req.user._id });
  if (existing) {
    existing.rating = Number(rating);
    existing.comment = comment;
    existing.title = title;
    existing.name = req.user.name;
    await existing.save();
  } else {
    await Review.create({
      product: product._id,
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      title
    });
  }

  const reviews = await Review.find({ product: product._id });
  product.numReviews = reviews.length;
  product.rating = product.numReviews ? reviews.reduce((sum, review) => sum + review.rating, 0) / product.numReviews : 0;
  await product.save();

  res.status(201).json({ message: 'Review saved' });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).populate('user', 'name role').sort('-createdAt');
  res.json(reviews);
});

