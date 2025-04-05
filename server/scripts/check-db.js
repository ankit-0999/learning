const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/course.model');

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

const checkCourses = async () => {
  try {
    await connectDB();
    
    // Get count of all courses
    const count = await Course.countDocuments();
    console.log(`Total courses in database: ${count}`);
    
    // Get count of published courses
    const publishedCount = await Course.countDocuments({ isPublished: true });
    console.log(`Published courses: ${publishedCount}`);
    
    // Get all courses
    const courses = await Course.find().select('title isPublished');
    console.log('All courses:');
    courses.forEach(course => {
      console.log(`- ${course.title} (Published: ${course.isPublished})`);
    });
    
    // Make all courses published if they aren't already
    if (publishedCount < count) {
      console.log('Publishing all unpublished courses...');
      await Course.updateMany({ isPublished: false }, { isPublished: true });
      console.log('All courses are now published');
    }
    
    // Exit
    mongoose.disconnect();
    console.log('Database check completed');
    process.exit(0);
  } catch (error) {
    console.error('Error checking courses:', error);
    process.exit(1);
  }
};

// Run the function
checkCourses(); 