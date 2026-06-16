import express from 'express';
import {
  createVendorProduct,
  deleteVendorProduct,
  getVendorDashboard,
  getVendorEarningsReport,
  getVendorInquiries,
  getVendorOrders,
  getVendorProducts,
  getVendorProfile,
  replyToInquiry,
  updateVendorOrderStatus,
  updateVendorProfile,
  updateVendorProduct
} from '../controllers/vendorController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, vendor, getVendorProfile);
router.put('/profile', protect, vendor, updateVendorProfile);
router.get('/dashboard', protect, vendor, getVendorDashboard);
router.get('/products', protect, vendor, getVendorProducts);
router.post('/products', protect, vendor, createVendorProduct);
router.put('/products/:id', protect, vendor, updateVendorProduct);
router.delete('/products/:id', protect, vendor, deleteVendorProduct);
router.get('/orders', protect, vendor, getVendorOrders);
router.put('/orders/:id', protect, vendor, updateVendorOrderStatus);
router.get('/earnings', protect, vendor, getVendorEarningsReport);
router.get('/inquiries', protect, vendor, getVendorInquiries);
router.patch('/inquiries/:id', protect, vendor, replyToInquiry);

export default router;