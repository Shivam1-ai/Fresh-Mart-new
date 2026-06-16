import express from 'express';
import { createInquiry, getMyInquiries } from '../controllers/inquiryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInquiry);
router.get('/my', protect, getMyInquiries);

export default router;