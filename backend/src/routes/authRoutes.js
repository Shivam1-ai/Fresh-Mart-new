import express from 'express';
import { login, register, registerVendor } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/vendors/register', registerVendor);
router.post('/login', login);

export default router;

