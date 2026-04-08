const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const auth = require('../middleware/auth');

// Generate anonymous ID
const generateAnonymousId = () => {
  return 'anon_' + Math.random().toString(36).substr(2, 9);
};

// @route   GET /api/chatrooms
// @desc    Get all chat rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(chatRooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chatrooms/:id
// @desc    Get chat room by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.id);
    
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    res.json(chatRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chatrooms
// @desc    Create new chat room
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const chatRoom = new ChatRoom({
      name,
      description,
      category: category || 'general'
    });

    await chatRoom.save();
    res.status(201).json(chatRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chatrooms/:id/messages
// @desc    Add message to chat room
// @access  Public (anonymous)
router.post('/:id/messages', async (req, res) => {
  try {
    const { message, anonymousId } = req.body;
    const chatRoom = await ChatRoom.findById(req.params.id);

    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const anonId = anonymousId || generateAnonymousId();

    chatRoom.messages.push({
      anonymousId: anonId,
      message: message.trim()
    });

    if (!chatRoom.participants.includes(anonId)) {
      chatRoom.participants.push(anonId);
    }

    await chatRoom.save();

    res.json({
      message: chatRoom.messages[chatRoom.messages.length - 1],
      anonymousId: anonId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

