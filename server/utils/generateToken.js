const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - The data to be stored in the token
 * @param {string} secret - The secret key to sign the token
 * @param {string|number} expiresIn - Token expiry time
 * @returns {string} JWT token
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate access token
 * @param {string} id - User ID
 * @returns {string} Access token
 */
exports.generateAccessToken = (id) => {
  return generateToken(
    { id },
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRE || '1d'
  );
};

/**
 * Generate refresh token
 * @param {string} id - User ID
 * @returns {string} Refresh token
 */
exports.generateRefreshToken = (id) => {
  return generateToken(
    { id },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRE || '7d'
  );
};

/**
 * Verify a token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key used to sign the token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
exports.verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}; 