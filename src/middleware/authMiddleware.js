import jwt from 'jsonwebtoken';
import initializeModels from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

let User;

// Initialize models when needed
const initializeAuthMiddleware = async () => {
  if (!User) {
    const models = await initializeModels();
    User = models.User;
  }
};

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  await initializeAuthMiddleware();
  let token;

  // Get token from headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return next(new AppError('No user found with this token', 401));
    }

    if (user.status !== 'active') {
      return next(new AppError('User account is not active', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};

// Check specific permissions
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions || !req.user.permissions[permission]) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
};