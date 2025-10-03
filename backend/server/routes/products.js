const express = require('express');
const Product = require('../models/Product.js');
const mongoose = require('mongoose');
const router = express.Router();

// Sample products for when database is not available
function getSampleProducts() {
  return [
    {
      _id: '1',
      name: 'Organic Tomatoes',
      description: 'Fresh organic tomatoes from local farms',
      price: 50,
      originalPrice: 60,
      category: 'Vegetables',
      stock: 100,
      image: 'sample-tomato.jpg',
      tags: ['organic', 'fresh', 'local'],
      features: ['Pesticide-free', 'Locally sourced'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      name: 'Fresh Apples',
      description: 'Crispy red apples, perfect for snacking',
      price: 120,
      originalPrice: 140,
      category: 'Fruits',
      stock: 80,
      image: 'sample-apple.jpg',
      tags: ['fresh', 'sweet', 'healthy'],
      features: ['High in fiber', 'Rich in vitamins'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '3',
      name: 'Wheat Seeds',
      description: 'High-quality wheat seeds for farming',
      price: 200,
      originalPrice: 250,
      category: 'Seeds',
      stock: 50,
      image: 'sample-wheat.jpg',
      tags: ['seeds', 'farming', 'wheat'],
      features: ['High germination rate', 'Disease resistant'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '4',
      name: 'Garden Tools Set',
      description: 'Essential tools for gardening and farming',
      price: 800,
      originalPrice: 1000,
      category: 'Tools',
      stock: 25,
      image: 'sample-tools.jpg',
      tags: ['tools', 'gardening', 'farming'],
      features: ['Durable steel', 'Comfortable grip'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

// Get all products with sorting and filtering
router.get('/', async (req, res) => {
  try {
    console.log('Products API called with query:', req.query);
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning sample data');
      return res.json(getSampleProducts());
    }
    
    const { 
      sort = 'name', 
      order = 'asc', 
      category, 
      minPrice, 
      maxPrice, 
      search,
      limit = 50,
      page = 1 
    } = req.query;

    // Build filter object
    let filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price_low':
        sortObj.price = 1;
        break;
      case 'price_high':
        sortObj.price = -1;
        break;
      case 'rating':
        sortObj.rating = -1;
        break;
      case 'popularity':
        sortObj.sold = -1;
        break;
      case 'newest':
        sortObj.createdAt = -1;
        break;
      default:
        sortObj[sort] = order === 'desc' ? -1 : 1;
    }

    const skip = (page - 1) * limit;
    
    const products = await Product.find(filter)
      .sort(sortObj)
      .limit(Number(limit))
      .skip(skip);
    
    const total = await Product.countDocuments(filter);
    
    console.log(`Found ${products.length} products out of ${total} total`);
    
    res.json({
      products,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: products.length,
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    console.error('Error stack:', error.stack);
    console.error('MongoDB connection state:', require('mongoose').connection.readyState);
    
    // Return sample data as fallback when database fails
    console.log('Returning sample products due to database error');
    return res.json(getSampleProducts());
    
    /*
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message,
      mongoState: require('mongoose').connection.readyState,
      timestamp: new Date().toISOString()
    });
    */
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, using sample data');
      const sampleProducts = getSampleProducts();
      const product = sampleProducts.find(p => p._id === req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json(product);
    }
    
    // Validate ObjectId format for database queries
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      // If not a valid ObjectId, check sample data
      const sampleProducts = getSampleProducts();
      const product = sampleProducts.find(p => p._id === req.params.id);
      if (!product) {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      return res.json(product);
    }
    
    const product = await Product.findById(req.params.id);
    console.log('Product found:', product ? 'Yes' : 'No');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    // Fallback to sample data
    console.log('Trying sample data as fallback');
    const sampleProducts = getSampleProducts();
    const product = sampleProducts.find(p => p._id === req.params.id);
    if (product) {
      return res.json(product);
    }
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add a new product (admin only)
router.post('/', async (req, res) => {
  // TODO: Add admin authentication check
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Delete a product (admin only)
router.delete('/:id', async (req, res) => {
  // TODO: Add admin authentication check
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Update a product (admin only)
router.put('/:id', async (req, res) => {
  // TODO: Add admin authentication check
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Calculate price for specific quantity
router.get('/:id/price/:quantity', async (req, res) => {
  try {
    const { id, quantity } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const qty = parseInt(quantity);
    if (qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    const pricePerUnit = product.calculatePrice(qty);
    const totalPrice = product.calculateTotalPrice(qty);
    
    res.json({
      productId: id,
      quantity: qty,
      pricePerUnit: pricePerUnit,
      totalPrice: totalPrice,
      basePrice: product.basePrice,
      savings: qty > 1 ? (product.basePrice * qty) - totalPrice : 0
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ error: 'Failed to calculate price' });
  }
});

module.exports = router;
