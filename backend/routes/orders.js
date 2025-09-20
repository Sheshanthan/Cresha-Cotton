const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    
    const {
      name,
      email,
      contactNumber,
      deliveryLocation,
      address,
      description,
      gender,
      location
    } = req.body;

    // Validate required fields
    if (!name || !email || !contactNumber || !deliveryLocation || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, contact number, delivery location, and gender are required'
      });
    }

    // Validate location data (allow 0,0 coordinates since map is removed)
    if (!req.body.location || typeof req.body.location.lat !== 'number' || typeof req.body.location.lng !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Location data is required'
      });
    }

    // Validate unisex-specific fields
    if (gender === 'unisex') {
      if (!req.body.fabricType || !req.body.color || !req.body.fit) {
        return res.status(400).json({
          success: false,
          message: 'Fabric type, color, and fit are required for unisex clothing'
        });
      }
      
      if (!req.body.sizingType) {
        return res.status(400).json({
          success: false,
          message: 'Sizing type is required for unisex clothing'
        });
      }

      if (req.body.sizingType === 'standard' && !req.body.standardSize) {
        return res.status(400).json({
          success: false,
          message: 'Standard size is required when selecting standard sizing'
        });
      }

      if (req.body.sizingType === 'custom' && 
          (!req.body.customMeasurements?.chest || !req.body.customMeasurements?.waist || 
           !req.body.customMeasurements?.length || !req.body.customMeasurements?.shoulder)) {
        return res.status(400).json({
          success: false,
          message: 'All custom measurements are required when selecting custom sizing'
        });
      }
    }

    // Validate male-specific fields
    if (gender === 'male') {
      if (!req.body.collarStyle || !req.body.cuffType || !req.body.pocketStyle || !req.body.trouserFit || !req.body.jacketStyle || !req.body.buttonCount) {
        return res.status(400).json({
          success: false,
          message: 'All male clothing details are required (collar style, cuff type, pocket style, trouser fit, jacket style, and button count)'
        });
      }
    }

    // Validate female-specific fields
    if (gender === 'female') {
      if (!req.body.sleeveStyle || !req.body.neckline || !req.body.hemline || !req.body.dressLength || !req.body.closure) {
        return res.status(400).json({
          success: false,
          message: 'All female clothing details are required (sleeve style, neckline, hemline, dress/skirt length, and closure)'
        });
      }
    }

    // Create new order with only the fields that are provided
    const orderData = {
      userId: req.user.id || req.user._id,
      name,
      email,
      contactNumber,
      deliveryLocation,
      address: address || '',
      location,
      description: description || '',
      gender,
      price: req.body.price,
      paymentMethod: req.body.paymentMethod || 'cod'
    };

    // Add gender-specific fields only if they exist
    if (req.body.fabricType) orderData.fabricType = req.body.fabricType;
    if (req.body.color) orderData.color = req.body.color;
    if (req.body.fit) orderData.fit = req.body.fit;
    if (req.body.sizingType) orderData.sizingType = req.body.sizingType;
    if (req.body.standardSize) orderData.standardSize = req.body.standardSize;
    if (req.body.customMeasurements && Object.keys(req.body.customMeasurements).length > 0) {
      orderData.customMeasurements = req.body.customMeasurements;
    }
    if (req.body.collarStyle) orderData.collarStyle = req.body.collarStyle;
    if (req.body.cuffType) orderData.cuffType = req.body.cuffType;
    if (req.body.pocketStyle) orderData.pocketStyle = req.body.pocketStyle;
    if (req.body.trouserFit) orderData.trouserFit = req.body.trouserFit;
    if (req.body.jacketStyle) orderData.jacketStyle = req.body.jacketStyle;
    if (req.body.buttonCount) orderData.buttonCount = req.body.buttonCount;
    if (req.body.sleeveStyle) orderData.sleeveStyle = req.body.sleeveStyle;
    if (req.body.neckline) orderData.neckline = req.body.neckline;
    if (req.body.hemline) orderData.hemline = req.body.hemline;
    if (req.body.dressLength) orderData.dressLength = req.body.dressLength;
    if (req.body.closure) orderData.closure = req.body.closure;

    const order = new Order(orderData);

    const savedOrder = await order.save();
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: savedOrder
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

