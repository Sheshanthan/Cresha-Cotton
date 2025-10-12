const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/products');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate('createdBy', 'name email');
    
    // Transform products to include creator information
    const transformedProducts = products.map(product => ({
      ...product.toObject(),
      creator: product.createdBy ? {
        name: product.createdBy.name,
        email: product.createdBy.email
      } : {
        name: 'Admin/Owner',
        email: product.createdByEmail
      }
    }));
    
    res.json({
      success: true,
      products: transformedProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Transform product to include creator information
    const transformedProduct = {
      ...product.toObject(),
      creator: product.createdBy ? {
        name: product.createdBy.name,
        email: product.createdBy.email
      } : {
        name: 'Admin/Owner',
        email: product.createdByEmail
      }
    };
    
    res.json({
      success: true,
      product: transformedProduct
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new product (only for owners/admins)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price } = req.body;
    
    // Validate required fields
    if (!name || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate category
    if (!['male', 'female', 'unisex'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be male, female, or unisex'
      });
    }

    // Validate price
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    const product = new Product({
      name,
      description,
      category,
      price,
      image: imagePath,
      createdBy: req.user.id || null, // Will be null for admin/owner
      createdByEmail: req.user.email // Always store the email
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update product (only for owners/admins)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, price, isActive } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields if provided
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) {
      if (!['male', 'female', 'unisex'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be male, female, or unisex'
        });
      }
      product.category = category;
    }
    if (price !== undefined) {
      if (isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number'
        });
      }
      product.price = price;
    }
    if (isActive !== undefined) product.isActive = isActive;

    // Handle image update if new image is provided
    if (req.file) {
      // Delete old image file if it exists
      if (product.image) {
        const oldImagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Set new image path
      product.image = `/uploads/products/${req.file.filename}`;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete product (soft delete - set isActive to false)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
