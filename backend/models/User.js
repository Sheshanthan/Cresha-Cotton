const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    required: true,
    enum: [1, 2, 3], // 1: designer, 2: buyer, 3: delivery personal
    default: 1
  }
}, {
  timestamps: true
});

// Drop any existing indexes that might conflict
userSchema.on('index', function(error) {
  if (error) {
    console.log('Index error:', error);
  }
});

module.exports = mongoose.model('User', userSchema); 