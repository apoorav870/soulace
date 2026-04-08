import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    appointments: 0,
    chatMessages: 0,
    activeChatRooms: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [appointmentsRes, chatRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/appointments`),
        axios.get(`${API_BASE_URL}/api/chat`)
      ])
      
      setStats({
        appointments: appointmentsRes.data.length,
        chatMessages: chatRes.data.length,
        activeChatRooms: 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's your mental health journey overview</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.appointments}</h3>
              <p>Appointments</p>
            </div>
            <Link to="/appointments" className="stat-link">View All →</Link>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <h3>{stats.chatMessages}</h3>
              <p>AI Chat Sessions</p>
            </div>
            <Link to="/chatbot" className="stat-link">Chat Now →</Link>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">🌍</div>
            <div className="stat-info">
              <h3>24/7</h3>
              <p>Support Available</p>
            </div>
            <Link to="/chatrooms" className="stat-link">Join Rooms →</Link>
          </div>
        </div>

        <div className="dashboard-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <Link to="/chatbot" className="action-card card">
              <div className="action-icon">🤖</div>
              <h3>AI Chatbot</h3>
              <p>Get instant support and guidance</p>
            </Link>

            <Link to="/doctors" className="action-card card">
              <div className="action-icon">👨‍⚕️</div>
              <h3>Find Doctors</h3>
              <p>Book an appointment with verified professionals</p>
            </Link>

            <Link to="/chatrooms" className="action-card card">
              <div className="action-icon">💬</div>
              <h3>Chat Rooms</h3>
              <p>Connect anonymously with others</p>
            </Link>

            <Link to="/store" className="action-card card">
              <div className="action-icon">📚</div>
              <h3>E-Store</h3>
              <p>Browse recommended books and audiobooks</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