// Get all orders for the authenticated user
router.get('/my-orders', auth, async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user.id || req.user._id);
    
    const orders = await Order.find({ userId: req.user.id || req.user._id })
      .sort({ orderDate: -1 });

    console.log('Found orders:', orders.length);
    
    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Get all orders ready for delivery (for delivery personnel) - MUST BE BEFORE /:id route
router.get('/delivery', auth, async (req, res) => {
  try {
    // Check if user is delivery personnel (role 3)
    if (req.user.role !== 3 && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Delivery personnel privileges required.'
      });
    }

    const orders = await Order.find({ 
      status: { $in: ['ready_for_delivery', 'delivered'] }
    })
    .populate('userId', 'name email')
    .populate('designerId', 'name')
    .sort({ orderDate: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery orders'
    });
  }
});

// Get orders assigned to a specific designer - MUST BE BEFORE /:id route
router.get('/designer/:designerId', auth, async (req, res) => {
  try {
    // Check if the requesting user is the designer or admin/owner
    if (req.user.role !== 'admin' && req.user.role !== 'owner' && 
        (req.user.id || req.user._id) !== req.params.designerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own assigned orders.'
      });
    }

    const orders = await Order.find({ 
      designerId: req.params.designerId,
      status: { $in: ['in_production', 'ready_for_delivery'] }
    })
    .sort({ orderDate: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching designer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Get a specific order by ID (user can only see their own orders)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id || req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// Update order status (for admin/owner use)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// Assign designer to order (for admin/owner use)
router.patch('/:id/assign', auth, async (req, res) => {
  try {
    const { designerId, status } = req.body;

    if (!designerId) {
      return res.status(400).json({
        success: false,
        message: 'Designer ID is required'
      });
    }

    // Verify the designer exists and has role 1 (designer)
    const designer = await User.findById(designerId);
    if (!designer || designer.role !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid designer ID'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          designerId: designerId,
          status: status || 'in_production'
        }
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({
      success: true,
      message: 'Designer assigned successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error assigning designer' });
  }
});

// Get all orders (admin/owner only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin or owner
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or owner privileges required.'
      });
    }

    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Get order statistics (admin/owner only)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    // Check if user is admin or owner
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or owner privileges required.'
      });
    }

    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

                const fabricTypeStats = await Order.aggregate([
              {
                $group: {
                  _id: '$fabricType',
                  count: { $sum: 1 }
                }
              }
            ]);

            const colorStats = await Order.aggregate([
              {
                $group: {
                  _id: '$color',
                  count: { $sum: 1 }
                }
              }
            ]);

            const fitStats = await Order.aggregate([
              {
                $group: {
                  _id: '$fit',
                  count: { $sum: 1 }
                }
              }
            ]);

            const sizingTypeStats = await Order.aggregate([
              {
                $group: {
                  _id: '$sizingType',
                  count: { $sum: 1 }
                }
              }
            ]);

            const standardSizeStats = await Order.aggregate([
              {
                $group: {
                  _id: '$standardSize',
                  count: { $sum: 1 }
                }
              }
            ]);

            const collarStyleStats = await Order.aggregate([
              {
                $group: {
                  _id: '$collarStyle',
                  count: { $sum: 1 }
                }
              }
            ]);

            const cuffTypeStats = await Order.aggregate([
              {
                $group: {
                  _id: '$cuffType',
                  count: { $sum: 1 }
                }
              }
            ]);

            const pocketStyleStats = await Order.aggregate([
              {
                $group: {
                  _id: '$pocketStyle',
                  count: { $sum: 1 }
                }
              }
            ]);

            const trouserFitStats = await Order.aggregate([
              {
                $group: {
                  _id: '$trouserFit',
                  count: { $sum: 1 }
                }
              }
            ]);

            const jacketStyleStats = await Order.aggregate([
              {
                $group: {
                  _id: '$jacketStyle',
                  count: { $sum: 1 }
                }
              }
            ]);

            const buttonCountStats = await Order.aggregate([
              {
                $group: {
                  _id: '$buttonCount',
                  count: { $sum: 1 }
                }
              }
            ]);

            const sleeveStyleStats = await Order.aggregate([
              {
                $group: {
                  _id: '$sleeveStyle',
                  count: { $sum: 1 }
                }
              }
            ]);

            const necklineStats = await Order.aggregate([
              {
                $group: {
                  _id: '$neckline',
                  count: { $sum: 1 }
                }
              }
            ]);

            const hemlineStats = await Order.aggregate([
              {
                $group: {
                  _id: '$hemline',
                  count: { $sum: 1 }
                }
              }
            ]);

            const dressLengthStats = await Order.aggregate([
              {
                $group: {
                  _id: '$dressLength',
                  count: { $sum: 1 }
                }
              }
            ]);

            const closureStats = await Order.aggregate([
              {
                $group: {
                  _id: '$closure',
                  count: { $sum: 1 }
                }
              }
            ]);

    const genderStats = await Order.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

                res.json({
              success: true,
              stats: {
                byStatus: stats,
                byFabricType: fabricTypeStats,
                byColor: colorStats,
                byFit: fitStats,
                bySizingType: sizingTypeStats,
                byStandardSize: standardSizeStats,
                byCollarStyle: collarStyleStats,
                byCuffType: cuffTypeStats,
                byPocketStyle: pocketStyleStats,
                byTrouserFit: trouserFitStats,
                byJacketStyle: jacketStyleStats,
                byButtonCount: buttonCountStats,
                bySleeveStyle: sleeveStyleStats,
                byNeckline: necklineStats,
                byHemline: hemlineStats,
                byDressLength: dressLengthStats,
                byClosure: closureStats,
                byGender: genderStats,
                total: await Order.countDocuments()
              }
            });

  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics'
    });
  }
});

