const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Protected admin route
router.get('/dashboard', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard accessed successfully',
    user: req.user
  });
});

module.exports = router; 