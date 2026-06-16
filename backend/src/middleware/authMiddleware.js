import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from './asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    const error = new Error('Authentication token required');
    error.statusCode = 401;
    throw error;
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.userId).select('-password');

  if (!req.user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  if (req.user.isActive === false) {
    const error = new Error('Account is disabled');
    error.statusCode = 403;
    throw error;
  }

  next();
});

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    const error = new Error(`${roles.join(' or ')} access required`);
    error.statusCode = 403;
    throw error;
  }

  if (req.user?.role === 'vendor' && req.user.vendorStatus !== 'approved') {
    const error = new Error('Vendor registration pending approval');
    error.statusCode = 403;
    throw error;
  }

  next();
};

export const admin = authorizeRoles('admin');

export const vendor = authorizeRoles('vendor');

