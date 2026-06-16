import express from 'express';
import { createOrder, getMyOrders, getOrderById, getOrderTracking, getOrders, updateOrderStatus, updateOrderTracking } from '../controllers/orderController.js';
import { admin, protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id/tracking', protect, getOrderTracking);
router.get('/:id', protect, getOrderById);
router.get('/', protect, admin, getOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/tracking', protect, vendor, updateOrderTracking);

export default router;

