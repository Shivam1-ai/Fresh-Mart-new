import express from 'express';
import { addCartItem, getCart, removeCartItem, updateCartItem } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/items', protect, addCartItem);
router.put('/items/:productId', protect, updateCartItem);
router.delete('/items/:productId', protect, removeCartItem);

export default router;

