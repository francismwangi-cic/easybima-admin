import Payment from '../models/Payment.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get payments by customer code
 * @route   GET /api/payments/customer/:customerCode
 * @access  Private
 */
const getPaymentsByCustomer = asyncHandler(async (req, res) => {
  try {
    const { customerCode } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const payments = await Payment.findByCustomerCode(customerCode, {
      attributes: [
        'PAYMENT_ID',
        'CUSTOMER_CODE',
        'POLICY_ID',
        'AMOUNT',
        'PAYMENT_METHOD',
        'MPESA_CODE',
        'TRANSACTION_ID',
        'PAYMENT_DATE',
        'CREATED_AT',
        'UPDATED_AT'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['PAYMENT_DATE', 'DESC']],
      raw: true
    });

    const summary = await Payment.getCustomerPaymentSummary(customerCode);

    // Format payments to include formatted dates and M-Pesa details
    const formattedPayments = payments.map(payment => ({
      ...payment,
      paymentDate: payment.PAYMENT_DATE ? new Date(payment.PAYMENT_DATE).toISOString() : null,
      createdAt: payment.CREATED_AT ? new Date(payment.CREATED_AT).toISOString() : null,
      updatedAt: payment.UPDATED_AT ? new Date(payment.UPDATED_AT).toISOString() : null,
      mpesaCode: payment.MPESA_CODE || null,
      paymentMethod: payment.PAYMENT_METHOD,
      transactionId: payment.TRANSACTION_ID || null
    }));

    res.json({
      success: true,
      data: formattedPayments,
      summary: {
        ...summary,
        averagePayment: payments.length > 0 
          ? (summary.totalPaid / payments.length).toFixed(2) 
          : 0,
        paymentMethods: payments.reduce((acc, payment) => {
          const method = payment.PAYMENT_METHOD || 'UNKNOWN';
          acc[method] = (acc[method] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
});

/**
 * @desc    Get payment summary by customer code
 * @route   GET /api/payments/summary/:customerCode
 * @access  Private
 */
const getPaymentSummary = asyncHandler(async (req, res) => {
  try {
    const { customerCode } = req.params;
    const summary = await Payment.getCustomerPaymentSummary(customerCode);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get Payment Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment summary',
      error: error.message
    });
  }
});

/**
 * @desc    Search payments with filters
 * @route   GET /api/payments/search
 * @access  Private
 */
const searchPayments = asyncHandler(async (req, res) => {
  try {
    const { 
      customerCode, 
      policyId, 
      startDate, 
      endDate,
      minAmount,
      maxAmount,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (customerCode) whereClause.CUSTOMER_CODE = customerCode;
    if (policyId) whereClause.POLICY_ID = policyId;
    
    if (startDate || endDate) {
      whereClause.PAYMENT_DATE = {};
      if (startDate) whereClause.PAYMENT_DATE[Op.gte] = new Date(startDate);
      if (endDate) whereClause.PAYMENT_DATE[Op.lte] = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      whereClause.AMOUNT = {};
      if (minAmount) whereClause.AMOUNT[Op.gte] = parseFloat(minAmount);
      if (maxAmount) whereClause.AMOUNT[Op.lte] = parseFloat(maxAmount);
    }
    
    const { count, rows: payments } = await Payment.findAndCountAll({
      attributes: [
        'PAYMENT_ID',
        'CUSTOMER_CODE',
        'POLICY_ID',
        'AMOUNT',
        'PAYMENT_METHOD',
        'MPESA_CODE',
        'TRANSACTION_ID',
        'PAYMENT_DATE',
        'CREATED_AT',
        'UPDATED_AT'
      ],
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['PAYMENT_DATE', 'DESC']],
      raw: true
    });
    
    const latestMpesaPayment = await Payment.findOne({
      attributes: [
        'MPESA_CODE',
        'PAYMENT_DATE',
        'CREATED_AT',
        'UPDATED_AT'
      ],
      where: {
        CUSTOMER_CODE: customerCode,
        PAYMENT_METHOD: 'MPESA',
        INIT: 1
      },
      order: [['PAYMENT_DATE', 'DESC']],
      raw: true
    });

    const result = await Payment.getCustomerPaymentSummary(customerCode);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: payments,
      summary: {
        totalPaid: parseFloat(result?.totalPaid || 0),
        paymentCount: parseInt(result?.paymentCount || 0),
        mpesaDetails: latestMpesaPayment ? {
          lastMpesaCode: latestMpesaPayment.MPESA_CODE,
          lastPaymentDate: latestMpesaPayment.PAYMENT_DATE ? new Date(latestMpesaPayment.PAYMENT_DATE).toISOString() : null,
          lastUpdated: latestMpesaPayment.UPDATED_AT ? new Date(latestMpesaPayment.UPDATED_AT).toISOString() : null,
          createdAt: latestMpesaPayment.CREATED_AT ? new Date(latestMpesaPayment.CREATED_AT).toISOString() : null,
          amount: parseFloat(latestMpesaPayment.AMOUNT || 0)
        } : null
      }
    });
  } catch (error) {
    console.error('Search Payments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching payments',
      error: error.message
    });
  }
});

export { 
  getPaymentsByCustomer, 
  getPaymentSummary, 
  searchPayments 
};
