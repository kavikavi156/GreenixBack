const express = require('express');
const Product = require('../models/Product.js');
const mongoose = require('mongoose');
const router = express.Router();

// Get all products with sorting and filtering
router.get('/', async (req, res) => {
  try {
    console.log('Products API called with query:', req.query);
    
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
    
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message,
      mongoState: require('mongoose').connection.readyState,
      timestamp: new Date().toISOString()
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(req.params.id);
    console.log('Product found:', product ? 'Yes' : 'No');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
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
