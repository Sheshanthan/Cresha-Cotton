const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');

// Initialize Stripe only if secret key is available
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const router = express.Router();

// Create payment intent for an order
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify the order belongs to the authenticated user
    if (order.userId.toString() !== req.user.id && order.userId.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order'
      });
    }

    if (stripe) {
      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.price * 100, // Stripe expects amount in cents
        currency: 'lkr',
        metadata: {
          orderId: orderId,
          customerName: order.name,
          customerEmail: order.email
        }
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret
      });
    } else {
      // Demo mode - return success without Stripe
      res.json({
        success: true,
        clientSecret: 'demo_secret_' + Date.now(),
        demo: true
      });
    }

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent'
    });
  }
});

// Confirm payment and update order
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify the order belongs to the authenticated user
    if (order.userId.toString() !== req.user.id && order.userId.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order'
      });
    }

    if (stripe && !paymentIntentId.startsWith('demo_')) {
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update order with payment information
        order.paymentStatus = 'paid';
        order.stripePaymentId = paymentIntentId;
        order.paidAt = new Date();
        await order.save();

        res.json({
          success: true,
          message: 'Payment confirmed successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment not completed'
        });
      }
    } else {
      // Demo mode - simulate successful payment
      order.paymentStatus = 'paid';
      order.stripePaymentId = paymentIntentId;
      order.paidAt = new Date();
      await order.save();

      res.json({
        success: true,
        message: 'Demo payment confirmed successfully'
      });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment'
    });
  }
});

module.exports = router; 