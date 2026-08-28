import express from 'express';
import {
  approveVendor,
  createPromotion,
  deletePromotion,
  getAnalytics,
  getCategories,
  getDashboardSummary,
  getTransactions,
  getUsers,
  getVendors,
  listPromotions,
  listRefundRequests,
  rejectVendor,
  updatePromotion,
  updateRefundRequest,
  updateUserRole,
  updateUserStatus
} from '../controllers/adminController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, admin, getDashboardSummary);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/categories', protect, admin, getCategories);
router.get('/users', protect, admin, getUsers);
router.patch('/users/:id/role', protect, admin, updateUserRole);
router.patch('/users/:id/status', protect, admin, updateUserStatus);
router.get('/vendors', protect, admin, getVendors);
router.patch('/vendors/:id/approve', protect, admin, approveVendor);
router.patch('/vendors/:id/reject', protect, admin, rejectVendor);
router.route('/promotions').get(protect, admin, listPromotions).post(protect, admin, createPromotion);
router.route('/promotions/:id').put(protect, admin, updatePromotion).delete(protect, admin, deletePromotion);
router.get('/refunds', protect, admin, listRefundRequests);
router.patch('/refunds/:id', protect, admin, updateRefundRequest);
router.get('/transactions', protect, admin, getTransactions);

export default router;
