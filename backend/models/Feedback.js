const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  feedback: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
feedbackSchema.index({ userId: 1, submittedAt: -1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
