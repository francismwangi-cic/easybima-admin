import initializeModels from '../models/index.js';
import { validationResult } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { Op } from 'sequelize';

let Client, Quote, Policy, Payment, Claim;

// Initialize models when needed
const initializeClientController = async () => {
  if (!Client) {
    const models = await initializeModels();
    Client = models.Client;
    Quote = models.Quote;
    Policy = models.Policy;
    Payment = models.Payment;
    Claim = models.Claim;
  }
};

// Get all clients with filtering and pagination
export const getClients = asyncHandler(async (req, res) => {
  await initializeClientController();
  const {
    page = 1,
    limit = 20,
    search,
    status,
    sortBy = 'createdAt',
    sortOrder = 'DESC'
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {};

  // Search functionality
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { phoneNumber: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Status filter
  if (status) {
    where.status = status;
  }

  const { count, rows } = await Client.findAndCountAll({
    where,
    order: [[sortBy, sortOrder]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [
      {
        model: Policy,
        attributes: ['id', 'policyNumber', 'status'],
        separate: true,
        limit: 5
      }
    ]
  });

  res.status(200).json({
    success: true,
    data: {
      clients: rows,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        total: count,
        limit: parseInt(limit)
      }
    }
  });
});

// Get single client
export const getClient = asyncHandler(async (req, res, next) => {
  await initializeClientController();
  const client = await Client.findByPk(req.params.id, {
    include: [
      {
        model: Quote,
        include: ['Product', 'User']
      },
      {
        model: Policy,
        include: ['Product', 'User']
      },
      {
        model: Payment,
        include: ['Policy']
      },
      {
        model: Claim,
        include: ['Policy']
      }
    ]
  });

  if (!client) {
    return next(new AppError('Client not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { client }
  });
});

// Create new client
export const createClient = asyncHandler(async (req, res, next) => {
  await initializeClientController();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const client = await Client.create(req.body);

  res.status(201).json({
    success: true,
    data: { client }
  });
});

// Update client
export const updateClient = asyncHandler(async (req, res, next) => {
  await initializeClientController();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const client = await Client.findByPk(req.params.id);

  if (!client) {
    return next(new AppError('Client not found', 404));
  }

  await client.update(req.body);

  res.status(200).json({
    success: true,
    data: { client }
  });
});

// Delete client
export const deleteClient = asyncHandler(async (req, res, next) => {
  await initializeClientController();
  const client = await Client.findByPk(req.params.id);

  if (!client) {
    return next(new AppError('Client not found', 404));
  }

  // Check if client has active policies
  const activePolicies = await Policy.count({
    where: {
      clientId: req.params.id,
      status: 'active'
    }
  });

  if (activePolicies > 0) {
    return next(new AppError('Cannot delete client with active policies', 400));
  }

  await client.destroy();

  res.status(200).json({
    success: true,
    message: 'Client deleted successfully'
  });
});

// Get client statistics
export const getClientStats = asyncHandler(async (req, res) => {
  await initializeClientController();
  const stats = await Client.findAll({
    attributes: [
      'status',
      [Client.sequelize.fn('COUNT', Client.sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const totalClients = await Client.count();
  const activeClients = await Client.count({ where: { status: 'active' } });

  res.status(200).json({
    success: true,
    data: {
      stats,
      totalClients,
      activeClients
    }
  });
});