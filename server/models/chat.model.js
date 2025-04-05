const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    attachment: {
      type: String,
      default: null
    },
    attachmentType: {
      type: String,
      enum: ['image', 'file', null],
      default: null
    },
    attachmentName: String,
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true
    }
  },
  { timestamps: true }
);

const chatRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct'
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  { timestamps: true }
);

// Add indexes for query optimization
messageSchema.index({ chatRoom: 1, createdAt: -1 });
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ admin: 1 });

const Message = mongoose.model('Message', messageSchema);
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = { Message, ChatRoom }; 