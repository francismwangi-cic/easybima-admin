import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { searchUsers, getUserById } from '../controllers/userController.js';

const router = express.Router();

// Apply authentication to all routes 
router.use(protect);

// User validation rules
const userValidation = [
  body('username').optional().isLength({ min: 3 }).trim().withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('firstName').optional().notEmpty().trim().withMessage('First name is required'),
  body('lastName').optional().notEmpty().trim().withMessage('Last name is required'),
  body('role').optional().isIn(['admin', 'manager', 'agent', 'viewer']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
];

// Search users by name, email, or phone
router.get('/search', authorize('admin'), searchUsers);

// Get all users with search and pagination
router.route('/')
  .get(authorize('admin'), (req, res, next) => {
    // If search query parameter exists, use search functionality
    if (req.query.q) {
      return searchUsers(req, res, next);
    }
    
    // Otherwise, return all users with pagination
    // This is a placeholder - you might want to implement a separate controller for this
    res.status(200).json({
      success: true,
      message: 'Get users endpoint - to be implemented',
      data: []
    });
  })
  .post(authorize('admin'), userValidation, (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create user endpoint - to be implemented',
      data: {}
    });
  });

router.route('/:id')
  .get(authorize('admin'), getUserById)
  .put(authorize('admin'), userValidation, (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Update user endpoint - to be implemented',
      data: {}
    });
  })
  .delete(authorize('admin'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Delete user endpoint - to be implemented'
    });
  });

export default router;