/**
 * Custom Error Class for API Errors
 */
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Create error handlers as a map for better maintainability
const errorHandlers = {
  // Handle MongoDB duplicate key errors
  handleDuplicateFields: (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${value}. Please use another value for ${field}.`;
    return new APIError(message, 400);
  },
  
  // Handle MongoDB validation errors
  handleValidationError: (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new APIError(message, 400);
  },
  
  // Handle JWT errors
  handleJWTError: () => new APIError('Invalid token. Please log in again!', 401),
  
  // Handle JWT expired errors
  handleJWTExpiredError: () => new APIError('Your token has expired! Please log in again.', 401)
};

/**
 * Format and send error response based on environment
 */
const sendErrorResponse = (err, res, isDevMode) => {
  // For operational errors, send detailed message
  if (err.isOperational) {
    const response = {
      success: false,
      status: err.status,
      message: err.message
    };
    
    // Include error details and stack in development
    if (isDevMode) {
      response.error = err;
      response.stack = err.stack;
    }
    
    return res.status(err.statusCode).json(response);
  }
  
  // For programming errors, don't leak error details in production
  console.error('ERROR 💥', err);
  
  const response = {
    success: false,
    status: 'error',
    message: isDevMode ? err.message : 'Something went wrong'
  };
  
  if (isDevMode) {
    response.error = err;
    response.stack = err.stack;
  }
  
  res.status(500).json(response);
};

/**
 * Global error handler middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  const isDevMode = process.env.NODE_ENV === 'development';
  
  // Process specific error types
  let processedError = { ...err, message: err.message };
  
  if (err.code === 11000) processedError = errorHandlers.handleDuplicateFields(err);
  if (err.name === 'ValidationError') processedError = errorHandlers.handleValidationError(err);
  if (err.name === 'JsonWebTokenError') processedError = errorHandlers.handleJWTError();
  if (err.name === 'TokenExpiredError') processedError = errorHandlers.handleJWTExpiredError();
  
  sendErrorResponse(processedError, res, isDevMode);
};

module.exports = globalErrorHandler;
module.exports.APIError = APIError; 