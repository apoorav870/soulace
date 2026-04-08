import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import Admin from './pages/Admin'
import Chatbot from './pages/Chatbot'
import ChatRooms from './pages/ChatRooms'
import Doctors from './pages/Doctors'
import Appointments from './pages/Appointments'
import Store from './pages/Store'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/chatrooms" element={<ChatRooms />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/store" element={<Store />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

