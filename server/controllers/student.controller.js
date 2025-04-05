const Course = require('../models/course.model');
const User = require('../models/user.model');
const Assignment = require('../models/assignment.model');
const Quiz = require('../models/quiz.model');
const { APIError } = require('../utils/errorHandler');

/**
 * @desc    Get student profile
 * @route   GET /api/student/profile
 * @access  Private (Student only)
 */
exports.getProfile = async (req, res, next) => {
  try {
    // Find the student including enrolled courses
    const student = await User.findById(req.user._id)
      .select('-password -refreshToken')
      .populate('enrolledCourses', 'title description thumbnail');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all available courses
 * @route   GET /api/student/courses
 * @access  Private (Student only)
 */
exports.getAllCourses = async (req, res, next) => {
  try {
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

    // Get courses
    const courses = await Course.find(filter)
      .populate('instructor', 'name')
      .select('title description thumbnail category level duration avgRating')
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
 * @desc    Get course details by ID
 * @route   GET /api/student/courses/:id
 * @access  Private (Student only)
 */
exports.getCourseById = async (req, res, next) => {
  try {
    console.log(`Student requesting course ID: ${req.params.id}`);
    
    // Find course
    const course = await Course.findOne({
      _id: req.params.id,
      isPublished: true,
    })
      .populate('instructor', 'name email profilePicture')
      .populate('ratings.user', 'name profilePicture');

    if (!course) {
      console.log('Course not found');
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if student is enrolled
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    console.log(`Student enrollment status: ${isEnrolled}`);

    // Log lecture info before modification
    console.log(`Course has ${course.lectures.length} lectures`);
    if (course.lectures.length > 0) {
      console.log('First lecture sample:', {
        title: course.lectures[0].title,
        contentType: course.lectures[0].contentType,
        hasContent: !!course.lectures[0].content
      });
    }

    // If not enrolled, don't show lecture content
    let processedLectures = [];
    if (!isEnrolled) {
      console.log('Student not enrolled - restricting lecture content');
      processedLectures = course.lectures.map(lecture => ({
        ...lecture.toObject(),
        content: undefined,
        videoUrl: undefined,
        pdfUrl: undefined,
      }));
    } else {
      console.log('Student enrolled - providing full lecture content');
      processedLectures = course.lectures.map(lecture => lecture.toObject());
    }

    // Create a new object with course data
    const courseData = {
      ...course.toObject(),
      lectures: processedLectures,
      isEnrolled,
    };

    console.log(`Returning course with ${courseData.lectures.length} lectures`);
    
    res.status(200).json({
      success: true,
      data: courseData,
    });
  } catch (error) {
    console.error('Error in getCourseById:', error);
    next(error);
  }
};

/**
 * @desc    Enroll in a course
 * @route   POST /api/student/courses/:id/enroll
 * @access  Private (Student only)
 */
exports.enrollCourse = async (req, res, next) => {
  try {
    // Find course
    const course = await Course.findOne({
      _id: req.params.id,
      isPublished: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
      });
    }

    // Add student to course
    course.enrolledStudents.push(req.user._id);
    await course.save();

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { enrolledCourses: course._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in the course',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get course lectures
 * @route   GET /api/student/courses/:id/lectures
 * @access  Private (Student only)
 */
exports.getCourseLectures = async (req, res, next) => {
  try {
    // Find course
    const course = await Course.findById(req.params.id).select('lectures instructor enrolledStudents');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if student is enrolled
    if (!course.enrolledStudents.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to access lectures',
      });
    }

    // Sort lectures by order
    const lectures = course.lectures.sort((a, b) => a.order - b.order);

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all assignments for enrolled courses
 * @route   GET /api/student/assignments
 * @access  Private (Student only)
 */
exports.getAssignments = async (req, res, next) => {
  try {
    console.log("Student assignments request from:", req.user._id);
    
    // Get user's enrolled courses
    const user = await User.findById(req.user._id).select('enrolledCourses');
    console.log("Student enrolled courses:", user.enrolledCourses);

    // Check if any assignments exist at all
    const allAssignments = await Assignment.countDocuments();
    console.log("Total assignments in database:", allAssignments);
    
    // Check if any assignments exist for this course regardless of published status
    const allCourseAssignments = await Assignment.find({
      course: { $in: user.enrolledCourses }
    });
    console.log("All assignments for student's courses (including unpublished):", allCourseAssignments.length);
    
    if (allCourseAssignments.length > 0) {
      console.log("Sample course assignment:", {
        id: allCourseAssignments[0]._id,
        title: allCourseAssignments[0].title,
        isPublished: allCourseAssignments[0].isPublished,
        course: allCourseAssignments[0].course
      });
    }

    // Find assignments for enrolled courses
    const assignments = await Assignment.find({
      course: { $in: user.enrolledCourses },
      isPublished: true,
    })
      .populate('course', 'title code')
      .populate('createdBy', 'name email role')
      .select('-submissions.attachments');
    
    console.log("Found published assignments count:", assignments.length);
    if (assignments.length > 0) {
      console.log("Sample assignment:", {
        id: assignments[0]._id,
        title: assignments[0].title,
        course: assignments[0].course.title,
        createdBy: assignments[0].createdBy
      });
    }

    // For each assignment, add submission status for current student
    const assignmentsWithStatus = assignments.map(assignment => {
      const studentSubmission = assignment.submissions.find(
        submission => submission.student.toString() === req.user._id.toString()
      );

      return {
        ...assignment.toObject(),
        submissions: assignment.submissions.map(sub => ({
          ...sub,
          student: sub.student.toString() === req.user._id.toString() ? sub.student : undefined
        })), // Keep submissions but anonymize other students
        studentSubmission: studentSubmission || null,
      };
    });

    res.status(200).json({
      success: true,
      count: assignmentsWithStatus.length,
      data: assignmentsWithStatus,
    });
  } catch (error) {
    console.error("Error in getAssignments:", error);
    next(error);
  }
};

/**
 * @desc    Submit assignment
 * @route   POST /api/student/assignments/:id/submit
 * @access  Private (Student only)
 */
exports.submitAssignment = async (req, res, next) => {
  try {
    const { comment } = req.body;

    // Find assignment
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if student is enrolled in the course
    const user = await User.findById(req.user._id).select('enrolledCourses');
    if (!user.enrolledCourses.includes(assignment.course)) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to submit an assignment',
      });
    }

    // Check if assignment due date has passed
    if (new Date(assignment.dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Assignment due date has passed',
      });
    }

    // Check if student already submitted
    const existingSubmission = assignment.submissions.find(
      submission => submission.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment',
      });
    }

    // Create submission object
    const submission = {
      student: req.user._id,
      comment,
      status: 'submitted',
      attachments: req.files
        ? req.files.map(file => ({
            filename: file.originalname,
            path: `/uploads/${file.filename}`,
            mimetype: file.mimetype,
          }))
        : [],
    };

    // Add submission to assignment
    assignment.submissions.push(submission);
    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all quizzes for enrolled courses
 * @route   GET /api/student/quizzes
 * @access  Private (Student only)
 */
exports.getQuizzes = async (req, res, next) => {
  try {
    // Get user's enrolled courses
    const user = await User.findById(req.user._id).select('enrolledCourses');

    // Find quizzes for enrolled courses
    const quizzes = await Quiz.find({
      course: { $in: user.enrolledCourses },
      isPublished: true,
    })
      .populate('course', 'title')
      .select('-questions.options.isCorrect -submissions');

    // For each quiz, add submission status for current student
    const quizzesWithStatus = await Promise.all(quizzes.map(async quiz => {
      const quizDoc = await Quiz.findById(quiz._id).select('submissions');
      
      const studentSubmission = quizDoc.submissions.find(
        submission => submission.student.toString() === req.user._id.toString()
      );

      const status = studentSubmission ? studentSubmission.status : 'pending';
      const score = studentSubmission ? studentSubmission.score : 0;
      const percentage = studentSubmission ? studentSubmission.percentage : 0;

      return {
        ...quiz.toObject(),
        submissionStatus: status,
        score,
        percentage,
      };
    }));

    res.status(200).json({
      success: true,
      count: quizzesWithStatus.length,
      data: quizzesWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit quiz answers
 * @route   POST /api/student/quizzes/:id/submit
 * @access  Private (Student only)
 */
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;

    // Find quiz
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Check if student is enrolled in the course
    const user = await User.findById(req.user._id).select('enrolledCourses');
    if (!user.enrolledCourses.includes(quiz.course)) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to submit a quiz',
      });
    }

    // Check if quiz due date has passed
    if (new Date(quiz.dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Quiz due date has passed',
      });
    }

    // Check if student already submitted
    const existingSubmission = quiz.submissions.find(
      submission => submission.student.toString() === req.user._id.toString()
    );

    if (existingSubmission && existingSubmission.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this quiz',
      });
    }

    // Calculate score
    let score = 0;
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      const isCorrect = question.options[answer.selectedOption].isCorrect;
      
      if (isCorrect) {
        score += question.marks;
      }
      
      return {
        ...answer,
        isCorrect,
      };
    });

    // Calculate percentage
    const totalMarks = quiz.questions.reduce((total, q) => total + q.marks, 0);
    const percentage = (score / totalMarks) * 100;

    // Create submission object
    const submission = {
      student: req.user._id,
      answers: gradedAnswers,
      score,
      percentage,
      timeTaken,
      status: 'completed',
      submissionDate: Date.now(),
    };

    // Add or update submission
    if (existingSubmission) {
      // Update existing submission
      Object.assign(existingSubmission, submission);
    } else {
      // Add new submission
      quiz.submissions.push(submission);
    }
    
    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score,
        percentage,
        totalMarks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student performance across all courses
 * @route   GET /api/student/performance
 * @access  Private (Student only)
 */
