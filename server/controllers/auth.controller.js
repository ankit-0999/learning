const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/generateToken');
const { APIError } = require('../utils/errorHandler');

/**
 * Generate tokens and create standardized authentication response
 * @param {Object} user - User document from database
 * @returns {Object} Authentication response with tokens and user data
 */
const createAuthResponse = async (user) => {
  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token in user document
  user.refreshToken = refreshToken;
  await user.save();

  // Return user data and tokens
  return {
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    },
    accessToken,
    refreshToken,
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new APIError('Email already registered', 400);
    }

    // For security, only allow students to self-register
    // Admin and faculty accounts should be created by admins only
    if (!req.user && (role === 'admin' || role === 'faculty')) {
      throw new APIError('Unauthorized to create admin or faculty accounts', 403);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: req.user && req.user.role === 'admin' ? role : 'student', // Only admins can set roles
    });

    // Generate response with tokens
    const authResponse = await createAuthResponse(user);
    res.status(201).json(authResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new APIError('Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new APIError('Invalid credentials', 401);
    }

    // Generate response with tokens
    const authResponse = await createAuthResponse(user);
    res.status(200).json(authResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new APIError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (!decoded) {
      throw new APIError('Invalid or expired refresh token', 401);
    }

    // Find user with the refresh token
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken,
    });

    if (!user) {
      throw new APIError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const authResponse = await createAuthResponse(user);
    res.status(200).json(authResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    // Clear refresh token in database
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        department: user.department,
        enrolledCourses: user.enrolledCourses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, department } = req.body;

    // Construct update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio) updateFields.bio = bio;
    if (department) updateFields.department = department;

    // Add profile picture if uploaded
    if (req.file) {
      updateFields.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
}; 