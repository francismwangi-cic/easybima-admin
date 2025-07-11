import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Routes will be implemented later
router.route('/')
  .get(authorize('admin', 'accountant'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get commissions endpoint - to be implemented',
      data: []
    });
  });

router.route('/:id')
  .get(authorize('admin', 'accountant'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get commission by ID endpoint - to be implemented',
      data: {}
    });
  });

router.route('/process')
  .post(authorize('admin', 'accountant'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Process commission payment endpoint - to be implemented',
      data: {}
    });
  });

export default router;
