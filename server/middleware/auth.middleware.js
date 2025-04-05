const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { APIError } = require('../utils/errorHandler');

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new APIError('Authentication required. Please login.', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new APIError('User no longer exists.', 401);
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      throw new APIError('Invalid or expired token. Please login again.', 401);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict routes based on roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new APIError('Authentication required first.', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new APIError(`Access denied. ${req.user.role} role cannot access this resource.`, 403));
    }
    
    next();
  };
}; 