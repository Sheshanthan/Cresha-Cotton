const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Feedback model (we'll create this next)
const Feedback = require('../models/Feedback');

// POST /api/feedback - Submit feedback
router.post('/', auth, async (req, res) => {
  try {
    const { customerName, email, mobileNumber, feedback, rating } = req.body;

    // Validation
    if (!customerName || !email || !mobileNumber || !feedback || !rating) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      customerName,
      email,
      mobileNumber,
      feedback,
      rating,
      userId: req.user.id, // From auth middleware
      submittedAt: new Date()
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: newFeedback
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/feedback - Get all feedback (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const feedbacks = await Feedback.find().sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      data: feedbacks
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/feedback/public - Get public reviews (no auth required)
router.get('/public', async (req, res) => {
  try {
    // Get all reviews for debugging (temporarily remove rating filter)
    const feedbacks = await Feedback.find({})
    .sort({ submittedAt: -1 })
    .limit(10); // Limit to 10 reviews
    
    res.json({
      success: true,
      data: feedbacks
    });

  } catch (error) {
    console.error('Error fetching public feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/feedback/user/my - Get user's own feedback
router.get('/user/my', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id }).sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      data: feedbacks
    });

  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/feedback/:id - Get specific feedback (user can only get their own feedback)
router.get('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user owns this feedback or is admin
    if (feedback.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own feedback.'
      });
    }

    res.json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/feedback/:id - Update feedback (user can only update their own feedback)
router.put('/:id', auth, async (req, res) => {
  try {
    const { customerName, email, mobileNumber, feedback, rating } = req.body;

    // Validation
    if (!customerName || !email || !mobileNumber || !feedback || !rating) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Find feedback and check ownership
    const existingFeedback = await Feedback.findById(req.params.id);
    
    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user owns this feedback
    if (existingFeedback.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own feedback.'
      });
    }

    // Update feedback
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        customerName,
        email,
        mobileNumber,
        feedback,
        rating,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: updatedFeedback
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/feedback/:id - Delete feedback (user can only delete their own feedback)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find feedback and check ownership
    const existingFeedback = await Feedback.findById(req.params.id);
    
    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user owns this feedback or is admin
    if (existingFeedback.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own feedback.'
      });
    }

    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
