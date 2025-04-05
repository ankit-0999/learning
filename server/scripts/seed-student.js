const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();

// Student credentials
const STUDENT_NAME = 'Test Student';
const STUDENT_EMAIL = 'student@example.com';
const STUDENT_PASSWORD = 'student123';

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

const seedStudent = async () => {
  try {
    await connectDB();

    // Check if student user already exists
    const studentExists = await User.findOne({ email: STUDENT_EMAIL });
    
    if (studentExists) {
      console.log('Student user already exists:', studentExists.email);
      // Ensure password is updated for testing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(STUDENT_PASSWORD, salt);
      
      studentExists.password = hashedPassword;
      await studentExists.save();
      
      console.log('Student password updated for testing');
      process.exit(0);
    }

    // Create student user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(STUDENT_PASSWORD, salt);
    
    const student = await User.create({
      name: STUDENT_NAME,
      email: STUDENT_EMAIL,
      password: hashedPassword,
      role: 'student',
    });

    console.log('Student user created successfully:', student.email);
    console.log('You can now log in with:');
    console.log('Email:', STUDENT_EMAIL);
    console.log('Password:', STUDENT_PASSWORD);
    process.exit(0);
  } catch (error) {
    console.error('Error creating student user:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedStudent(); 