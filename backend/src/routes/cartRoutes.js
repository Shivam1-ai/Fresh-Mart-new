import express from 'express';
import { addCartItem, getCart, removeCartItem, updateCartItem } from '../controllers/cartController.js';
import { customer, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, customer);

router.get('/', getCart);
router.post('/items', addCartItem);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);

export default router;

