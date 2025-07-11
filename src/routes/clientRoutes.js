import express from 'express';
import { body } from 'express-validator';
import * as clientController from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Client validation rules
const clientValidation = [
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().trim().withMessage('Phone number is required'),
  body('idNumber').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('status').optional().isIn(['active', 'inactive', 'blacklisted'])
];

// Routes
router.route('/')
  .get(clientController.getClients)
  .post(authorize('admin', 'manager', 'agent'), clientValidation, clientController.createClient);

router.get('/stats', authorize('admin', 'manager'), clientController.getClientStats);

router.route('/:id')
  .get(clientController.getClient)
  .put(authorize('admin', 'manager', 'agent'), clientValidation, clientController.updateClient)
  .delete(authorize('admin', 'manager'), clientController.deleteClient);

export default router;