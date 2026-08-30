import express from 'express';
import { validatePromoCode } from '../controllers/promotionController.js';
import { customer, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', protect, customer, validatePromoCode);

export default router;
