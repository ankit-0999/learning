const express = require('express');
const { 
  getPublishedCourses, 
  getPublishedCourseById 
} = require('../controllers/course.controller');
const { idValidation, paginationValidation, validate } = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes for courses
router.get('/published', paginationValidation, validate, getPublishedCourses);
router.get('/:id', idValidation, validate, getPublishedCourseById);

module.exports = router; 