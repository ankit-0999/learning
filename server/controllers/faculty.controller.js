const Course = require('../models/course.model');
const Assignment = require('../models/assignment.model');
const Quiz = require('../models/quiz.model');
const User = require('../models/user.model');
const Announcement = require('../models/announcement.model');
const { APIError } = require('../utils/errorHandler');

/**
 * @desc    Get faculty courses
 * @route   GET /api/faculty/courses
 * @access  Private (Faculty only)
 */
exports.getFacultyCourses = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get courses where the faculty is the instructor
    const courses = await Course.find({ instructor: req.user._id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const totalCourses = await Course.countDocuments({ instructor: req.user._id });

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
 * @desc    Get a specific course by ID
 * @route   GET /api/faculty/courses/:id
 * @access  Private (Faculty only)
 */
exports.getCourseById = async (req, res, next) => {
  try {
    // Find the course by ID
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'name email')
      .populate('instructor', 'name email');

    // Check if course exists
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is course instructor
    if (course.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course',
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

/**
 * @desc    Create a course
 * @route   POST /api/faculty/courses
 * @access  Private (Faculty only)
 */
exports.createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      duration,
      level,
    } = req.body;

    // Create course
    const course = await Course.create({
      title,
      description,
      instructor: req.user._id,
      category,
      duration,
      level,
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
 * @route   PUT /api/faculty/courses/:id
 * @access  Private (Faculty only)
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      duration,
      level,
      isPublished,
    } = req.body;

    // Find course and check if faculty is the instructor
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
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
 * @desc    Add lecture to course
 * @route   POST /api/faculty/courses/:id/lectures
 * @access  Private (Faculty only)
 */
exports.addLecture = async (req, res, next) => {
  try {
    const { title, description, content, duration, order } = req.body;

    // Find course
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    // Create lecture object
    const lecture = {
      title,
      description,
      content,
      duration,
      order: order || course.lectures.length + 1,
    };

    // Add file URLs if uploaded
    if (req.files) {
      if (req.files.video) {
        lecture.videoUrl = `/uploads/${req.files.video[0].filename}`;
      }
      if (req.files.pdf) {
        lecture.pdfUrl = `/uploads/${req.files.pdf[0].filename}`;
      }
    }

    // Add lecture to course
    course.lectures.push(lecture);
    await course.save();

    res.status(201).json({
      success: true,
      data: course.lectures[course.lectures.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete lecture from course
 * @route   DELETE /api/faculty/courses/:id/lectures/:lectureId
 * @access  Private (Faculty only)
 */
exports.deleteLecture = async (req, res, next) => {
  try {
    // Find course
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    // Find lecture index
    const lectureIndex = course.lectures.findIndex(
      lecture => lecture._id.toString() === req.params.lectureId
    );

    if (lectureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    // Remove lecture
    course.lectures.splice(lectureIndex, 1);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all assignments created by faculty
 * @route   GET /api/faculty/assignments
 * @access  Private (Faculty only)
 */
exports.getFacultyAssignments = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get assignments created by this faculty member
    const assignments = await Assignment.find({ createdBy: req.user._id })
      .populate('course', 'title code')
      .populate('submissions.student', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const totalAssignments = await Assignment.countDocuments({ createdBy: req.user._id });

    res.status(200).json({
      success: true,
      count: assignments.length,
      totalPages: Math.ceil(totalAssignments / limit),
      currentPage: page,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create assignment
 * @route   POST /api/faculty/assignments
 * @access  Private (Faculty only)
 */
exports.createAssignment = async (req, res, next) => {
  try {
    const { title, description, course, dueDate, totalMarks } = req.body;

    // Verify the course exists and faculty is the instructor
    const courseExists = await Course.findById(course);
    
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is course instructor
    if (courseExists.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create assignments for this course',
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      title,
      description,
      course,
      dueDate,
      totalMarks,
      createdBy: req.user._id,
      // Add attachments if uploaded
      attachments: req.files
        ? req.files.map((file) => ({
            filename: file.originalname,
            path: `/uploads/${file.filename}`,
            mimetype: file.mimetype,
          }))
        : [],
    });

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get assignment by ID
 * @route   GET /api/faculty/assignments/:id
 * @access  Private (Faculty only)
 */
exports.getAssignmentById = async (req, res, next) => {
  try {
    // Find assignment by ID
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code')
      .populate('submissions.student', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if user is the creator of the assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this assignment',
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student submissions for an assignment
 * @route   GET /api/faculty/assignments/:id/submissions
 * @access  Private (Faculty only)
 */
exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    // Find assignment
    const assignment = await Assignment.findById(req.params.id)
      .populate({
        path: 'submissions.student',
        select: 'name email',
      })
      .populate('course', 'title');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if user is the creator of the assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these submissions',
      });
    }

    res.status(200).json({
      success: true,
      count: assignment.submissions.length,
      data: assignment.submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Grade assignment submission
 * @route   POST /api/faculty/assignments/:id/grade/:submissionId
 * @access  Private (Faculty only)
 */
exports.gradeAssignment = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;
    const assignmentId = req.params.id;
    const submissionId = req.params.submissionId;

    if (!assignmentId || !submissionId) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID and submission ID are required',
      });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if user is the creator of the assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade this assignment',
      });
    }

    // Find submission
    const submission = assignment.submissions.id(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Update submission with grade
    submission.grade = {
      marks,
      feedback,
      gradedBy: req.user._id,
      gradedAt: Date.now(),
    };
    submission.status = 'graded';

    await assignment.save();

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create quiz
 * @route   POST /api/faculty/quizzes
 * @access  Private (Faculty only)
 */
exports.createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      description,
      course,
      timeLimit,
      dueDate,
      totalMarks,
      questions,
      allowReview,
      shuffleQuestions,
    } = req.body;

    // Verify the course exists and faculty is the instructor
    const courseExists = await Course.findById(course);
    
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is course instructor
    if (courseExists.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create quizzes for this course',
      });
    }

    // Create quiz
    const quiz = await Quiz.create({
      title,
      description,
      course,
      timeLimit,
      dueDate,
      totalMarks,
      questions,
      allowReview,
      shuffleQuestions,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quiz submissions
 * @route   GET /api/faculty/quizzes/:id/submissions
 * @access  Private (Faculty only)
 */
exports.getQuizSubmissions = async (req, res, next) => {
  try {
    // Find quiz
    const quiz = await Quiz.findById(req.params.id)
      .populate({
        path: 'submissions.student',
        select: 'name email',
      })
      .populate('course', 'title');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if user is the creator of the quiz
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these submissions',
      });
    }

    res.status(200).json({
      success: true,
      count: quiz.submissions.length,
      data: quiz.submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send notification to enrolled students
 * @route   POST /api/faculty/notifications
 * @access  Private (Faculty only)
 */
exports.sendNotification = async (req, res, next) => {
  try {
    const { title, content, course } = req.body;

    // Verify the course exists and faculty is the instructor
    const courseExists = await Course.findById(course);
    
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is course instructor
    if (courseExists.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send notifications for this course',
      });
    }

    // Create announcement for course students
    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user._id,
      target: 'course',
      course,
    });

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// Get all faculty (for chat feature)
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

/**
 * @desc    Delete assignment by ID
 * @route   DELETE /api/faculty/assignments/:id
 * @access  Private (Faculty only)
 */
exports.deleteAssignment = async (req, res, next) => {
  try {
    // Find assignment by ID
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if user is the creator of the assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assignment',
      });
    }

    // Delete assignment
    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update assignment
 * @route   PUT /api/faculty/assignments/:id
 * @access  Private (Faculty only)
 */
exports.updateAssignment = async (req, res, next) => {
  try {
    // Find assignment by ID
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if user is the creator of the assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment',
      });
    }

    // Update basic fields
    const { title, description, course, dueDate, totalMarks, isPublished } = req.body;
    
    // Only update fields that are provided
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (course) {
      // Verify the course exists and faculty is the instructor
      const courseExists = await Course.findById(course);
      
      if (!courseExists) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Check if user is course instructor
      if (courseExists.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create assignments for this course',
        });
      }
      
      assignment.course = course;
    }
    if (dueDate) assignment.dueDate = dueDate;
    if (totalMarks) assignment.totalMarks = totalMarks;
    if (isPublished !== undefined) assignment.isPublished = isPublished === 'true';

    // Add new attachments if uploaded
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map((file) => ({
        filename: file.originalname,
        path: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
      }));
      
      // Add to existing attachments
      assignment.attachments = [...assignment.attachments, ...newAttachments];
    }

    // Save updated assignment
    assignment = await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}; 