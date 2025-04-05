const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getFacultyMembers,
  createAnnouncement,
  generateReports
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  registerValidation,
  idValidation,
  courseValidation,
  announcementValidation,
  paginationValidation,
  validate
} = require('../middleware/validation.middleware');
const { uploadFields, uploadSingle } = require('../middleware/upload.middleware');

const router = express.Router();

// Apply middleware to all routes
router.use(protect, authorize('admin'));

// User management routes
router.route('/users')
  .get(paginationValidation, validate, getAllUsers)
  .post(registerValidation, validate, createUser);

router.route('/users/:id')
  .get(idValidation, validate, getUserById)
  .put(idValidation, validate, updateUser)
  .delete(idValidation, validate, deleteUser);

// Faculty listing route
router.get('/faculty', paginationValidation, validate, getFacultyMembers);

// Course management routes
router.route('/courses')
  .get(paginationValidation, validate, getAllCourses)
  .post(courseValidation, validate, uploadSingle('thumbnail'), createCourse);

router.route('/courses/:id')
  .get(idValidation, validate, getCourseById)
  .put(idValidation, validate, uploadSingle('thumbnail'), updateCourse)
  .delete(idValidation, validate, deleteCourse);

// Announcement routes
router.post(
  '/announcements',
  announcementValidation,
  validate,
  uploadFields([{ name: 'attachments', maxCount: 5 }]),
  createAnnouncement
);

// Reports
router.get('/reports', generateReports);

module.exports = router; 