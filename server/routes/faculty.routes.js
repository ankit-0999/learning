const express = require('express');
const {
  getFacultyCourses,
  getCourseById,
  createCourse,
  updateCourse,
  addLecture,
  createAssignment,
  getFacultyAssignments,
  getAssignmentById,
  updateAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
  deleteAssignment,
  publishAssignment,
  createQuiz,
  getQuizSubmissions,
  sendNotification,
  deleteLecture,
  getAllFaculty
} = require('../controllers/faculty.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  courseValidation,
  assignmentValidation,
  quizValidation,
  idValidation,
  paginationValidation,
  validate
} = require('../middleware/validation.middleware');
const { uploadSingle, uploadFields, uploadMultiple } = require('../middleware/upload.middleware');

const router = express.Router();

// Apply middleware to all routes
router.use(protect);

// Public route accessible to all authenticated users - needed for chat
router.get('/', getAllFaculty);

// Faculty-only routes
router.use(authorize('faculty'));

// Course routes
router.route('/courses')
  .get(paginationValidation, validate, getFacultyCourses)
  .post(courseValidation, validate, uploadSingle('thumbnail'), createCourse);

router.route('/courses/:id')
  .get(idValidation, validate, getCourseById)
  .put(idValidation, validate, uploadSingle('thumbnail'), updateCourse);

router.route('/courses/:id/lectures')
  .post(
    idValidation, 
    validate,
    uploadFields([
      { name: 'video', maxCount: 1 },
      { name: 'pdf', maxCount: 1 }
    ]),
    addLecture
  );

// Route for managing individual lectures
router.route('/courses/:id/lectures/:lectureId')
  .delete(idValidation, validate, deleteLecture);

// Assignment routes
router.route('/assignments')
  .get(paginationValidation, validate, getFacultyAssignments)
  .post(assignmentValidation, validate, uploadMultiple('attachments'), createAssignment);

router.route('/assignments/:id')
  .get(idValidation, validate, getAssignmentById)
  .put(uploadMultiple('attachments'), updateAssignment)
  .delete(idValidation, validate, deleteAssignment);

router.route('/assignments/:id/publish')
  .put(idValidation, validate, publishAssignment);

router.route('/assignments/:id/submissions')
  .get(idValidation, validate, getAssignmentSubmissions);

router.route('/grade-assignment')
  .post(gradeAssignment);

// Quiz routes
router.route('/quizzes')
  .post(quizValidation, validate, createQuiz);

router.route('/quizzes/:id/submissions')
  .get(idValidation, validate, getQuizSubmissions);

// Notification routes
router.route('/notifications')
  .post(sendNotification);

module.exports = router; 