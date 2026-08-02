import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

const sanitizeProfileImage = (value) => {
  if (!value) return undefined;

  const image = String(value).trim();
  if (!image) return undefined;

  try {
    const parsed = new URL(image);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
};

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profileImage: user.profileImage,
  role: user.role,
  isActive: user.isActive,
  vendorStatus: user.vendorStatus,
  vendorProfile: user.vendorProfile,
  addresses: user.addresses,
  token: generateToken(user._id)
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const nextEmail = req.body.email?.trim().toLowerCase();
  const nextPhone = req.body.phone ? String(req.body.phone).replace(/\D/g, '') : user.phone;
  const nextProfileImage = sanitizeProfileImage(req.body.profileImage);

  if (nextEmail && !emailPattern.test(nextEmail)) {
    res.status(400);
    throw new Error('Enter a valid email address');
  }

  if (nextPhone && !phonePattern.test(nextPhone)) {
    res.status(400);
    throw new Error('Phone number must contain exactly 10 digits');
  }

  if (nextEmail && nextEmail !== user.email) {
    const duplicate = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
    if (duplicate) {
      res.status(409);
      throw new Error('Email is already registered');
    }
    user.email = nextEmail;
  }

  user.name = req.body.name ?? user.name;
  user.phone = nextPhone;
  if (req.body.profileImage !== undefined) user.profileImage = nextProfileImage;
  if (req.body.password) user.password = req.body.password;
  await user.save();
  res.json(userPayload(user));
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json(user.addresses);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.addressId);
  await user.save();
  res.json(user.addresses);
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json(users);
});