// Update order by customer (only for pending orders)
router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the order belongs to the authenticated user
    if (order.userId.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own orders'
      });
    }

    // Check if the order is in pending status
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be updated'
      });
    }

    // Extract the fields that can be updated
    const {
      name,
      email,
      contactNumber,
      deliveryLocation,
      address,
      description,
      gender,
      location,
      fabricType,
      color,
      fit,
      sizingType,
      standardSize,
      customMeasurements,
      collarStyle,
      cuffType,
      pocketStyle,
      trouserFit,
      jacketStyle,
      buttonCount,
      sleeveStyle,
      neckline,
      hemline,
      dressLength,
      closure
    } = req.body;

    // Validate required fields based on gender
    if (gender === 'unisex') {
      if (!fabricType || !color || !fit) {
        return res.status(400).json({
          success: false,
          message: 'Fabric type, color, and fit are required for unisex clothing'
        });
      }
      
      if (!sizingType) {
        return res.status(400).json({
          success: false,
          message: 'Sizing type is required for unisex clothing'
        });
      }

      if (sizingType === 'standard' && !standardSize) {
        return res.status(400).json({
          success: false,
          message: 'Standard size is required when selecting standard sizing'
        });
      }

      if (sizingType === 'custom' && 
          (!customMeasurements?.chest || !customMeasurements?.waist || 
           !customMeasurements?.length || !customMeasurements?.shoulder)) {
        return res.status(400).json({
          success: false,
          message: 'All custom measurements are required when selecting custom sizing'
        });
      }
    }

    if (gender === 'male') {
      if (!collarStyle || !cuffType || !pocketStyle || !trouserFit || !jacketStyle || !buttonCount) {
        return res.status(400).json({
          success: false,
          message: 'All male clothing details are required'
        });
      }
    }

    if (gender === 'female') {
      if (!sleeveStyle || !neckline || !hemline || !dressLength || !closure) {
        return res.status(400).json({
          success: false,
          message: 'All female clothing details are required'
        });
      }
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        contactNumber,
        deliveryLocation,
        address: address || '',
        location,
        description: description || '',
        gender,
        fabricType,
        color,
        fit,
        sizingType,
        standardSize,
        customMeasurements,
        collarStyle,
        cuffType,
        pocketStyle,
        trouserFit,
        jacketStyle,
        buttonCount,
        sleeveStyle,
        neckline,
        hemline,
        dressLength,
        closure
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order'
    });
  }
});

// Delete order by customer (only for pending orders)
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the order belongs to the authenticated user
    if (order.userId.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own orders'
      });
    }

    // Check if the order is in pending status
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be deleted'
      });
    }

    // Delete the order
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order'
    });
  }
});

module.exports = router; 