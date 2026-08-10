import express from 'express';
import { login, register, registerVendor, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/vendors/register', registerVendor);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;

