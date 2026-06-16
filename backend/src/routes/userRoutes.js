import express from 'express';
import { addAddress, deleteAddress, getProfile, getUsers, updateProfile } from '../controllers/userController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.get('/', protect, admin, getUsers);

export default router;

