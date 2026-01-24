import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { protect } from '../middlewares';
import { validate } from '../middlewares';
import { registerValidation, loginValidation } from '../validators';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
