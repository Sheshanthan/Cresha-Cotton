const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Validate phone format (basic validation)
    if (phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number'
      });
    }

    // Validate role
    const validRoles = [1, 2, 3];
    if (!validRoles.includes(parseInt(role))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: parseInt(role)
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Get all users (for admin purposes)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Get users by role
router.get('/users/role/:role', async (req, res) => {
  try {
    const role = parseInt(req.params.role);
    if (![1, 2, 3].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be 1, 2, or 3'
      });
    }

    const users = await User.find({ role }, { password: 0 });
    res.json({
      success: true,
      role,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users by role'
    });
  }
});

// Get user count by role
router.get('/users/stats', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const roleNames = { 1: 'Designer', 2: 'Buyer', 3: 'Delivery Personal' };
    const formattedStats = stats.map(stat => ({
      role: stat._id,
      roleName: roleNames[stat._id] || 'Unknown',
      count: stat.count
    }));

    res.json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats'
    });
  }
});

module.exports = router; 