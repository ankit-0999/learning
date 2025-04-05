const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const Course = require('../models/course.model');
const Assignment = require('../models/assignment.model');
const Quiz = require('../models/quiz.model');
const Announcement = require('../models/announcement.model');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      phoneNumber: '1234567890',
      department: 'Administration',
      bio: 'System administrator for the e-learning platform.',
    });

    // Faculty users
    const facultyUsers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: hashedPassword,
        role: 'faculty',
        profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
        phoneNumber: '2345678901',
        department: 'Computer Science',
        bio: 'Professor of Computer Science with 15 years of experience in AI and Machine Learning.',
        expertise: ['Artificial Intelligence', 'Machine Learning', 'Data Science'],
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@example.com',
        password: hashedPassword,
        role: 'faculty',
        profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
        phoneNumber: '3456789012',
        department: 'Engineering',
        bio: 'Engineering professor specializing in robotics and automation.',
        expertise: ['Robotics', 'Automation', 'IoT'],
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        password: hashedPassword,
        role: 'faculty',
        profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
        phoneNumber: '4567890123',
        department: 'Business',
        bio: 'Business professor with expertise in entrepreneurship and marketing.',
        expertise: ['Entrepreneurship', 'Marketing', 'Business Strategy'],
      }
    ];

    const faculty = await User.insertMany(facultyUsers);

    // Student users
    const studentUsers = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: hashedPassword,
        role: 'student',
        profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg',
        phoneNumber: '5678901234',
        department: 'Computer Science',
        bio: 'Third-year student majoring in Computer Science.',
        enrollmentYear: 2021,
        studentId: 'CS2021001',
      },
      {
        name: 'Emma Wilson',
        email: 'emma.wilson@example.com',
        password: hashedPassword,
        role: 'student',
        profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg',
        phoneNumber: '6789012345',
        department: 'Engineering',
        bio: 'Fourth-year Mechanical Engineering student.',
        enrollmentYear: 2020,
        studentId: 'ME2020002',
      },
      {
        name: 'David Lee',
        email: 'david.lee@example.com',
        password: hashedPassword,
        role: 'student',
        profilePicture: 'https://randomuser.me/api/portraits/men/7.jpg',
        phoneNumber: '7890123456',
        department: 'Business',
        bio: 'Second-year Business Administration student.',
        enrollmentYear: 2022,
        studentId: 'BA2022003',
      },
      {
        name: 'Sophia Garcia',
        email: 'sophia.garcia@example.com',
        password: hashedPassword,
        role: 'student',
        profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg',
        phoneNumber: '8901234567',
        department: 'Computer Science',
        bio: 'First-year Computer Science student focusing on cybersecurity.',
        enrollmentYear: 2023,
        studentId: 'CS2023004',
      },
      {
        name: 'Alex Brown',
        email: 'alex.brown@example.com',
        password: hashedPassword,
        role: 'student',
        profilePicture: 'https://randomuser.me/api/portraits/men/9.jpg',
        phoneNumber: '9012345678',
        department: 'Engineering',
        bio: 'Third-year Electrical Engineering student.',
        enrollmentYear: 2021,
        studentId: 'EE2021005',
      }
    ];

    const students = await User.insertMany(studentUsers);

    console.log('Users seeded successfully');
    return { admin, faculty, students };
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Seed Courses
const seedCourses = async (faculty, students) => {
  try {
    // Clear existing courses
    await Course.deleteMany({});

    const courses = [
      {
        title: 'Introduction to Machine Learning',
        code: 'CS301',
        description: 'This course provides an introduction to the field of machine learning, focusing on fundamental algorithms and their applications.',
        instructor: faculty[0]._id,
        department: 'Computer Science',
        credits: 4,
        enrolledStudents: [students[0]._id, students[3]._id, students[4]._id],
        schedule: {
          days: ['Monday', 'Wednesday'],
          startTime: '10:00 AM',
          endTime: '11:30 AM',
        },
        syllabus: 'Week 1: Introduction to ML\nWeek 2: Supervised Learning\nWeek 3: Unsupervised Learning\nWeek 4: Neural Networks\nWeek 5: Deep Learning\nWeek 6: Model Evaluation\nWeek 7: Project Work\nWeek 8: Final Project Presentation',
        resources: [
          { title: 'Introduction to Machine Learning with Python', type: 'book', url: '#' },
          { title: 'ML Algorithms Cheat Sheet', type: 'document', url: '#' },
          { title: 'TensorFlow Tutorial', type: 'video', url: '#' }
        ],
      },
      {
        title: 'Robotics Engineering',
        code: 'ENG202',
        description: 'An in-depth course on robotics engineering principles, covering mechanical design, electronics, and programming for robotics applications.',
        instructor: faculty[1]._id,
        department: 'Engineering',
        credits: 4,
        enrolledStudents: [students[1]._id, students[4]._id],
        schedule: {
          days: ['Tuesday', 'Thursday'],
          startTime: '2:00 PM',
          endTime: '3:30 PM',
        },
        syllabus: 'Week 1: Introduction to Robotics\nWeek 2: Mechanical Design\nWeek 3: Electronics for Robotics\nWeek 4: Sensors and Actuators\nWeek 5: Robot Programming\nWeek 6: Robot Operating System (ROS)\nWeek 7: Project Work\nWeek 8: Final Project Demonstration',
        resources: [
          { title: 'Robotics, Vision and Control', type: 'book', url: '#' },
          { title: 'Arduino Programming Guide', type: 'document', url: '#' },
          { title: 'ROS Tutorial Series', type: 'video', url: '#' }
        ],
      },
      {
        title: 'Entrepreneurship and Innovation',
        code: 'BUS401',
        description: 'Learn about entrepreneurship principles, business model innovation, and startup strategies in this hands-on course.',
        instructor: faculty[2]._id,
        department: 'Business',
        credits: 3,
        enrolledStudents: [students[2]._id, students[3]._id],
        schedule: {
          days: ['Monday', 'Friday'],
          startTime: '1:00 PM',
          endTime: '2:30 PM',
        },
        syllabus: 'Week 1: Introduction to Entrepreneurship\nWeek 2: Identifying Business Opportunities\nWeek 3: Business Model Canvas\nWeek 4: Market Research\nWeek 5: Pitching Your Idea\nWeek 6: Funding Strategies\nWeek 7: Growth Strategies\nWeek 8: Business Plan Presentation',
        resources: [
          { title: 'The Lean Startup', type: 'book', url: '#' },
          { title: 'Business Model Canvas Template', type: 'document', url: '#' },
          { title: 'Successful Pitch Deck Examples', type: 'video', url: '#' }
        ],
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log('Courses seeded successfully');
    return createdCourses;
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

// Seed Assignments
const seedAssignments = async (courses) => {
  try {
    // Clear existing assignments
    await Assignment.deleteMany({});

    const assignments = [
      {
        title: 'Machine Learning Algorithm Implementation',
        description: 'Implement a basic linear regression algorithm from scratch and apply it to the provided dataset.',
        course: courses[0]._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        totalPoints: 100,
        submissionType: 'file',
        resources: [
          { title: 'Linear Regression Guide', type: 'document', url: '#' },
          { title: 'Dataset for Assignment', type: 'file', url: '#' }
        ],
      },
      {
        title: 'Robot Arm Control System',
        description: 'Design and implement a control system for a 3-degree-of-freedom robot arm.',
        course: courses[1]._id,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        totalPoints: 150,
        submissionType: 'file',
        resources: [
          { title: 'Robot Arm Specs', type: 'document', url: '#' },
          { title: 'Control System Examples', type: 'video', url: '#' }
        ],
      },
      {
        title: 'Business Model Canvas',
        description: 'Create a Business Model Canvas for your startup idea and prepare a 5-minute pitch.',
        course: courses[2]._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        totalPoints: 100,
        submissionType: 'file',
        resources: [
          { title: 'Business Model Canvas Template', type: 'document', url: '#' },
          { title: 'Example Pitches', type: 'video', url: '#' }
        ],
      }
    ];

    const createdAssignments = await Assignment.insertMany(assignments);
    console.log('Assignments seeded successfully');
    return createdAssignments;
  } catch (error) {
    console.error('Error seeding assignments:', error);
    process.exit(1);
  }
};

// Seed Quizzes
const seedQuizzes = async (courses) => {
  try {
    // Clear existing quizzes
    await Quiz.deleteMany({});

    const quizzes = [
      {
        title: 'Machine Learning Fundamentals Quiz',
        description: 'Test your understanding of basic machine learning concepts.',
        course: courses[0]._id,
        timeLimit: 30, // 30 minutes
        totalPoints: 50,
        questions: [
          {
            question: 'What is the difference between supervised and unsupervised learning?',
            type: 'text',
            points: 10,
          },
          {
            question: 'Which of the following is NOT a type of machine learning algorithm?',
            type: 'multipleChoice',
            options: ['Linear Regression', 'K-Means Clustering', 'Database Indexing', 'Random Forest'],
            correctAnswer: 'Database Indexing',
            points: 5,
          },
          {
            question: 'True or False: Overfitting occurs when a model learns the training data too well.',
            type: 'trueFalse',
            correctAnswer: true,
            points: 5,
          }
        ],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: 'Robotics Engineering Quiz',
        description: 'Test your knowledge of robotics fundamentals.',
        course: courses[1]._id,
        timeLimit: 45, // 45 minutes
        totalPoints: 75,
        questions: [
          {
            question: 'Explain the purpose of a PID controller in robotics.',
            type: 'text',
            points: 15,
          },
          {
            question: 'Which sensor is NOT typically used for robot navigation?',
            type: 'multipleChoice',
            options: ['Lidar', 'Ultrasonic', 'Thermistor', 'Camera'],
            correctAnswer: 'Thermistor',
            points: 10,
          },
          {
            question: 'True or False: Servo motors can be controlled to move to specific positions.',
            type: 'trueFalse',
            correctAnswer: true,
            points: 5,
          }
        ],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
      {
        title: 'Entrepreneurship Concepts Quiz',
        description: 'Test your understanding of key entrepreneurship concepts.',
        course: courses[2]._id,
        timeLimit: 30, // 30 minutes
        totalPoints: 50,
        questions: [
          {
            question: 'Describe the concept of a minimum viable product (MVP).',
            type: 'text',
            points: 10,
          },
          {
            question: 'Which of the following is NOT a common source of startup funding?',
            type: 'multipleChoice',
            options: ['Angel Investors', 'Venture Capital', 'Government Subsidies', 'Crowdfunding'],
            correctAnswer: 'Government Subsidies',
            points: 5,
          },
          {
            question: 'True or False: A good business plan guarantees business success.',
            type: 'trueFalse',
            correctAnswer: false,
            points: 5,
          }
        ],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      }
    ];

    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log('Quizzes seeded successfully');
    return createdQuizzes;
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
};

// Seed Announcements
const seedAnnouncements = async (courses, faculty) => {
  try {
    // Clear existing announcements
    await Announcement.deleteMany({});

    const announcements = [
      {
        title: 'Welcome to Introduction to Machine Learning',
        content: 'Welcome to the course! Please review the syllabus and come prepared for our first class on Monday. Looking forward to an exciting semester!',
        course: courses[0]._id,
        author: faculty[0]._id,
        priority: 'high',
      },
      {
        title: 'Assignment 1 Posted',
        content: 'The first assignment has been posted. Please check the assignment section for details. The due date is in two weeks. Feel free to ask questions during office hours.',
        course: courses[0]._id,
        author: faculty[0]._id,
        priority: 'medium',
      },
      {
        title: 'Welcome to Robotics Engineering',
        content: 'Welcome to Robotics Engineering! Our first class will focus on the fundamentals of robotics. Please bring your laptops with the required software installed.',
        course: courses[1]._id,
        author: faculty[1]._id,
        priority: 'high',
      },
      {
        title: 'Lab Equipment Access',
        content: 'Access to the robotics lab has been granted to all enrolled students. Please check your email for access instructions and safety guidelines.',
        course: courses[1]._id,
        author: faculty[1]._id,
        priority: 'medium',
      },
      {
        title: 'Welcome to Entrepreneurship and Innovation',
        content: 'Welcome to the course! We will be forming project teams during our first session. Please come prepared with some initial business ideas to discuss.',
        course: courses[2]._id,
        author: faculty[2]._id,
        priority: 'high',
      },
      {
        title: 'Guest Speaker Announcement',
        content: 'We will have a guest speaker from a successful tech startup joining us next week. Attendance is mandatory as this will be a valuable learning experience.',
        course: courses[2]._id,
        author: faculty[2]._id,
        priority: 'high',
      }
    ];

    const createdAnnouncements = await Announcement.insertMany(announcements);
    console.log('Announcements seeded successfully');
    return createdAnnouncements;
  } catch (error) {
    console.error('Error seeding announcements:', error);
    process.exit(1);
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    // Seed data in sequence
    const { admin, faculty, students } = await seedUsers();
    const courses = await seedCourses(faculty, students);
    await seedAssignments(courses);
    await seedQuizzes(courses);
    await seedAnnouncements(courses, faculty);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 