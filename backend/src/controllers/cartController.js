import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/asyncHandler.js';

const getUserCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

export const getCart = asyncHandler(async (req, res) => {
  res.json(await getUserCart(req.user._id));
});

export const addCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  const cart = await getUserCart(req.user._id);
  const item = cart.items.find((entry) => entry.product._id.toString() === productId);

  if (item) item.quantity += Number(quantity);
  else cart.items.push({ product: productId, quantity: Number(quantity) });

  await cart.save();
  res.status(201).json(await getUserCart(req.user._id));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getUserCart(req.user._id);
  const item = cart.items.find((entry) => entry.product._id.toString() === req.params.productId);

  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  item.quantity = Number(req.body.quantity);
  await cart.save();
  res.json(await getUserCart(req.user._id));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getUserCart(req.user._id);
  cart.items = cart.items.filter((entry) => entry.product._id.toString() !== req.params.productId);
  await cart.save();
  res.json(await getUserCart(req.user._id));
});

