import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🧠</span>
            <span className="brand-text">Soulace</span>
          </Link>

          <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
            <NavLink to="/" className="nav-link" end>Home</NavLink>
            <NavLink to="/doctors" className="nav-link">Doctors</NavLink>
            <NavLink to="/chatbot" className="nav-link">AI Chat</NavLink>
            <NavLink to="/chatrooms" className="nav-link">Chat Rooms</NavLink>
            <NavLink to="/store" className="nav-link">Store</NavLink>

            {isAuthenticated ? (
              <>
                {user?.role === 'patient' && (
                  <>
                    <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                    <NavLink to="/appointments" className="nav-link">Appointments</NavLink>
                  </>
                )}
                {user?.role === 'doctor' && (
                  <NavLink to="/doctor/dashboard" className="nav-link">Doctor Dashboard</NavLink>
                )}
                {user?.role === 'admin' && (
                  <NavLink to="/admin" className="nav-link">Admin</NavLink>
                )}
                <div className="user-menu">
                  <span className="user-name">{user?.name}</span>
                  <button onClick={handleLogout} className="btn btn-secondary btn-small">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary btn-small">Login</Link>
                <Link to="/register" className="btn btn-primary btn-small">Sign Up</Link>
              </div>
            )}
          </div>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

