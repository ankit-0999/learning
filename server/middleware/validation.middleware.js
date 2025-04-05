const { body, validationResult, param, query } = require('express-validator');

// Middleware to check validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

// User registration validation
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isIn(['admin', 'faculty', 'student']).withMessage('Invalid role')
];

// Login validation
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
];

// Course validation
exports.courseValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Course title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Course description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Business', 'Arts', 'Other']).withMessage('Invalid category'),
  
  body('duration')
    .isNumeric().withMessage('Duration must be a number')
    .notEmpty().withMessage('Duration is required'),
  
  body('level')
    .trim()
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
    
  body('instructor')
    .optional()
    .custom((value, { req }) => {
      if (req.user && req.user.role === 'admin' && !value) {
        throw new Error('Instructor is required when creating a course as admin');
      }
      return true;
    })
    .isMongoId().withMessage('Invalid instructor ID format')
];

// Assignment validation
exports.assignmentValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Assignment title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Assignment description is required'),
  
  body('course')
    .notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Invalid course ID format'),
  
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),
  
  body('totalMarks')
    .optional()
    .isNumeric().withMessage('Total marks must be a number')
];

// Quiz validation
exports.quizValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Quiz title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Quiz description is required'),
  
  body('course')
    .notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Invalid course ID format'),
  
  body('questions')
    .isArray({ min: 1 }).withMessage('At least one question is required'),
  
  body('questions.*.question')
    .notEmpty().withMessage('Question text is required'),
  
  body('questions.*.options')
    .isArray({ min: 2 }).withMessage('At least two options are required per question'),
  
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Invalid date format')
];

// Announcement validation
exports.announcementValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Announcement title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Announcement content is required'),
  
  body('target')
    .optional()
    .isIn(['all', 'faculty', 'students', 'course']).withMessage('Invalid target audience'),
  
  body('course')
    .optional()
    .custom((value, { req }) => {
      if (req.body.target === 'course' && !value) {
        throw new Error('Course ID is required when target is set to course');
      }
      return true;
    })
    .isMongoId().withMessage('Invalid course ID format')
];

// ID parameter validation
exports.idValidation = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID format')
];

// Pagination validation
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
]; 