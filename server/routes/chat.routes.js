const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// Routes that require authentication
router.use(protect);

// Get all chat rooms for the current user
router.get('/rooms', chatController.getUserChatRooms);

// Get or create a direct chat with another user
router.get('/direct/:recipientId', chatController.getOrCreateDirectChat);

// Create a group chat (admin only)
router.post('/group', chatController.createGroupChat);

// Get messages for a specific chat room
router.get('/rooms/:roomId/messages', chatController.getChatMessages);

// Send a message to a chat room
router.post('/rooms/:roomId/messages', chatController.sendMessage);

// Mark a message as read
router.post('/messages/:messageId/read', chatController.markMessageAsRead);

module.exports = router; 