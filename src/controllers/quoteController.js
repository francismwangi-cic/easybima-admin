import Quote from '../models/Quote.js';
import asyncHandler from 'express-async-handler';
import moment from 'moment';

/**
 * @desc    Get quotes with date range filtering
 * @route   GET /api/quotes
 * @access  Private
 */
const getQuotes = asyncHandler(async (req, res) => {
  try {
    const { range, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Build date range condition
    const dateCondition = {};
    const now = moment();
    
    if (range === 'daily') {
      dateCondition.CREATED_AT = {
        [Op.gte]: now.startOf('day').toDate(),
        [Op.lte]: now.endOf('day').toDate()
      };
    } else if (range === 'weekly') {
      dateCondition.CREATED_AT = {
        [Op.gte]: now.startOf('week').toDate(),
        [Op.lte]: now.endOf('week').toDate()
      };
    } else if (range === 'monthly') {
      dateCondition.CREATED_AT = {
        [Op.gte]: now.startOf('month').toDate(),
        [Op.lte]: now.endOf('month').toDate()
      };
    } else if (startDate && endDate) {
      dateCondition.CREATED_AT = {
        [Op.gte]: moment(startDate).startOf('day').toDate(),
        [Op.lte]: moment(endDate).endOf('day').toDate()
      };
    }

    const { count, rows: quotes } = await Quote.findAndCountAll({
      where: dateCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['CREATED_AT', 'DESC']],
      include: [
        { 
          model: models.Client, 
          as: 'client', 
          attributes: ['CLIENT_ID', 'FIRST_NAME', 'LAST_NAME', 'EMAIL'] 
        },
        { 
          model: models.Product, 
          as: 'product', 
          attributes: ['PRODUCT_ID', 'NAME'] 
        },
        { 
          model: models.User, 
          as: 'creator', 
          attributes: ['USER_ID', 'FIRST_NAME', 'LAST_NAME'] 
        }
      ]
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: quotes
    });
  } catch (error) {
    console.error('Get Quotes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotes',
      error: error.message
    });
  }
});

/**
 * @desc    Get quote statistics by date range
 * @route   GET /api/quotes/stats
 * @access  Private/Admin
 */
const getQuoteStats = asyncHandler(async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;
    
    // Build date range condition
    const dateCondition = {};
    const now = moment();
    
    if (range === 'daily') {
      dateCondition.CREATED_AT = {
        [Op.gte]: now.startOf('day').toDate(),
        [Op.lte]: now.endOf('day').toDate()
      };
    } else if (range === 'weekly') {
      dateCondition.CREATED_AT = {
        [Op.gte]: now.startOf('week').toDate(),
        [Op.lte]: now.endOf('week').toDate()
      };
    } else if (range === 'monthly') {
      dateCondition.CREATED_AT = {
        [Op.gte]: now.startOf('month').toDate(),
        [Op.lte]: now.endOf('month').toDate()
      };
    } else if (startDate && endDate) {
      dateCondition.CREATED_AT = {
        [Op.gte]: moment(startDate).startOf('day').toDate(),
        [Op.lte]: moment(endDate).endOf('day').toDate()
      };
    }

    const quotes = await Quote.findAll({
      where: dateCondition,
      raw: true
    });
    
    const totalQuotes = quotes.length;
    const totalPremium = quotes.reduce((sum, quote) => sum + parseFloat(quote.TOTAL_PREMIUM || 0), 0);
    const convertedQuotes = quotes.filter(quote => quote.STATUS === 'CONVERTED').length;
    const conversionRate = totalQuotes > 0 ? (convertedQuotes / totalQuotes) * 100 : 0;
    
    // Group by product
    const products = {};
    quotes.forEach(quote => {
      const productName = quote.PRODUCT_NAME || 'Unknown';
      if (!products[productName]) {
        products[productName] = {
          count: 0,
          totalPremium: 0,
          converted: 0
        };
      }
      products[productName].count++;
      products[productName].totalPremium += parseFloat(quote.TOTAL_PREMIUM || 0);
      if (quote.STATUS === 'CONVERTED') {
        products[productName].converted++;
      }
    });
    
    // Format products data
    const productStats = Object.entries(products).map(([name, stats]) => ({
      name,
      count: stats.count,
      totalPremium: parseFloat(stats.totalPremium.toFixed(2)),
      conversionRate: stats.count > 0 
        ? parseFloat(((stats.converted / stats.count) * 100).toFixed(2))
        : 0
    }));

    res.json({
      success: true,
      stats: {
        totalQuotes,
        totalPremium: parseFloat(totalPremium.toFixed(2)),
        convertedQuotes,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averagePremium: totalQuotes > 0 
          ? parseFloat((totalPremium / totalQuotes).toFixed(2)) 
          : 0,
        byProduct: productStats
      }
    });
  } catch (error) {
    console.error('Get Quote Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quote statistics',
      error: error.message
    });
  }
});

export { getQuotes, getQuoteStats };
