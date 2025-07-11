import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import initializeModels from '../models/index.js';
let User;

// Initialize models when needed
const initializeAuthController = async () => {
  if (!User) {
    const models = await initializeModels();
    User = models.User;
  }
};
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Generate JWT Token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Send token response
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
  };

  // Remove password from output
  user.password = undefined;

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      data: { user }
    });
};

// Refresh token
export const refreshToken = asyncHandler(async (req, res, next) => {
  await initializeAuthController();
  const token = req.cookies.token;
  
  if (!token) {
    return next(new AppError('No token provided', 401));
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

    // Generate new token
    const newToken = generateToken(user.id);
    
    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
    };

    res.status(200)
      .cookie('token', newToken, cookieOptions)
      .json({
        success: true,
        token: newToken,
        data: { user }
      });
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  await initializeAuthController();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { email, password } = req.body;

  // Find admin user
  const user = await User.findOne({
    where: { 
      email,
      role: 'admin',
      isActive: true
    }
  });

  if (!user || !(await user.validatePassword(password))) {
    return next(new AppError('Invalid admin credentials', 401));
  }

  // Update last login
  await user.update({ lastLogin: new Date() });

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
  };

  res.cookie('token', 'none', cookieOptions);

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  await initializeAuthController();
  res.status(200).json({
    success: true,
    data: { user: req.user }
  });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);

  if (!(await user.validatePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  await user.update({ password: newPassword });

  sendTokenResponse(user, 200, res);
});