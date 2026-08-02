import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

const normalizeRole = (role) => {
  if (!role || role === 'user' || role === 'customer') return 'user';
  if (role === 'vendor') return role;
  return null;
};

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

const buildVendorProfile = (payload = {}) => ({
  storeName: payload.vendorProfile?.storeName ?? payload.storeName,
  businessName: payload.vendorProfile?.businessName ?? payload.businessName,
  gstNumber: payload.vendorProfile?.gstNumber ?? payload.gstNumber,
  pickupAddress: payload.vendorProfile?.pickupAddress ?? payload.pickupAddress,
  description: payload.vendorProfile?.description ?? payload.description,
  supportEmail: payload.vendorProfile?.supportEmail ?? payload.supportEmail
});

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

export const register = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const phone = String(req.body.phone || '').replace(/\D/g, '');
  const role = normalizeRole(req.body.role);
  const profileImage = sanitizeProfileImage(req.body.profileImage);

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  if (!role) {
    res.status(400);
    throw new Error('Invalid role selected');
  }

  if (!emailPattern.test(email)) {
    res.status(400);
    throw new Error('Enter a valid email address');
  }

  if (!phonePattern.test(phone)) {
    res.status(400);
    throw new Error('Phone number must contain exactly 10 digits');
  }

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
    profileImage,
    role,
    vendorStatus: role === 'vendor' ? 'pending' : undefined,
    vendorProfile: role === 'vendor' ? buildVendorProfile(req.body) : undefined
  });

  res.status(201).json({
    ...userPayload(user),
    ...(role === 'vendor' ? { message: 'Vendor registration submitted for approval' } : {})
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.trim().toLowerCase() });

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
  req.body.role = 'vendor';
  return register(req, res);
});

