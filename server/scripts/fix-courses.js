const mongoose = require('mongoose');
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

const fixCourses = async () => {
  try {
    await connectDB();
    
    // Find a faculty member for setting instructor
    const faculty = await User.findOne({ role: 'faculty' });
    if (!faculty) {
      console.log('No faculty found. Creating a default faculty user...');
      const newFaculty = await User.create({
        name: 'Default Faculty',
        email: 'faculty@example.com',
        password: 'faculty123',
        role: 'faculty'
      });
      console.log('Default faculty created:', newFaculty.email);
    }
    
    const facultyId = faculty ? faculty._id : (await User.findOne({ role: 'faculty' }))._id;
    
    // Get all courses
    const courses = await Course.find();
    console.log(`Found ${courses.length} courses. Fixing them...`);
    
    // Fix each course
    for (const course of courses) {
      // Ensure course is published
      course.isPublished = true;
      
      // Ensure instructor is set
      if (!course.instructor) {
        course.instructor = facultyId;
        console.log(`Set instructor for course: ${course.title}`);
      }
      
      // Ensure category is set
      if (!course.category) {
        course.category = 'Computer Science';
        console.log(`Set category for course: ${course.title}`);
      }
      
      // Ensure level is set
      if (!course.level) {
        course.level = 'Beginner';
        console.log(`Set level for course: ${course.title}`);
      }
      
      // Ensure duration is set
      if (!course.duration) {
        course.duration = 8; // 8 weeks
        console.log(`Set duration for course: ${course.title}`);
      }
      
      // Ensure empty arrays are initialized
      if (!course.enrolledStudents) {
        course.enrolledStudents = [];
        console.log(`Initialized enrolledStudents for course: ${course.title}`);
      }
      
      if (!course.lectures) {
        course.lectures = [];
        console.log(`Initialized lectures for course: ${course.title}`);
      }
      
      // If no lectures, add a sample lecture
      if (course.lectures.length === 0) {
        course.lectures.push({
          title: 'Introduction',
          description: 'Introduction to the course',
          contentType: 'text',
          content: 'Welcome to the course!',
          duration: 30,
          order: 1
        });
        console.log(`Added sample lecture to course: ${course.title}`);
      }
      
      // Save the course
      await course.save();
      console.log(`Fixed course: ${course.title}`);
    }
    
    console.log('All courses fixed successfully');
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing courses:', error);
    process.exit(1);
  }
};

// Run the function
fixCourses(); 