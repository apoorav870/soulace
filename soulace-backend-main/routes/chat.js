const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');
const Groq = require('groq-sdk');

// Initialize Groq client lazily so the backend can start even when the key is missing.
let groq = null;

const getGroqClient = () => {
  if (groq) return groq;
  if (!process.env.GROQ_API_KEY) return null;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
};

// Get AI response from Groq
const getAIResponse = async (message, userId, conversationId) => {
  try {
    console.log('Getting AI response for message:', message);
    const groqClient = getGroqClient();

    if (!groqClient) {
      console.warn('GROQ_API_KEY is not set. Returning fallback AI response.');
      return "I'm here to support you. I can still help with general guidance, and for personalized care, please consider booking a session with a verified mental health professional.";
    }
    
    // Get recent chat history for context from this conversation
    const recentMessages = await ChatMessage.find({ 
      userId, 
      conversationId 
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('message response');

    // Build conversation history
    const conversationHistory = [];
    
    // Add recent messages in reverse order (oldest first)
    recentMessages.reverse().forEach(msg => {
      conversationHistory.push({
        role: 'user',
        content: msg.message
      });
      conversationHistory.push({
        role: 'assistant',
        content: msg.response
      });
    });

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    console.log('Calling Groq API with model: llama-3.1-8b-instant');
    console.log('API Key present:', !!process.env.GROQ_API_KEY );

    // Call Groq API
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Fast and reliable model from Groq
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate and supportive mental health AI assistant for Soulace Platform. Your role is to provide empathetic, non-judgmental support and guidance. Always remind users that while you can provide general support, professional help from verified doctors is recommended for serious concerns. Be warm, understanding, and encouraging. Keep responses concise but helpful (2-4 sentences).'
        },
        ...conversationHistory
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    console.log('Groq API Response received:', completion ? 'Success' : 'Failed');

    if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error('Invalid completion structure:', JSON.stringify(completion, null, 2));
      throw new Error('Invalid response from Groq API');
    }

    const responseText = completion.choices[0].message.content;
    console.log('AI Response:', responseText);
    return responseText;
  } catch (error) {
    console.error('Groq API Error Details:', {
      message: error.message,
      status: error.status,
      statusCode: error.statusCode,
      code: error.code,
      response: error.response?.data || error.response,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    // Fallback response if API fails
    return "I apologize, but I'm having trouble processing your message right now. Please try again in a moment, or consider booking an appointment with one of our verified mental health professionals for immediate support.";
  }
};

// POST /api/chat/conversations — create new conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const conversation = new Conversation({
      userId: req.user.id,
      title: req.body.title || 'New Chat'
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/chat/conversations — get all conversations for user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .sort({ lastMessageTime: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/chat/conversations/:id — get single conversation
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || conversation.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/chat/conversations/:id — update conversation title
router.put('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || conversation.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (req.body.title) {
      conversation.title = req.body.title;
    }
    await conversation.save();
    res.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/chat/conversations/:id — delete conversation
router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || conversation.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    // Delete all messages in this conversation
    await ChatMessage.deleteMany({ conversationId: req.params.id });
    // Delete the conversation
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/chat — send message
router.post('/', auth, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: 'Message is required' });
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation || conversation.userId.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else {
      // Create new conversation if none provided
      conversation = new Conversation({
        userId: req.user.id,
        title: message.trim().substring(0, 50) || 'New Chat'
      });
      await conversation.save();
    }

    const aiResponse = await getAIResponse(message.trim(), req.user.id, conversation._id);

    // Save chat message
    const chatMessage = new ChatMessage({
      userId: req.user.id,
      conversationId: conversation._id,
      message: message.trim(),
      response: aiResponse,
      isAI: true
    });

    await chatMessage.save();

    // Update conversation's last message
    conversation.lastMessage = message.trim();
    conversation.lastMessageTime = new Date();
    // Update title if it's still "New Chat" and this is the first message
    if (conversation.title === 'New Chat' && message.trim().length > 0) {
      conversation.title = message.trim().substring(0, 50);
    }
    await conversation.save();

    res.json({
      message: chatMessage.message,
      response: chatMessage.response,
      timestamp: chatMessage.timestamp,
      conversationId: conversation._id
    });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/chat — get messages for a conversation
router.get('/', auth, async (req, res) => {
  try {
    const { conversationId } = req.query;
    
    if (!conversationId) {
      // Return empty array if no conversationId provided
      return res.json([]);
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await ChatMessage.find({ 
      userId: req.user.id,
      conversationId 
    })
      .sort({ timestamp: 1 });

    res.json(messages);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
