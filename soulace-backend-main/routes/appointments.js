const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

// @route   POST /api/appointments
// @desc    Create new appointment (patients only)
// @access  Private (Patient only, or legacy "user" role)
router.post('/', auth, async (req, res) => {
  // Check if user is a patient or legacy user role
  const userRole = req.user.role?.toLowerCase()
  if (userRole !== 'patient' && userRole !== 'user') {
    return res.status(403).json({ 
      message: 'Only patients can book appointments' 
    })
  }
  try {
    const { doctorId, datetime, notes } = req.body;

    if (!doctorId || !datetime) {
      return res.status(400).json({ message: 'doctorId and datetime are required' });
    }

    // 1. Find doctor profile
    const doctorProfile = await Doctor.findById(doctorId);

    if (!doctorProfile || !doctorProfile.userId) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // 2. Find doctor user account
    const doctorUser = await User.findById(doctorProfile.userId);

    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }



    // Check if datetime is in the future
    const appointmentDateTime = new Date(datetime);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({ message: 'Appointment must be scheduled for a future date and time' });
    }

    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId: doctorProfile.userId,
      datetime: appointmentDateTime,
      notes: notes || '',
      status: 'pending'
    });

    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments
// @desc    Get patient's appointments
// @access  Private (Patient only, or legacy "user" role)
router.get('/', auth, async (req, res) => {
  // Check if user is a patient or legacy user role
  const userRole = req.user.role?.toLowerCase()
  if (userRole !== 'patient' && userRole !== 'user') {
    return res.status(403).json({ 
      message: 'Access denied. Only patients can view appointments.' 
    })
  }
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name email')
      .sort({ datetime: -1 });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/doctor
// @desc    Get doctor's appointments
// @access  Private (Doctor only)
router.get('/doctor', auth, authorize('doctor'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.id })
      .populate('patientId', 'name email')
      .sort({ datetime: 1 }); // Sort by datetime ascending (upcoming first)

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/appointments/:id
// @desc    Update appointment status (doctor can confirm/reject)
// @access  Private (Doctor only)
router.patch('/:id', auth, authorize('doctor'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status must be either "confirmed" or "rejected"' 
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify the appointment belongs to this doctor
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'You can only update your own appointments' 
      });
    }

    appointment.status = status;
    await appointment.save();
    
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email');

    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

