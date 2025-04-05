const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { APIError } = require('./utils/errorHandler');
const globalErrorHandler = require('./utils/errorHandler');
const logger = require('./middleware/logger.middleware');
const chatController = require('./controllers/chat.controller');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import and use routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/faculty', require('./routes/faculty.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/chat', require('./routes/chat.routes'));

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-Learning Platform API' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  
  // Join chat rooms
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });
  
  // Leave chat rooms
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });
  
  // Listen for new messages
  socket.on('send_message', async (messageData) => {
    try {
      const savedMessage = await chatController.saveMessageToDb(messageData);
      // Broadcast to all users in the room
      io.to(messageData.chatRoom).emit('receive_message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // User typing indicator
  socket.on('typing', (data) => {
    socket.to(data.chatRoom).emit('user_typing', {
      userId: data.userId,
      username: data.username,
      isTyping: data.isTyping
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// 404 handler
app.all('*', (req, res, next) => {
  next(new APIError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elearning';

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    });
    console.log('Connected to MongoDB');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.io server running`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = { app, server, io }; 