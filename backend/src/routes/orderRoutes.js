import express from 'express';
import { createOrder, getMyOrders, getOrderById, getOrderTracking, updateOrderTracking } from '../controllers/orderController.js';
import { customer, protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, customer, createOrder);
router.get('/my', protect, customer, getMyOrders);
router.get('/:id/tracking', protect, customer, getOrderTracking);
router.get('/:id', protect, customer, getOrderById);
router.put('/:id/tracking', protect, vendor, updateOrderTracking);

export default router;

