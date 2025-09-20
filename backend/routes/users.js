const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id, { password: 0 });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// Update current user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const update = { name, email, phone };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(
      req.user.id || req.user._id,
      { $set: update },
      { new: true, projection: { password: 0 } }
    );
    res.json({ success: true, user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Admin: list all users
router.get('/', auth, async (req, res) => {
  try {
    // Allow admin or owner viewing; if you want strict admin only, check role here
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Admin: update user by id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const update = { name, email, phone, role };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

// Admin: delete user by id
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

module.exports = router; 