const Course = require('../models/course.model');
const { APIError } = require('../utils/errorHandler');

/**
 * @desc    Get all published courses
 * @route   GET /api/courses/published
 * @access  Public
 */
exports.getPublishedCourses = async (req, res, next) => {
  try {
    console.log('Fetching published courses...');
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = { isPublished: true }; // Only show published courses
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.level) {
      filter.level = req.query.level;
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    
    console.log('Using filter:', filter);

    // Count all courses in the database
    const allCourseCount = await Course.countDocuments({});
    console.log(`Total courses in database: ${allCourseCount}`);

    // If no published courses, make courses published
    if (allCourseCount > 0) {
      const publishedCount = await Course.countDocuments({ isPublished: true });
      console.log(`Published courses: ${publishedCount}`);
      
      if (publishedCount === 0) {
        console.log('No published courses found. Publishing all courses...');
        await Course.updateMany({}, { isPublished: true });
        console.log('All courses are now published');
      }
    }

    // Get courses
    const courses = await Course.find(filter)
      .populate('instructor', 'name')
      .select('title description thumbnail category level duration avgRating enrolledStudents')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    console.log(`Found ${courses.length} published courses`);

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: courses.length,
      totalPages: Math.ceil(totalCourses / limit),
      currentPage: page,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching published courses:', error);
    next(error);
  }
};

/**
 * @desc    Get published course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
exports.getPublishedCourseById = async (req, res, next) => {
  try {
    // Find course
    const course = await Course.findOne({
      _id: req.params.id,
      isPublished: true,
    })
      .populate('instructor', 'name email profilePicture')
      .select('-lectures.content'); // Exclude lecture content for unauthenticated access

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
}; 