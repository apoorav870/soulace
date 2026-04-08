const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// All admin routes require admin role
router.use(auth);
router.use(authorize('admin'));

// @route   POST /api/admin/doctors
// @desc    Create a doctor account (admin only)
// @access  Private (Admin only)
router.post('/doctors', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('qualifications').trim().notEmpty().withMessage('Qualifications are required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('fee').isInt({ min: 0 }).withMessage('Fee must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      email, 
      password, 
      phone, 
      specialization, 
      qualifications, 
      experience, 
      fee, 
      availability,
      bio 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create doctor user account
    const doctorUser = new User({
      name,
      email,
      password,
      phone,
      role: 'doctor',
      isVerified: true
    });

    await doctorUser.save();

    // Create doctor profile linked to user
    const doctorProfile = new Doctor({
      userId: doctorUser._id,
      name,
      specialization,
      qualifications,
      experience,
      fee,
      availability: availability || 'Mon-Sat 10AM-7PM',
      bio,
      verified: true,
      rating: 0
    });

    await doctorProfile.save();

    res.status(201).json({
      message: 'Doctor account created successfully',
      user: {
        id: doctorUser._id,
        name: doctorUser.name,
        email: doctorUser.email,
        role: doctorUser.role
      },
      doctor: doctorProfile
    });
  } catch (error) {
    console.error('Error creating doctor account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

