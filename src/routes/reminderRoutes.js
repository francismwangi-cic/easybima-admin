import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Routes will be implemented later
router.route('/')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get reminders endpoint - to be implemented',
      data: []
    });
  })
  .post(authorize('admin', 'agent'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create reminder endpoint - to be implemented',
      data: {}
    });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get reminder by ID endpoint - to be implemented',
      data: {}
    });
  })
  .put(authorize('admin', 'agent'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Update reminder endpoint - to be implemented',
      data: {}
    });
  })
  .delete(authorize('admin', 'agent'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Delete reminder endpoint - to be implemented'
    });
  });

router.route('/:id/mark-complete')
  .patch(authorize('admin', 'agent'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Mark reminder as complete endpoint - to be implemented',
      data: {}
    });
  });

export default router;
