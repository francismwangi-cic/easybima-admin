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
      message: 'Get valuations endpoint - to be implemented',
      data: []
    });
  })
  .post(authorize('admin', 'agent'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create valuation endpoint - to be implemented',
      data: {}
    });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get valuation by ID endpoint - to be implemented',
      data: {}
    });
  })
  .put(authorize('admin', 'agent'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Update valuation endpoint - to be implemented',
      data: {}
    });
  })
  .delete(authorize('admin'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Delete valuation endpoint - to be implemented'
    });
  });

export default router;
