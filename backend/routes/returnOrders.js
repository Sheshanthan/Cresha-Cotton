const express = require('express');
const ReturnOrder = require('../models/ReturnOrder');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const router = express.Router();

// Test endpoint to check if the route is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Return orders route is working',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to list all return orders
router.get('/debug/all', auth, async (req, res) => {
  try {
    console.log('Debug request from user:', req.user.id || req.user._id);
    const allReturns = await ReturnOrder.find().populate('userId', 'name email');
    console.log('All return orders in database:', allReturns.length);
    
    res.json({
      success: true,
      count: allReturns.length,
      returnOrders: allReturns.map(ro => ({
        id: ro._id,
        userId: ro.userId._id || ro.userId,
        customerName: ro.customerName,
        status: ro.status
      }))
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new return order
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received request to create return order');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id || req.user._id);
    
    const { orderNumber, customerName, customerPhone, reasonForReturn } = req.body;

    // Validate required fields
    if (!orderNumber || !customerName || !customerPhone || !reasonForReturn) {
      console.log('Missing required fields:', { orderNumber, customerName, customerPhone, reasonForReturn });
      return res.status(400).json({
        success: false,
        message: 'Order number, customer name, phone, and reason for return are required'
      });
    }

    // Check if the order exists and belongs to the user
    console.log('Looking for order with ID:', orderNumber);
    console.log('User ID:', req.user.id || req.user._id);
    
    const order = await Order.findOne({ 
      _id: orderNumber,
      userId: req.user.id || req.user._id 
    });
    
    console.log('Found order:', order);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to you'
      });
    }

    // Check if the order is in delivered status
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Return orders can only be created for delivered orders'
      });
    }

    // Check if a return order already exists for this order
    console.log('Checking for existing return order with orderId:', order._id);
    const existingReturn = await ReturnOrder.findOne({ orderId: order._id });
    console.log('Existing return order found:', existingReturn);
    
    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: 'A return order already exists for this order'
      });
    }

    // Create the return order
    console.log('Creating return order with data:', {
      orderId: order._id,
      orderNumber: orderNumber,
      userId: req.user.id || req.user._id,
      customerName,
      customerPhone,
      reasonForReturn
    });
    
    const returnOrder = new ReturnOrder({
      orderId: order._id,
      orderNumber: orderNumber, // Set the orderNumber field
      userId: req.user.id || req.user._id,
      customerName,
      customerPhone,
      reasonForReturn
    });

    console.log('Return order object created, saving to database...');
    console.log('Return order object to save:', returnOrder);
    
    try {
      await returnOrder.save();
      console.log('Return order saved successfully:', returnOrder);
    } catch (saveError) {
      console.error('Error saving return order:', saveError);
      console.error('Save error details:', {
        code: saveError.code,
        message: saveError.message,
        keyPattern: saveError.keyPattern,
        keyValue: saveError.keyValue
      });
      throw saveError;
    }

    res.status(201).json({
      success: true,
      message: 'Return order created successfully',
      returnOrder
    });

  } catch (error) {
    console.error('Error creating return order:', error);
    console.error('Request body:', req.body);
    console.error('User ID:', req.user.id || req.user._id);
    res.status(500).json({
      success: false,
      message: 'Error creating return order',
      error: error.message
    });
  }
});

// Get all return orders for the authenticated user
router.get('/my-returns', auth, async (req, res) => {
  try {
    console.log('Fetching return orders for user:', req.user.id || req.user._id);
    const returnOrders = await ReturnOrder.find({ 
      userId: req.user.id || req.user._id 
    })
    .populate('orderId', 'name description status orderDate')
    .sort({ returnDate: -1 });

    console.log('Found return orders:', returnOrders.length);
    res.json({
      success: true,
      returnOrders
    });

  } catch (error) {
    console.error('Error fetching user return orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching return orders'
    });
  }
});

// Get all return orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Admin request to fetch all return orders from user:', req.user.id || req.user._id);
    // Check if user is admin or owner
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const returnOrders = await ReturnOrder.find()
      .populate('orderId', 'name description status orderDate')
      .populate('userId', 'name email')
      .sort({ returnDate: -1 });

    console.log('Admin found return orders:', returnOrders.length);
    res.json({
      success: true,
      returnOrders
    });

  } catch (error) {
    console.error('Error fetching all return orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching return orders'
    });
  }
});

// Update return order status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    console.log('Admin status update request for return order:', req.params.id);
    // Check if user is admin or owner
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const returnOrder = await ReturnOrder.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        adminNotes: adminNotes || ''
      },
      { new: true }
    ).populate('orderId', 'name description status orderDate')
     .populate('userId', 'name email');

    if (!returnOrder) {
      return res.status(404).json({
        success: false,
        message: 'Return order not found'
      });
    }

    console.log('Return order status updated successfully:', returnOrder._id);
    res.json({
      success: true,
      message: 'Return order status updated successfully',
      returnOrder
    });

  } catch (error) {
    console.error('Error updating return order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating return order status'
    });
  }
});

