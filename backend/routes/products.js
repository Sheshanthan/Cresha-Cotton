const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['male', 'female', 'unisex'],
    default: 'unisex'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make it optional since admin/owner might not have a User record
  },
  createdByEmail: {
    type: String,
    required: true // This will store the email of who created the product
  }
}, {
  timestamps: true
});

// Drop any existing indexes that might conflict
productSchema.on('index', function(error) {
  if (error) {
    console.log('Index error:', error);
  }
});

module.exports = mongoose.model('Product', productSchema);
