const express = require('express');
const { 
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { 
  registerValidation,
  loginValidation,
  validate
} = require('../middleware/validation.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadSingle('profilePicture'), updateProfile);

module.exports = router; 