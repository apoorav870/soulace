import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './DoctorDashboard.css'

const DoctorDashboard = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming') // upcoming, all, pending

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/appointments/doctor`)
      setAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        status: action === 'accept' ? 'confirmed' : 'rejected'
      })
      fetchAppointments() // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating appointment')
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDateTime = (datetime) => {
    const date = new Date(datetime)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'pending') return apt.status === 'pending'
    if (filter === 'upcoming') {
      return (apt.status === 'pending' || apt.status === 'confirmed') && 
             new Date(apt.datetime) >= new Date()
    }
    return true
  })

  if (loading) {
    return (
      <div className="doctor-dashboard">
        <div className="container">
          <div className="loading">Loading appointments...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="doctor-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Doctor Dashboard</h1>
          <p>Welcome back, Dr. {user?.name}</p>
        </div>

        <div className="dashboard-filters">
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({appointments.filter(a => a.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Appointments
          </button>
        </div>

        <div className="appointments-list">
          {filteredAppointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments found.</p>
            </div>
          ) : (
            filteredAppointments.map(appointment => {
              const { date, time } = formatDateTime(appointment.datetime)
              const patientName = appointment.patientId?.name || 'Unknown Patient'
              const initials = getInitials(patientName)

              return (
                <div key={appointment._id} className="appointment-card card">
                  <div className="appointment-header">
                    <div className="patient-avatar">
                      {initials}
                    </div>
                    <div className="patient-info">
                      <h3>{patientName}</h3>
                      <p className="patient-email">{appointment.patientId?.email}</p>
                    </div>
                    <span className={`status-badge status-${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Date:</span>
                      <span className="detail-value">{date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">🕐 Time:</span>
                      <span className="detail-value">{time}</span>
                    </div>
                    {appointment.notes && (
                      <div className="detail-item">
                        <span className="detail-label">📝 Notes:</span>
                        <span className="detail-value">{appointment.notes}</span>
                      </div>
                    )}
                  </div>

                  {appointment.status === 'pending' && (
                    <div className="appointment-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAppointmentAction(appointment._id, 'accept')}
                      >
                        ✓ Accept
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleAppointmentAction(appointment._id, 'reject')}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard

