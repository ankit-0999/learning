/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object|Array} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
exports.successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Success response with pagination information
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 */
exports.paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = parseInt(page, 10);
  
  const meta = {
    pagination: {
      total,
      count: data.length,
      perPage: limit,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };

  return exports.successResponse(res, 200, message, data, meta);
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array|Object} errors - Detailed validation errors
 */
exports.errorResponse = (res, statusCode = 400, message = 'Error', errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
exports.notFoundResponse = (res, message = 'Resource not found') => {
  return exports.errorResponse(res, 404, message);
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
exports.unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return exports.errorResponse(res, 401, message);
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
exports.forbiddenResponse = (res, message = 'Forbidden access') => {
  return exports.errorResponse(res, 403, message);
}; 