import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './Doctors.css'

const Doctors = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [appointmentForm, setAppointmentForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    consultationType: 'video',
    notes: ''
  })

  // Helper function to check if user can book appointments
  // Handles both "patient" and legacy "user" roles
  const canBookAppointment = () => {
    if (!isAuthenticated || !user) return false
    const userRole = user.role?.toLowerCase()
    // Allow both "patient" and legacy "user" roles
    return userRole === 'patient' || userRole === 'user'
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/doctors`)
      setDoctors(response.data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Check if user can book appointments (patient or legacy user role)
    if (!canBookAppointment()) {
      alert('Only patients can book appointments')
      return
    }

    try {
      // Combine date and time into datetime
      const datetime = new Date(`${appointmentForm.appointmentDate}T${appointmentForm.appointmentTime}`)
      
      // Send the doctor's unique id
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        doctorId: selectedDoctor._id,
        datetime: datetime.toISOString(),
        notes: appointmentForm.notes || ''
      })
      alert('Appointment request submitted successfully! The doctor will review and confirm.')
      setSelectedDoctor(null)
      setAppointmentForm({
        appointmentDate: '',
        appointmentTime: '',
        consultationType: 'video',
        notes: ''
      })
    } catch (error) {
      alert(error.response?.data?.message || 'Error booking appointment')
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i}>⭐</span>)
    }
    if (hasHalfStar) {
      stars.push(<span key="half">⭐</span>)
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} style={{ opacity: 0.3 }}>⭐</span>)
    }
    return stars
  }

  if (loading) {
    return (
      <div className="doctors-page">
        <div className="container">
          <div className="loading">Loading doctors...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="doctors-page">
      <div className="container">
        <div className="doctors-header">
          <h1>Verified Mental Health Professionals</h1>
          <p>Book appointments with trusted, verified doctors</p>
        </div>

        <div className="doctors-grid">
          {doctors.map(doctor => (
            <div key={doctor._id} className="doctor-card card">
              <div className="doctor-header">
                <div className="doctor-avatar">
                  {doctor.name?.charAt(0).toUpperCase() || 'D'}
                </div>
                <div className="doctor-info">
                  <h3>{doctor.name || 'Doctor'}</h3>
                  <p className="doctor-specialization">{doctor.specialization}</p>
                </div>
              </div>

              <div className="doctor-details">
                <p className="doctor-qualifications">
                  {doctor.qualifications || 'Qualified Professional'}
                </p>
                <p className="doctor-experience">
                  {doctor.experience} years of experience
                </p>
                {doctor.availability && (
                  <p className="doctor-availability">
                    <strong>Available:</strong> {doctor.availability}
                  </p>
                )}
              </div>

              <div className="doctor-rating">
                <div className="rating-stars">
                  {renderStars(doctor.rating || 0)}
                </div>
                <span className="rating-text">
                  {doctor.rating?.toFixed(1) || '0.0'} ⭐
                </span>
              </div>

              <div className="doctor-fee">
                <span className="fee-label">Consultation Fee:</span>
                <span className="fee-amount">₹{doctor.fee}</span>
              </div>

              {canBookAppointment() ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  Book Appointment
                </button>
              ) : !isAuthenticated ? (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Login to Book
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {doctors.length === 0 && (
          <div className="no-doctors">
            <p>No doctors available at the moment. Check back soon!</p>
          </div>
        )}

        {selectedDoctor && (
          <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <h2>Book Appointment with {selectedDoctor.name}</h2>
              <form onSubmit={handleBookAppointment}>
                <div className="input-group">
                  <label>Appointment Date</label>
                  <input
                    type="date"
                    value={appointmentForm.appointmentDate}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="input-group">
                  <label>Appointment Time</label>
                  <input
                    type="time"
                    value={appointmentForm.appointmentTime}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentTime: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={appointmentForm.notes}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                    placeholder="Any specific concerns or topics you'd like to discuss..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedDoctor(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Doctors

