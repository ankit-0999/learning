const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Course = require('../models/course.model');
const User = require('../models/user.model');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Find existing users
const getUsers = async () => {
  try {
    // Find at least one faculty and one student user
    const faculty = await User.findOne({ role: 'faculty' });
    const student = await User.findOne({ role: 'student' });
    
    if (!faculty || !student) {
      console.log('No faculty or student users found. Creating them...');
      return await createUsers();
    }
    
    return { faculty, student };
  } catch (error) {
    console.error('Error finding users:', error);
    process.exit(1);
  }
};

// Create users if none exist
const createUsers = async () => {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create a faculty user
    const faculty = await User.create({
      name: 'Faculty User',
      email: 'faculty@example.com',
      password: hashedPassword,
      role: 'faculty'
    });
    
    // Create a student user
    const student = await User.create({
      name: 'Student User',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'student'
    });
    
    console.log('Created faculty and student users');
    return { faculty, student };
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

// Seed courses
const seedCourses = async (faculty, student) => {
  try {
    // Check if we already have courses
    const courseCount = await Course.countDocuments();
    
    if (courseCount > 0) {
      console.log(`${courseCount} courses already exist. Skipping course creation.`);
      return;
    }
    
    console.log('No courses found. Creating sample courses...');
    
    // Sample courses data
    const courses = [
      {
        title: 'Introduction to Programming',
        description: 'Learn the basics of programming with JavaScript. This course covers fundamental concepts such as variables, control structures, functions, and basic algorithms.',
        instructor: faculty._id,
        thumbnail: 'https://placehold.co/600x400?text=Programming',
        category: 'Computer Science',
        level: 'Beginner',
        duration: 8, // 8 weeks
        enrolledStudents: [student._id],
        isPublished: true,
        lectures: [
          {
            title: 'Getting Started with JavaScript',
            description: 'Introduction to JavaScript programming language',
            content: 'https://example.com/video1.mp4',
            contentType: 'video',
            duration: 45, // 45 minutes
            order: 1
          },
          {
            title: 'Variables and Data Types',
            description: 'Learn about variables and different data types in JavaScript',
            content: 'https://example.com/video2.mp4',
            contentType: 'video',
            duration: 50,
            order: 2
          },
          {
            title: 'Control Structures',
            description: 'Conditional statements and loops in JavaScript',
            content: 'https://example.com/document1.pdf',
            contentType: 'document',
            duration: 60,
            order: 3
          }
        ]
      },
      {
        title: 'Web Development Fundamentals',
        description: 'Master the basics of web development with HTML, CSS, and JavaScript. Build interactive websites from scratch.',
        instructor: faculty._id,
        thumbnail: 'https://placehold.co/600x400?text=WebDev',
        category: 'Computer Science',
        level: 'Beginner',
        duration: 10, // 10 weeks
        isPublished: true,
        lectures: [
          {
            title: 'HTML Basics',
            description: 'Introduction to HTML structure and elements',
            content: 'https://example.com/video3.mp4',
            contentType: 'video',
            duration: 55,
            order: 1
          },
          {
            title: 'CSS Styling',
            description: 'Learn how to style web pages with CSS',
            content: 'https://example.com/video4.mp4',
            contentType: 'video',
            duration: 60,
            order: 2
          }
        ]
      },
      {
        title: 'Data Science with Python',
        description: 'An introduction to data analysis, visualization, and machine learning using Python libraries like Pandas, NumPy, and Scikit-learn.',
        instructor: faculty._id,
        thumbnail: 'https://placehold.co/600x400?text=DataScience',
        category: 'Computer Science',
        level: 'Intermediate',
        duration: 12, // 12 weeks
        isPublished: true,
        lectures: [
          {
            title: 'Python for Data Science',
            description: 'Introduction to Python for data analysis',
            content: 'https://example.com/video5.mp4',
            contentType: 'video',
            duration: 65,
            order: 1
          },
          {
            title: 'Working with Pandas',
            description: 'Data manipulation with Pandas library',
            content: 'https://example.com/video6.mp4',
            contentType: 'video',
            duration: 70,
            order: 2
          }
        ]
      }
    ];
    
    // Insert courses
    await Course.insertMany(courses);
    console.log('Sample courses created successfully');
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    const { faculty, student } = await getUsers();
    await seedCourses(faculty, student);
    console.log('Course seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the script
main(); 