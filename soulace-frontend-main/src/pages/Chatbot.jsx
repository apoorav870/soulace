import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './Chatbot.css'

const Chatbot = () => {
  const { isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (currentConversationId) {
      fetchChatHistory(currentConversationId)
    } else {
      setMessages([])
    }
  }, [currentConversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/conversations`)
      setConversations(response.data)
      // If there are conversations and none is selected, select the first one
      if (response.data.length > 0 && !currentConversationId) {
        setCurrentConversationId(response.data[0]._id)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchChatHistory = async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat?conversationId=${conversationId}`)
      const formattedMessages = response.data.flatMap(msg => [
        { text: msg.message, isUser: true, timestamp: msg.timestamp },
        { text: msg.response, isUser: false, timestamp: msg.timestamp }
      ])
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error fetching chat history:', error)
    }
  }

  const handleNewChat = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat/conversations`, { title: 'New Chat' })
      setConversations(prev => [response.data, ...prev])
      setCurrentConversationId(response.data._id)
      setMessages([])
    } catch (error) {
      console.error('Error creating new conversation:', error)
    }
  }

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/chat/conversations/${conversationId}`)
      setConversations(prev => prev.filter(conv => conv._id !== conversationId))
      if (currentConversationId === conversationId) {
        if (conversations.length > 1) {
          const remaining = conversations.filter(conv => conv._id !== conversationId)
          setCurrentConversationId(remaining[0]?._id || null)
        } else {
          setCurrentConversationId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
    // If no conversation exists, create one
    let conversationId = currentConversationId
    if (!conversationId) {
      try {
        const newConvResponse = await axios.post(`${API_BASE_URL}/api/chat/conversations`, { title: userMessage.substring(0, 50) })
        conversationId = newConvResponse.data._id
        setCurrentConversationId(conversationId)
        setConversations(prev => [newConvResponse.data, ...prev])
      } catch (error) {
        console.error('Error creating conversation:', error)
        return
      }
    }

    setMessages(prev => [...prev, { text: userMessage, isUser: true, timestamp: new Date() }])
    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, { 
        message: userMessage,
        conversationId 
      })
      setMessages(prev => [...prev, { 
        text: response.data.response, 
        isUser: false, 
        timestamp: response.data.timestamp 
      }])
      // Refresh conversations to update last message
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.', 
        isUser: false, 
        timestamp: new Date() 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatbot-page">
      <div className="container">
        <div className="chatbot-header">
          <h1>AI Mental Health Assistant</h1>
          <p>Have a safe, private conversation. Get instant support and guidance.</p>
        </div>

        <div className="chatbot-layout">
          {/* Sidebar */}
          <div className={`chatbot-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <button className="new-chat-btn" onClick={handleNewChat}>
                <span>+</span> New Chat
              </button>
              <button 
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? '←' : '→'}
              </button>
            </div>
            <div className="conversations-list">
              {conversations.map(conv => (
                <div
                  key={conv._id}
                  className={`conversation-item ${currentConversationId === conv._id ? 'active' : ''}`}
                  onClick={() => setCurrentConversationId(conv._id)}
                >
                  <div className="conversation-content">
                    <div className="conversation-title">{conv.title}</div>
                    {conv.lastMessage && (
                      <div className="conversation-preview">{conv.lastMessage.substring(0, 50)}...</div>
                    )}
                  </div>
                  <button
                    className="delete-conversation"
                    onClick={(e) => handleDeleteConversation(conv._id, e)}
                    aria-label="Delete conversation"
                  >
                    ×
                  </button>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="no-conversations">
                  <p>No conversations yet. Start a new chat!</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chatbot-container">
            <div className="chatbot-messages">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <div className="welcome-icon">🤖</div>
                  <h3>Hello! I'm your AI mental health assistant.</h3>
                  <p>I'm here to provide support and guidance. Feel free to share what's on your mind.</p>
                  <p className="disclaimer">
                    Note: This is a general support tool. For personalized care, please consult with one of our verified doctors.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`}>
                    <div className="message-content">
                      {msg.text}
                    </div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="message ai-message">
                  <div className="message-content typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chatbot-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot

