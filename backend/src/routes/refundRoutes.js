import express from 'express';
import { createRefundRequest, getMyRefundRequests, getRefundRequests, updateRefundRequest } from '../controllers/refundController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRefundRequest);
router.get('/my', protect, getMyRefundRequests);
router.get('/', protect, admin, getRefundRequests);
router.patch('/:id', protect, admin, updateRefundRequest);

export default router;