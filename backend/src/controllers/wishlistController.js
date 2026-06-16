import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const exists = user.wishlist.some((item) => item.toString() === productId);

  user.wishlist = exists
    ? user.wishlist.filter((item) => item.toString() !== productId)
    : [...user.wishlist, productId];

  await user.save();
  await user.populate('wishlist');
  res.json(user.wishlist);
});

