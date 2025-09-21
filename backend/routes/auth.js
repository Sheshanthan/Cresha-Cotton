const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: '123'
};

// Hardcoded shop owner credentials
const OWNER_CREDENTIALS = {
  email: 'owner@gmail.com',
  password: '123'
};

// Common login route for all users
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // First check if it's admin login
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const token = jwt.sign(
        { email: ADMIN_CREDENTIALS.email, role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          email: ADMIN_CREDENTIALS.email,
          role: 'admin'
        }
      });
    }

    // Check if it's shop owner login
    if (email === OWNER_CREDENTIALS.email && password === OWNER_CREDENTIALS.password) {
      const token = jwt.sign(
        { email: OWNER_CREDENTIALS.email, role: 'owner' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Shop owner login successful',
        token,
        user: {
          email: OWNER_CREDENTIALS.email,
          role: 'owner'
        }
      });
    }

    // Check for regular user login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email, 
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Verify token route
router.get('/verify', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
});

module.exports = router; 