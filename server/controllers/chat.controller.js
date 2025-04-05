const { ChatRoom, Message } = require('../models/chat.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { APIError } = require('../utils/errorHandler');

// Get all chat rooms for a user
exports.getUserChatRooms = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const chatRooms = await ChatRoom.find({ participants: userId })
      .populate({
        path: 'participants',
        select: 'name email profilePicture role'
      })
      .populate({
        path: 'lastMessage',
        select: 'content createdAt sender readBy'
      })
      .sort({ updatedAt: -1 });
    
    // For each chat room, determine if there are unread messages
    const chatRoomsWithMetadata = await Promise.all(chatRooms.map(async (room) => {
      const roomObj = room.toObject();
      
      // Count unread messages
      const unreadCount = await Message.countDocuments({
        chatRoom: room._id,
        readBy: { $ne: userId },
        sender: { $ne: userId }
      });
      
      return {
        ...roomObj,
        unreadCount
      };
    }));
    
    res.status(200).json({
      success: true,
      data: chatRoomsWithMetadata
    });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
};

// Get or create a direct chat room between two users
exports.getOrCreateDirectChat = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const currentUserId = req.user.id;
    
    // Validate that recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return next(new APIError('Recipient not found', 404));
    }
    
    // Check if a direct chat already exists between these users
    let chatRoom = await ChatRoom.findOne({
      type: 'direct',
      participants: { $all: [currentUserId, recipientId] }
    })
    .populate({
      path: 'participants',
      select: 'name email profilePicture role'
    });
    
    // If not, create a new chat room
    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        type: 'direct',
        participants: [currentUserId, recipientId]
      });
      
      // Populate participants after creation
      chatRoom = await ChatRoom.findById(chatRoom._id).populate({
        path: 'participants',
        select: 'name email profilePicture role'
      });
    }
    
    res.status(200).json({
      success: true,
      data: chatRoom
    });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
};

// Create a group chat (admin only)
exports.createGroupChat = async (req, res, next) => {
  try {
    const { name, participantIds } = req.body;
    const currentUserId = req.user.id;
    
    // Verify user is admin
    if (req.user.role !== 'admin') {
      return next(new APIError('Only admins can create group chats', 403));
    }
    
    // Validate participants exist
    const participants = await User.find({ _id: { $in: participantIds } });
    if (participants.length !== participantIds.length) {
      return next(new APIError('One or more participants not found', 404));
    }
    
    // Always include the admin who created the chat
    const allParticipantIds = [...new Set([...participantIds, currentUserId])];
    
    // Create the group chat
    const chatRoom = await ChatRoom.create({
      name,
      type: 'group',
      participants: allParticipantIds,
      admin: currentUserId
    });
    
    // Populate participants
    const populatedChatRoom = await ChatRoom.findById(chatRoom._id).populate({
      path: 'participants',
      select: 'name email profilePicture role'
    });
    
    res.status(201).json({
      success: true,
      data: populatedChatRoom
    });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
};

// Get messages for a chat room
exports.getChatMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    
    // Validate chat room exists and user is a participant
    const chatRoom = await ChatRoom.findOne({
      _id: roomId,
      participants: userId
    });
    
    if (!chatRoom) {
      return next(new APIError('Chat room not found or you are not a participant', 404));
    }
    
    // Get messages for this room
    const messages = await Message.find({ chatRoom: roomId })
      .populate({
        path: 'sender',
        select: 'name email profilePicture role'
      })
      .sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { 
        chatRoom: roomId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
};

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { content, attachment, attachmentType, attachmentName } = req.body;
    const senderId = req.user.id;
    
    // Validate chat room exists and user is a participant
    const chatRoom = await ChatRoom.findOne({
      _id: roomId,
      participants: senderId
    });
    
    if (!chatRoom) {
      return next(new APIError('Chat room not found or you are not a participant', 404));
    }
    
    // Create the message
    const message = await Message.create({
      sender: senderId,
      content,
      attachment,
      attachmentType,
      attachmentName,
      chatRoom: roomId,
      readBy: [senderId] // Sender has already read the message
    });
    
    // Update the chat room's lastMessage
    await ChatRoom.findByIdAndUpdate(roomId, { 
      lastMessage: message._id,
      updatedAt: new Date()
    });
    
    // Populate sender details
    const populatedMessage = await Message.findById(message._id).populate({
      path: 'sender',
      select: 'name email profilePicture role'
    });
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
};

// Mark a message as read
exports.markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return next(new APIError('Message not found', 404));
    }
    
    // Verify the user is a participant in this chat room
    const chatRoom = await ChatRoom.findOne({
      _id: message.chatRoom,
      participants: userId
    });
    
    if (!chatRoom) {
      return next(new APIError('You are not a participant in this chat', 403));
    }
    
    // Mark message as read if not already
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
    }
    
    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
};

// Method for socket.io to save messages to database
exports.saveMessageToDb = async (messageData) => {
  const { senderId, roomId, content, attachment, attachmentType, attachmentName } = messageData;
  
  // Create the message
  const message = await Message.create({
    sender: senderId,
    content,
    attachment,
    attachmentType,
    attachmentName,
    chatRoom: roomId,
    readBy: [senderId] // Sender has already read the message
  });
  
  // Update the chat room's lastMessage
  await ChatRoom.findByIdAndUpdate(roomId, { 
    lastMessage: message._id,
    updatedAt: new Date()
  });
  
  // Populate sender details
  const populatedMessage = await Message.findById(message._id).populate({
    path: 'sender',
    select: 'name email profilePicture role'
  });
  
  return populatedMessage;
}; 