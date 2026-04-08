const mongoose = require('mongoose');

const chatRoomMessageSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['anxiety', 'depression', 'stress', 'general', 'support'],
    default: 'general'
  },
  messages: [chatRoomMessageSchema],
  participants: [{
    type: String // anonymous IDs
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);

