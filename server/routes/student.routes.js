const express = require('express');
const {
  getAllCourses,
  getCourseById,
  enrollCourse,
  getCourseLectures,
  getAssignments,
  submitAssignment,
  getQuizzes,
  submitQuiz,
  getPerformance,
  getProfile,
  getAllStudents,
  getAssignmentById
} = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { idValidation, paginationValidation, validate } = require('../middleware/validation.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

const router = express.Router();

// Apply middleware to all routes
router.use(protect);

// Public route accessible to all authenticated users - needed for chat
router.get('/', getAllStudents);

// Student-only routes
router.use(authorize('student'));

// Profile route
router.get('/profile', getProfile);

// Course routes
router.get('/courses', paginationValidation, validate, getAllCourses);
router.get('/courses/:id', idValidation, validate, getCourseById);
router.post('/courses/:id/enroll', idValidation, validate, enrollCourse);
router.get('/courses/:id/lectures', idValidation, validate, getCourseLectures);

// Assignment routes
router.get('/assignments', getAssignments);
router.post(
  '/assignments/:id/submit',
  idValidation,
  validate,
  uploadMultiple('attachments', 3),
  submitAssignment
);
router.get('/assignments/:id', idValidation, validate, getAssignmentById);

// Quiz routes
router.get('/quizzes', getQuizzes);
router.post('/quizzes/:id/submit', idValidation, validate, submitQuiz);

// Performance route
router.get('/performance', getPerformance);

module.exports = router; 