// Get a specific return order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Fetching return order by ID:', req.params.id);
    console.log('Request from user:', req.user.id || req.user._id);
    console.log('User role:', req.user.role);
    
    const returnOrder = await ReturnOrder.findById(req.params.id)
      .populate('orderId', 'name description status orderDate')
      .populate('userId', 'name email');

    console.log('Found return order:', returnOrder ? returnOrder._id : 'NOT FOUND');
    if (returnOrder) {
      console.log('Return order owner:', returnOrder.userId._id || returnOrder.userId);
      console.log('Requesting user:', req.user.id || req.user._id);
      console.log('Ownership check:', returnOrder.userId.toString() === (req.user.id || req.user._id).toString());
    }

    if (!returnOrder) {
      console.log('Return order not found in database');
      return res.status(404).json({
        success: false,
        message: 'Return order not found'
      });
    }

    // Check if the user owns this return order or is admin
    const returnOrderUserId = returnOrder.userId._id || returnOrder.userId;
    const requestingUserId = req.user.id || req.user._id;
    
    console.log('Ownership check details:');
    console.log('Return order userId:', returnOrderUserId);
    console.log('Requesting user ID:', requestingUserId);
    console.log('User role:', req.user.role);
    console.log('Direct comparison:', returnOrderUserId.toString() === requestingUserId.toString());
    
    if (returnOrderUserId.toString() !== requestingUserId.toString() && 
        req.user.role !== 'admin' && req.user.role !== 'owner') {
      console.log('Access denied - user does not own this return order and is not admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own return orders.'
      });
    }

    console.log('Return order access granted, sending data');
    res.json({
      success: true,
      returnOrder
    });

  } catch (error) {
    console.error('Error fetching return order:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error fetching return order',
      error: error.message
    });
  }
});

// Update a return order
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Received request to update return order:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id || req.user._id);
    
    const { orderNumber, customerName, customerPhone, reasonForReturn } = req.body;

    // Validate required fields
    if (!orderNumber || !customerName || !customerPhone || !reasonForReturn) {
      return res.status(400).json({
        success: false,
        message: 'Order number, customer name, phone, and reason for return are required'
      });
    }

    // Find the return order
    const returnOrder = await ReturnOrder.findById(req.params.id);
    if (!returnOrder) {
      return res.status(404).json({
        success: false,
        message: 'Return order not found'
      });
    }

    // Check if the user owns this return order
    const returnOrderUserId = returnOrder.userId._id || returnOrder.userId;
    const requestingUserId = req.user.id || req.user._id;
    
    console.log('Update ownership check:');
    console.log('Return order userId:', returnOrderUserId);
    console.log('Requesting user ID:', requestingUserId);
    console.log('Ownership match:', returnOrderUserId.toString() === requestingUserId.toString());
    
    if (returnOrderUserId.toString() !== requestingUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own return orders.'
      });
    }

    // Check if the new order exists and belongs to the user
    const order = await Order.findOne({ 
      _id: orderNumber,
      userId: req.user.id || req.user._id 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to you'
      });
    }

    // Check if the order is in delivered status
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Return orders can only be created for delivered orders'
      });
    }

    // Check if a return order already exists for this order (excluding current one)
    const existingReturn = await ReturnOrder.findOne({ 
      orderId: order._id,
      _id: { $ne: req.params.id }
    });
    
    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: 'A return order already exists for this order'
      });
    }

    // Update the return order
    const updatedReturnOrder = await ReturnOrder.findByIdAndUpdate(
      req.params.id,
      {
        orderId: order._id,
        orderNumber: orderNumber,
        customerName,
        customerPhone,
        reasonForReturn
      },
      { new: true }
    ).populate('orderId', 'name description status orderDate');

    res.json({
      success: true,
      message: 'Return order updated successfully',
      returnOrder: updatedReturnOrder
    });

  } catch (error) {
    console.error('Error updating return order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating return order',
      error: error.message
    });
  }
});

// Delete a return order
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Received request to delete return order:', req.params.id);
    console.log('User ID:', req.user.id || req.user._id);
    
    const returnOrder = await ReturnOrder.findById(req.params.id);
    if (!returnOrder) {
      return res.status(404).json({
        success: false,
        message: 'Return order not found'
      });
    }

    // Check if the user owns this return order
    const returnOrderUserId = returnOrder.userId._id || returnOrder.userId;
    const requestingUserId = req.user.id || req.user._id;
    
    console.log('Delete ownership check:');
    console.log('Return order userId:', returnOrderUserId);
    console.log('Requesting user ID:', requestingUserId);
    console.log('Ownership match:', returnOrderUserId.toString() === requestingUserId.toString());
    
    if (returnOrderUserId.toString() !== requestingUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own return orders.'
      });
    }

    await ReturnOrder.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Return order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting return order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting return order',
      error: error.message
    });
  }
});

module.exports = router;
