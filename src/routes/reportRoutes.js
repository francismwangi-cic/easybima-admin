import express from 'express';
import { body, query } from 'express-validator';
import { protect, authorize } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

/**
 * @route   GET /api/reports/premium-collection
 * @desc    Get premium collection report
 * @access  Private (admin, accountant)
 */
router.get(
  '/premium-collection',
  authorize('admin', 'accountant'),
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date'),
    query('agentId').optional().isString(),
    query('productId').optional().isString(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  asyncHandler(async (req, res) => {
    const { startDate, endDate, agentId, productId, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.paymentDate.$lte = end;
      }
    }
    
    if (agentId) filter.agentId = agentId;
    if (productId) filter.productId = productId;
    
    // TODO: Replace with actual database query
    // Example: const payments = await Payment.find(filter)
    //   .skip((page - 1) * limit)
    //   .limit(limit);
    
    // Mock response - remove when database is connected
    const mockPayments = [];
    const total = 0;
    
    res.status(200).json({
      success: true,
      count: mockPayments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: mockPayments
    });
  })
);

/**
 * @route   GET /api/reports/claims
 * @desc    Get claims report
 * @access  Private (admin, claims)
 */
router.get(
  '/claims',
  authorize('admin', 'claims'),
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'paid']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  asyncHandler(async (req, res) => {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.claimDate = {};
      if (startDate) filter.claimDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.claimDate.$lte = end;
      }
    }
    
    // TODO: Replace with actual database query
    // Example: const claims = await Claim.find(filter)
    //   .populate('clientId', 'firstName lastName')
    //   .populate('policyId', 'policyNumber')
    //   .skip((page - 1) * limit)
    //   .limit(limit);
    
    // Mock response - remove when database is connected
    const mockClaims = [];
    const total = 0;
    
    res.status(200).json({
      success: true,
      count: mockClaims.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: mockClaims
    });
  })
);

/**
 * @route   GET /api/reports/commissions
 * @desc    Get commission report
 * @access  Private (admin, accountant)
 */
router.get(
  '/commissions',
  authorize('admin', 'accountant'),
  [
    query('agentId').optional().isString(),
    query('status').optional().isIn(['pending', 'paid', 'cancelled']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  asyncHandler(async (req, res) => {
    const { agentId, status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (agentId) filter.agentId = agentId;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.commissionDate = {};
      if (startDate) filter.commissionDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.commissionDate.$lte = end;
      }
    }
    
    // TODO: Replace with actual database query
    // Example: const commissions = await Commission.find(filter)
    //   .populate('agentId', 'firstName lastName');
    
    // Mock response - remove when database is connected
    const mockCommissions = [];
    
    res.status(200).json({
      success: true,
      count: mockCommissions.length,
      data: mockCommissions
    });
  })
);

/**
 * @route   GET /api/reports/policies/expiring
 * @desc    Get expiring policies report
 * @access  Private (admin, agent)
 */
router.get(
  '/policies/expiring',
  authorize('admin', 'agent'),
  [
    query('days').optional().isInt({ min: 1, max: 90 })
      .withMessage('Days must be between 1 and 90')
      .toInt(),
  ],
  asyncHandler(async (req, res) => {
    const days = req.query.days || 30;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    // TODO: Replace with actual database query
    // Example: const policies = await Policy.find({
    //   endDate: { $lte: targetDate, $gte: new Date() },
    //   status: 'active'
    // }).populate('clientId', 'firstName lastName email phone');
    
    // Mock response - remove when database is connected
    const mockPolicies = [];
    
    res.status(200).json({
      success: true,
      count: mockPolicies.length,
      days,
      expiryDate: targetDate,
      data: mockPolicies
    });
  })
);

/**
 * @route   GET /api/reports/agent-performance
 * @desc    Get agent performance report
 * @access  Private (admin)
 */
router.get(
  '/agent-performance',
  authorize('admin'),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }
    
    // TODO: Replace with actual database aggregation
    // Example aggregation pipeline for agent performance
    /*
    const pipeline = [
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: '$agentId',
          policiesSold: { $sum: 1 },
          totalPremium: { $sum: '$premiumAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          averagePolicyValue: { $avg: '$premiumAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent'
        }
      },
      { $unwind: '$agent' },
      {
        $project: {
          agentId: '$_id',
          agentName: { $concat: ['$agent.firstName', ' ', '$agent.lastName'] },
          policiesSold: 1,
          totalPremium: 1,
          totalCommission: 1,
          averagePolicyValue: 1
        }
      },
      { $sort: { totalPremium: -1 } }
    ];
    
    const results = await Policy.aggregate(pipeline);
    */
    
    // Mock response - remove when database is connected
    const mockResults = [];
    
    res.status(200).json({
      success: true,
      count: mockResults.length,
      data: mockResults
    });
  })
);

export default router;
