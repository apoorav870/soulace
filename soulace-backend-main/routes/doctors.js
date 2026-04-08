const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/doctors
// @desc    Get all verified doctors with user IDs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ verified: true })
      .sort({ rating: -1 });
    
    // For each doctor, find the corresponding User account if userId exists
    // If no userId, try to match by email
    const doctorsWithUserIds = await Promise.all(
      doctors.map(async (doctor) => {
        let userId = null;
        if (doctor.userId) {
          userId = doctor.userId;
        } else {
          // Try to find user by email matching doctor name
          const user = await User.findOne({ 
            email: doctor.name.toLowerCase().replace(/\s+/g, '') + '@doctor.com',
            role: 'doctor'
          });
          if (!user) {
            // Try matching by name
            const userByName = await User.findOne({ 
              name: doctor.name,
              role: 'doctor'
            });
            if (userByName) userId = userByName._id;
          } else {
            userId = user._id;
          }
        }
        
        return {
          ...doctor.toObject(),
          userId: userId
        };
      })
    );
    
    res.json(doctorsWithUserIds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/doctors
// @desc    Create doctor profile
// @access  Private (Admin/Doctor role)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor profile
// @access  Private (Admin role)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

