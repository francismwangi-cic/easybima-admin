import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getQuotes, getQuoteStats } from '../controllers/quoteController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

/**
 * @route   GET /api/quotes
 * @desc    Get quotes with optional date range filtering
 * @query   {string} [range] - Date range filter (daily, weekly, monthly)
 * @query   {string} [startDate] - Start date for custom range (YYYY-MM-DD)
 * @query   {string} [endDate] - End date for custom range (YYYY-MM-DD)
 * @query   {number} [page=1] - Page number for pagination
 * @query   {number} [limit=10] - Number of items per page
 * @access  Private
 */
router.get('/', getQuotes);

/**
 * @route   GET /api/quotes/stats
 * @desc    Get quote statistics with optional date range filtering
 * @query   {string} [range] - Date range filter (daily, weekly, monthly)
 * @query   {string} [startDate] - Start date for custom range (YYYY-MM-DD)
 * @query   {string} [endDate] - End date for custom range (YYYY-MM-DD)
 * @access  Private/Admin
 */
router.route('/')
  .get(getQuotes)
  .post(authorize('admin', 'agent'), (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Create quote endpoint - to be implemented',
      data: {}
    });
  });

router.get('/stats', authorize('admin'), getQuoteStats);

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get quote by ID endpoint - to be implemented',
      data: {}
    });
  })
  .put(authorize('admin', 'agent'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Update quote endpoint - to be implemented',
      data: {}
    });
  })
  .delete(authorize('admin'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Delete quote endpoint - to be implemented'
    });
  });

export default router;
