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
      message: 'Get documents endpoint - to be implemented',
      data: []
    });
  })
  .post(authorize('admin', 'agent'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Upload document endpoint - to be implemented',
      data: {}
    });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get document by ID endpoint - to be implemented',
      data: {}
    });
  })
  .delete(authorize('admin', 'agent'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Delete document endpoint - to be implemented'
    });
  });

export default router;
