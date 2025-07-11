import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import cors from 'cors';

const router = express.Router();

// CORS configuration for auth routes
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS to all auth routes
router.use(cors(corsOptions));

// Admin Login Only
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Logout
router.post('/logout', protect, authController.logout);

// Get current user
router.get('/me', protect, authController.getMe);

// Refresh token
router.get('/refresh-token', authController.refreshToken);

// Update password
router.put('/password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], authController.updatePassword);

export default router;