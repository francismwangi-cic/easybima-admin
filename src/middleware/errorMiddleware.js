import AppError from '../utils/appError.js';

const handleSequelizeError = (error) => {
  let message = 'Database error occurred';

  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => err.message);
    message = `Validation error: ${errors.join('. ')}`;
    return new AppError(message, 400);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0].path;
    message = `Duplicate field value for ${field}`;
    return new AppError(message, 400);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    message = 'Invalid reference to related resource';
    return new AppError(message, 400);
  }

  return new AppError(message, 500);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  } else {
    console.error('ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Sequelize errors
  if (err.name === 'SequelizeValidationError' || 
      err.name === 'SequelizeUniqueConstraintError' || 
      err.name === 'SequelizeForeignKeyConstraintError') {
    error = handleSequelizeError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Handle 404 errors
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

export { errorHandler, notFound };