import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './ChatRooms.css'

const ChatRooms = () => {
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [anonymousId, setAnonymousId] = useState('')
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    fetchRooms()
    const newSocket = io(API_BASE_URL)
    setSocket(newSocket)

    newSocket.on('receive-message', (data) => {
      setMessages(prev => [...prev, data])
    })

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    if (selectedRoom && socket) {
      socket.emit('join-room', selectedRoom._id)
      fetchRoomMessages(selectedRoom._id)
    }
  }, [selectedRoom, socket])

  useEffect(() => {
    if (!anonymousId) {
      setAnonymousId('anon_' + Math.random().toString(36).substr(2, 9))
    }
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chatrooms`)
      setRooms(response.data)
      if (response.data.length > 0 && !selectedRoom) {
        setSelectedRoom(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const fetchRoomMessages = async (roomId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chatrooms/${roomId}`)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom) return

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chatrooms/${selectedRoom._id}/messages`, {
        message: messageText,
        anonymousId
      })

      if (socket) {
        socket.emit('send-message', {
          roomId: selectedRoom._id,
          message: messageText,
          anonymousId
        })
      }

      setMessages(prev => [...prev, response.data.message])
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="chatrooms-page">
      <div className="container">
        <div className="chatrooms-header">
          <h1>Anonymous Chat Rooms</h1>
          <p>Connect with others worldwide. Your identity stays completely hidden.</p>
        </div>

        <div className="chatrooms-container">
          <div className="rooms-sidebar">
            <h3>Available Rooms</h3>
            <div className="rooms-list">
              {rooms.map(room => (
                <div
                  key={room._id}
                  className={`room-item ${selectedRoom?._id === room._id ? 'active' : ''}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="room-name">{room.name}</div>
                  <div className="room-category">{room.category}</div>
                  {room.description && (
                    <div className="room-description">{room.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="chat-area">
            {selectedRoom ? (
              <>
                <div className="chat-header">
                  <h2>{selectedRoom.name}</h2>
                  <span className="room-badge">{selectedRoom.category}</span>
                </div>

                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <div className="empty-chat">
                      <p>No messages yet. Be the first to start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className="chat-message">
                        <div className="message-author">
                          Anonymous {msg.anonymousId?.substr(5, 4)}
                        </div>
                        <div className="message-text">{msg.message}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="chat-input">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message (anonymous)..."
                  />
                  <button type="submit">Send</button>
                </form>
              </>
            ) : (
              <div className="no-room-selected">
                <p>Select a room to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatRooms

