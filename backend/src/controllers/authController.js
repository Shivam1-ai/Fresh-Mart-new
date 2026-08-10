import crypto from 'crypto';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

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

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

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

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });

  // Always respond with success to avoid email enumeration
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashed;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const frontend = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${frontend}/#/reset-password/${resetToken}`;
  const message = `You requested a password reset. Use the link below to reset your password (valid for 1 hour):\n\n${resetUrl}`;

  try {
    await sendEmail({ to: user.email, subject: 'Password reset', text: message });
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
  console.error('Email Error:', err);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(500);
  throw new Error(err.message);
}
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error('Token and new password are required');
  }

  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password has been reset', ...userPayload(user) });
});

export const registerVendor = asyncHandler(async (req, res) => {
  req.body.role = 'vendor';
  return register(req, res);
});
