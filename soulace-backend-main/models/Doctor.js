const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for backward compatibility
  },
  name: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  qualifications: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  fee: {
    type: Number,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);

