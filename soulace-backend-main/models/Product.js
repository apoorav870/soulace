const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['book', 'audiobook'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  audioUrl: {
    type: String // For audiobooks
  },
  pdfUrl: {
    type: String // For books
  },
  recommendedBy: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  }],
  category: {
    type: String,
    enum: ['self-help', 'therapy', 'meditation', 'anxiety', 'depression', 'general'],
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);

