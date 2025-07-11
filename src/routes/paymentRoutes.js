import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  getPaymentsByCustomer, 
  getPaymentSummary, 
  searchPayments 
} from '../controllers/paymentController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Search payments with filters
// GET /api/payments?customerCode=ABC123&startDate=2023-01-01&endDate=2023-12-31&page=1&limit=10
router.get('/', searchPayments);

// Get payments by customer code
// GET /api/payments/customer/ABC123?page=1&limit=10
router.get('/customer/:customerCode', getPaymentsByCustomer);

// Get payment summary for a customer
// GET /api/payments/summary/ABC123
router.get('/summary/:customerCode', getPaymentSummary);

// Create a new payment (placeholder for future implementation)
router.post('/', authorize('admin', 'agent'), (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Record payment endpoint - to be implemented',
    data: {}
  });
});

// Keep existing routes for future implementation
router.route('/:id')
  .get((req, res) => {
    res.status(200).json({
      success: true,
      message: 'Get payment by ID endpoint - to be implemented',
      data: {}
    });
  })
  .put(authorize('admin'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Update payment endpoint - to be implemented',
      data: {}
    });
  })
  .delete(authorize('admin'), (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Void payment endpoint - to be implemented'
    });
  });

export default router;
