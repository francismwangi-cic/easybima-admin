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
      message: 'Get claims endpoint - to be implemented',
      data: []
    });
  })
  .post(authorize('admin', 'agent', 'client'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'File claim endpoint - to be implemented',
      data: {}
    });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get claim by ID endpoint - to be implemented',
      data: {}
    });
  })
  .put(authorize('admin', 'claims'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Update claim endpoint - to be implemented',
      data: {}
    });
  });

router.route('/:id/status')
  .patch(authorize('admin', 'claims'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Update claim status endpoint - to be implemented',
      data: {}
    });
  });

router.route('/:id/documents')
  .post(authorize('admin', 'agent', 'client'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Upload claim document endpoint - to be implemented',
      data: {}
    });
  });

export default router;
