import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './Appointments.css'

const Appointments = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchAppointments()
  }, [isAuthenticated, navigate])

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/appointments`)
      setAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }


  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed'
      case 'rejected':
        return 'status-rejected'
      case 'completed':
        return 'status-completed'
      case 'cancelled':
        return 'status-cancelled'
      default:
        return 'status-pending'
    }
  }

  if (loading) {
    return (
      <div className="appointments-page">
        <div className="container">
          <div className="loading">Loading appointments...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="appointments-page">
      <div className="container">
        <div className="appointments-header">
          <h1>My Appointments</h1>
          <p>Manage your mental health consultations</p>
        </div>

        {appointments.length === 0 ? (
          <div className="no-appointments">
            <p>You don't have any appointments yet.</p>
            <a href="/doctors" className="btn btn-primary">Book Your First Appointment</a>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map(appointment => (
              <div key={appointment._id} className="appointment-card card">
                <div className="appointment-header">
                  <div>
                    <h3>
                      {appointment.doctorId?.name || 'Doctor'}
                    </h3>
                    {appointment.doctorId?.specialization && (
                      <p className="appointment-specialization">
                        {appointment.doctorId.specialization}
                      </p>
                    )}
                  </div>
                  <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="appointment-details">
                  <div className="detail-item">
                    <span className="detail-label">Date & Time:</span>
                    <span className="detail-value">
                      {new Date(appointment.datetime).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {appointment.notes && (
                    <div className="detail-item">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{appointment.notes}</span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Appointments

