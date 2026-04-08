import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './Admin.css'

const Admin = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    qualifications: '',
    experience: '',
    fee: '',
    availability: 'Mon-Sat 10AM-7PM',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setMessage({ type: '', text: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/doctors`, formData)
      setMessage({ 
        type: 'success', 
        text: `Doctor account created successfully! Email: ${response.data.user.email}` 
      })
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        qualifications: '',
        experience: '',
        fee: '',
        availability: 'Mon-Sat 10AM-7PM',
        bio: ''
      })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error creating doctor account' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>

        <div className="admin-content">
          <div className="admin-card card">
            <h2>Create Doctor Account</h2>
            <p className="admin-subtitle">
              Create a new doctor account. The doctor will be able to log in and manage appointments.
            </p>

            {message.text && (
              <div className={`admin-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="name">Doctor Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Dr. John Doe"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="doctor@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="specialization">Specialization *</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    placeholder="Clinical Psychologist"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="qualifications">Qualifications *</label>
                  <input
                    type="text"
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    required
                    placeholder="M.Phil Clinical Psychology (NIMHANS)"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="experience">Years of Experience *</label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="7"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="fee">Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    id="fee"
                    name="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="1200"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="availability">Availability</label>
                  <input
                    type="text"
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    placeholder="Mon-Sat 10AM-7PM"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Brief description about the doctor..."
                />
              </div>

              <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Doctor Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin

