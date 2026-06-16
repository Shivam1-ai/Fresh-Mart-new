import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  vendorStatus: user.vendorStatus,
  vendorProfile: user.vendorProfile,
  addresses: user.addresses,
  token: generateToken(user._id)
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const exists = await User.findOne({ email });

  if (exists) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const user = await User.create({ name, email, password, phone });
  res.status(201).json(userPayload(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.role === 'vendor' && user.vendorStatus !== 'approved') {
    res.status(403);
    throw new Error('Vendor registration pending approval');
  }

  res.json(userPayload(user));
});

export const registerVendor = asyncHandler(async (req, res) => {
  const { name, email, password, phone, storeName, businessName, gstNumber, pickupAddress, description, supportEmail } = req.body;
  const exists = await User.findOne({ email });

  if (exists) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'vendor',
    vendorStatus: 'pending',
    vendorProfile: {
      storeName,
      businessName,
      gstNumber,
      pickupAddress,
      description,
      supportEmail
    }
  });

  res.status(201).json({
    ...userPayload(user),
    message: 'Vendor registration submitted for approval'
  });
});

