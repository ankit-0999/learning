const User = require('../models/user.model');
const Course = require('../models/course.model');
const Announcement = require('../models/announcement.model');
const Assignment = require('../models/assignment.model');
const Quiz = require('../models/quiz.model');
const { APIError } = require('../utils/errorHandler');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Get users
    const users = await User.find(filter)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken')
      .populate('enrolledCourses', 'title description');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/admin/users
 * @access  Private (Admin only)
 */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department } = req.body;

    // Create update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (department) updateFields.department = department;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all courses
 * @route   GET /api/admin/courses
 * @access  Private (Admin only)
 */
exports.getAllCourses = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Get courses
    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

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
    next(error);
  }
};

/**
 * @desc    Create announcement
 * @route   POST /api/admin/announcements
 * @access  Private (Admin only)
 */
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, target, course, isImportant } = req.body;

    // Create announcement
    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user._id,
      target,
      course,
      isImportant,
    });

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate reports
 * @route   GET /api/admin/reports
 * @access  Private (Admin only)
 */
exports.generateReports = async (req, res, next) => {
  try {
    const { type } = req.query;

    // Different report types
    switch (type) {
      case 'user-stats':
        // User statistics
        const userStats = await User.aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 },
            },
          },
        ]);

        return res.status(200).json({
          success: true,
          data: userStats,
        });

      case 'course-enrollment':
        // Course enrollment statistics
        const courseEnrollment = await Course.aggregate([
          {
            $project: {
              title: 1,
              studentCount: { $size: '$enrolledStudents' },
            },
          },
          { $sort: { studentCount: -1 } },
        ]);

        return res.status(200).json({
          success: true,
          data: courseEnrollment,
        });

      case 'assignment-stats':
        // Assignment submission statistics
        const assignmentStats = await Assignment.aggregate([
          { $unwind: '$submissions' },
          {
            $group: {
              _id: {
                assignment: '$_id',
                title: '$title',
                course: '$course',
              },
              totalSubmissions: { $sum: 1 },
              avgGrade: { $avg: '$submissions.grade.marks' },
              pendingGrading: {
                $sum: { $cond: [{ $eq: ['$submissions.status', 'submitted'] }, 1, 0] },
              },
            },
          },
        ]);

        return res.status(200).json({
          success: true,
          data: assignmentStats,
        });

      case 'quiz-stats':
        // Quiz performance statistics
        const quizStats = await Quiz.aggregate([
          { $unwind: '$submissions' },
          {
            $group: {
              _id: {
                quiz: '$_id',
                title: '$title',
                course: '$course',
              },
              totalAttempts: { $sum: 1 },
              avgScore: { $avg: '$submissions.score' },
              avgPercentage: { $avg: '$submissions.percentage' },
            },
          },
        ]);

        return res.status(200).json({
          success: true,
          data: quizStats,
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type',
        });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a course and assign faculty
 * @route   POST /api/admin/courses
 * @access  Private (Admin only)
 */
exports.createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructor,
      category,
      duration,
      level,
      isPublished,
    } = req.body;

    // Verify that the instructor exists and is a faculty member
    const facultyUser = await User.findById(instructor);
    
    if (!facultyUser) {
      throw new APIError('Instructor not found', 404);
    }
    
    if (facultyUser.role !== 'faculty') {
      throw new APIError('Selected instructor must be a faculty member', 400);
    }

    // Create course
    const course = await Course.create({
      title,
      description,
      instructor,
      category,
      duration,
      level,
      // Explicitly set isPublished, default to false if not provided
      isPublished: isPublished === 'true' || isPublished === true ? true : false,
      // Add thumbnail if uploaded
      thumbnail: req.file ? `/uploads/${req.file.filename}` : '',
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a course
 * @route   PUT /api/admin/courses/:id
 * @access  Private (Admin only)
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructor,
      category,
      duration,
      level,
      isPublished,
    } = req.body;

    // Find course
    let course = await Course.findById(req.params.id);

    if (!course) {
      throw new APIError('Course not found', 404);
    }

    // If changing instructor, verify that the new instructor is a faculty member
    if (instructor && instructor !== course.instructor.toString()) {
      const facultyUser = await User.findById(instructor);
      
      if (!facultyUser) {
        throw new APIError('Instructor not found', 404);
      }
      
      if (facultyUser.role !== 'faculty') {
        throw new APIError('Selected instructor must be a faculty member', 400);
      }
    }

    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (instructor) updateFields.instructor = instructor;
    if (category) updateFields.category = category;
    if (duration) updateFields.duration = duration;
    if (level) updateFields.level = level;
    if (isPublished !== undefined) updateFields.isPublished = isPublished;

    // Add thumbnail if uploaded
    if (req.file) {
      updateFields.thumbnail = `/uploads/${req.file.filename}`;
    }

    // Update course
    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/admin/courses/:id
 * @access  Private (Admin only)
 */
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email');

    if (!course) {
      throw new APIError('Course not found', 404);
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/admin/courses/:id
 * @access  Private (Admin only)
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      throw new APIError('Course not found', 404);
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all faculty members
 * @route   GET /api/admin/faculty
 * @access  Private (Admin only)
 */
exports.getFacultyMembers = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter for faculty only
    const filter = { role: 'faculty' };
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Get faculty users
    const faculty = await User.find(filter)
      .select('name email profilePicture department')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    // Get total count for pagination
    const totalFaculty = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: faculty.length,
      totalPages: Math.ceil(totalFaculty / limit),
      currentPage: page,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

// Get all faculty (also needed for chat)
exports.getAllFaculty = async (req, res, next) => {
  try {
    const faculty = await User.find({ role: 'faculty' })
      .select('name email profilePicture role')
      .sort({ name: 1 });
    
    res.status(200).json({ 
      success: true, 
      count: faculty.length,
      data: faculty 
    });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
};

// Get all students (also needed for chat)
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email profilePicture role')
      .sort({ name: 1 });
    
    res.status(200).json({ 
      success: true, 
      count: students.length,
      data: students 
    });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
}; 