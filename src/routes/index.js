import express from 'express';
const router = express.Router();

// Import route modules
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import clientRoutes from './clientRoutes.js';
import quoteRoutes from './quoteRoutes.js';
import policyRoutes from './policyRoutes.js';
import documentRoutes from './documentRoutes.js';
import valuationRoutes from './valuationRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import commissionRoutes from './commissionRoutes.js';
import reminderRoutes from './reminderRoutes.js';
import claimRoutes from './claimRoutes.js';
import reportRoutes from './reportRoutes.js';
import productRoutes from './productRoutes.js';
import intermediaryRoutes from './intermediaryRoutes.js';

// Route definitions
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/quotes', quoteRoutes);
router.use('/policies', policyRoutes);
router.use('/documents', documentRoutes);
router.use('/valuations', valuationRoutes);
router.use('/payments', paymentRoutes);
router.use('/commissions', commissionRoutes);
router.use('/reminders', reminderRoutes);
router.use('/claims', claimRoutes);
router.use('/reports', reportRoutes);
router.use('/products', productRoutes);
router.use('/intermediaries', intermediaryRoutes);

export default router;