exports.getPerformance = async (req, res, next) => {
  try {
    // Get user enrolled courses
    const user = await User.findById(req.user._id)
      .select('enrolledCourses')
      .populate('enrolledCourses', 'title');

    // Get assignment performance
    const assignments = await Assignment.find({
      course: { $in: user.enrolledCourses },
      'submissions.student': req.user._id,
    })
      .populate('course', 'title')
      .select('title totalMarks submissions');

    // Get quiz performance
    const quizzes = await Quiz.find({
      course: { $in: user.enrolledCourses },
      'submissions.student': req.user._id,
    })
      .populate('course', 'title')
      .select('title totalMarks submissions');

    // Process assignment data
    const assignmentData = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        s => s.student.toString() === req.user._id.toString()
      );

      return {
        id: assignment._id,
        title: assignment.title,
        course: assignment.course,
        totalMarks: assignment.totalMarks,
        obtainedMarks: submission.grade ? submission.grade.marks : 0,
        feedback: submission.grade ? submission.grade.feedback : '',
        status: submission.status,
        submissionDate: submission.submissionDate,
        type: 'assignment',
      };
    });

    // Process quiz data
    const quizData = quizzes.map(quiz => {
      const submission = quiz.submissions.find(
        s => s.student.toString() === req.user._id.toString()
      );

      return {
        id: quiz._id,
        title: quiz.title,
        course: quiz.course,
        totalMarks: quiz.totalMarks,
        obtainedMarks: submission.score,
        percentage: submission.percentage,
        status: submission.status,
        submissionDate: submission.submissionDate,
        type: 'quiz',
      };
    });

    // Calculate overall performance
    const allItems = [...assignmentData, ...quizData];
    
    // Course-wise performance
    const coursePerformance = user.enrolledCourses.map(course => {
      const courseItems = allItems.filter(
        item => item.course._id.toString() === course._id.toString()
      );
      
      const totalMarks = courseItems.reduce((sum, item) => sum + item.totalMarks, 0);
      const obtainedMarks = courseItems.reduce((sum, item) => sum + item.obtainedMarks, 0);
      
      return {
        course: {
          id: course._id,
          title: course.title,
        },
        totalItems: courseItems.length,
        completedItems: courseItems.filter(item => 
          item.status === 'graded' || item.status === 'completed'
        ).length,
        totalMarks,
        obtainedMarks,
        percentage: totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0,
      };
    });

    // Overall performance
    const overallPerformance = {
      totalCourses: user.enrolledCourses.length,
      totalAssignments: assignmentData.length,
      completedAssignments: assignmentData.filter(a => a.status === 'graded').length,
      totalQuizzes: quizData.length,
      completedQuizzes: quizData.filter(q => q.status === 'completed').length,
      overallPercentage: 
        allItems.length > 0 
          ? (allItems.reduce((sum, item) => sum + item.obtainedMarks, 0) / 
             allItems.reduce((sum, item) => sum + item.totalMarks, 0)) * 100
          : 0,
    };

    res.status(200).json({
      success: true,
      data: {
        assignments: assignmentData,
        quizzes: quizData,
        coursePerformance,
        overallPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get assignment by ID
 * @route   GET /api/student/assignments/:id
 * @access  Private (Student only)
 */
exports.getAssignmentById = async (req, res, next) => {
  try {
    // Find the assignment
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code')
      .select('-submissions.attachments');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Verify student is enrolled in the course
    const user = await User.findById(req.user._id).select('enrolledCourses');
    if (!user.enrolledCourses.includes(assignment.course._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    // Check if assignment is published
    if (!assignment.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'This assignment is not available',
      });
    }

    // Get student's own submission for this assignment
    const studentSubmission = assignment.submissions.find(
      submission => submission.student.toString() === req.user._id.toString()
    );

    // Return assignment with only student's submission
    const assignmentData = {
      ...assignment.toObject(),
      submissions: undefined, // Remove all submissions
      studentSubmission: studentSubmission || null,
    };

    res.status(200).json({
      success: true,
      data: assignmentData,
    });
  } catch (error) {
    next(error);
  }
};

// Get all students (for chat feature)
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