const express = require('express');
const Order = require('../models/Order.js');
const Product = require('../models/Product.js');
const User = require('../models/User.js');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const WhatsAppNotificationService = require('../services/WhatsAppNotificationService');
const router = express.Router();

// Initialize WhatsApp service
const whatsappService = new WhatsAppNotificationService();

// Configure multer for file upload
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Category Schema for storing custom categories
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  isActive: { type: Boolean, default: true },
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

// Category Routes
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const category = new Category({
      name: name.toLowerCase(),
      description,
      icon: icon || '📦',
      createdBy: 'admin'
    });

    await category.save();
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Stock monitoring route
router.get('/stock-alerts', async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } });
    const outOfStockProducts = await Product.find({ stock: { $lte: 0 } });
    
    res.json({
      lowStockProducts,
      outOfStockProducts,
      totalLowStock: lowStockProducts.length,
      totalOutOfStock: outOfStockProducts.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock alerts' });
  }
});

// Send WhatsApp notification for out of stock
router.post('/notify-out-of-stock/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const result = await whatsappService.sendOutOfStockNotification(product);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send bulk low stock alert
router.post('/notify-low-stock', async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stock: { $lt: 10, $gt: 0 } });
    if (lowStockProducts.length === 0) {
      return res.json({ message: 'No low stock products found' });
    }
    
    const result = await whatsappService.sendLowStockAlert(lowStockProducts);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send low stock alert' });
  }
});

// Get all orders for admin
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email fullName')
      .populate('items.product', 'name price category brand')
      .populate('products', 'name price category')
      .sort({ createdAt: -1 });
    
    console.log('Orders fetched:', orders.length);
    if (orders.length > 0) {
      console.log('Sample order structure:', {
        id: orders[0]._id,
        items: orders[0].items,
        products: orders[0].products,
        hasItems: !!orders[0].items,
        itemsLength: orders[0].items?.length || 0
      });
    }
    
    // Transform orders to include customer name and formatted date
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      customerName: order.user?.username || order.deliveryAddress?.fullName || 'Unknown Customer',
      orderDate: order.createdAt,
      formattedDate: order.createdAt.toLocaleDateString('en-IN'),
      formattedTime: order.createdAt.toLocaleTimeString('en-IN')
    }));
    
    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders by type (prebooked or ordered)
router.get('/orders/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let filter = {};
    
    console.log('Fetching orders for type:', type);
    
    if (type === 'prebooked') {
      filter.status = 'prebooked';
    } else if (type === 'ordered') {
      filter.status = { $in: ['ordered', 'confirmed', 'shipped', 'delivered'] };
    }
    
    console.log('Filter:', filter);
    
    const orders = await Order.find(filter)
      .populate('user', 'username')
      .populate('products', 'name price category')
      .sort({ createdAt: -1 });
      
    console.log('Found orders:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get prebooking statistics per product
router.get('/prebooking-stats', async (req, res) => {
  try {
    console.log('Fetching prebooking statistics...');
    
    const prebookingStats = await Order.aggregate([
      { $match: { status: 'prebooked' } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products',
          count: { $sum: 1 },
          totalQuantity: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          totalQuantity: 1,
          productName: { $arrayElemAt: ['$productInfo.name', 0] }
        }
      }
    ]);

    const totalPrebookings = await Order.countDocuments({ status: 'prebooked' });
    
    console.log('Prebooking stats:', { totalPrebookings, byProduct: prebookingStats });
    
    res.json({
      totalPrebookings,
      byProduct: prebookingStats
    });
  } catch (error) {
    console.error('Error fetching prebooking stats:', error);
    res.status(500).json({ error: 'Failed to fetch prebooking statistics' });
  }
});

// Update order status
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.orderId;
    
    // Get the current order to check previous status
    const currentOrder = await Order.findById(orderId);
    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const previousStatus = currentOrder.status;
    
    // Update the order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('user', 'username').populate('products', 'name price category');
    
    // Handle inventory updates when status changes from prebooked to ordered
    if (previousStatus === 'prebooked' && status === 'ordered') {
      // Decrease prebook count and stock, increase sold count
      if (order.items && order.items.length > 0) {
        // New format with items
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                prebooked: -item.quantity,
                stock: -item.quantity,
                sold: item.quantity
              }
            }
          );
        }
      } else if (order.products && order.products.length > 0) {
        // Old format with products array - assume quantity 1 each
        for (const productId of order.products) {
          await Product.findByIdAndUpdate(
            productId,
            {
              $inc: {
                prebooked: -1,
                stock: -1,
                sold: 1
              }
            }
          );
        }
      }
    }
    // Handle when order is confirmed from ordered status
    else if (previousStatus === 'ordered' && status === 'confirmed') {
      // No inventory changes needed, just status update
    }
    // Handle cancellation
    else if ((previousStatus === 'prebooked' || previousStatus === 'ordered') && status === 'cancelled') {
      // Restore inventory based on previous status
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          const updateObj = {};
          if (previousStatus === 'prebooked') {
            updateObj.prebooked = -item.quantity;
          } else if (previousStatus === 'ordered') {
            updateObj.stock = item.quantity;
            updateObj.sold = -item.quantity;
          }
          
          if (Object.keys(updateObj).length > 0) {
            await Product.findByIdAndUpdate(item.product, { $inc: updateObj });
          }
        }
      } else if (order.products && order.products.length > 0) {
        for (const productId of order.products) {
          const updateObj = {};
          if (previousStatus === 'prebooked') {
            updateObj.prebooked = -1;
          } else if (previousStatus === 'ordered') {
            updateObj.stock = 1;
            updateObj.sold = -1;
          }
          
          if (Object.keys(updateObj).length > 0) {
            await Product.findByIdAndUpdate(productId, { $inc: updateObj });
          }
        }
      }
    }
    
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Toggle prebooking for a product
router.put('/products/:productId/prebooking', async (req, res) => {
  try {
    const { enabled } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { prebookingEnabled: enabled },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle prebooking' });
  }
});

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'ordered' });
    const prebookedOrders = await Order.countDocuments({ status: 'prebooked' });
    
    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      prebookedOrders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get monthly revenue data
router.get('/revenue/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Create date range for the year
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear + 1, 0, 1); // January 1st of next year
    
    console.log(`Fetching revenue data for year: ${targetYear}`);
    console.log(`Date range: ${startDate} to ${endDate}`);
    
    // Aggregate monthly revenue
    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate
          },
          status: { $nin: ['cancelled'] } // Exclude cancelled orders
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    console.log('Raw monthly data:', monthlyData);
    
    // Fill in missing months with zero revenue
    const monthlyRevenue = [];
    for (let month = 1; month <= 12; month++) {
      const existingData = monthlyData.find(data => data._id === month);
      monthlyRevenue.push({
        month: month,
        revenue: existingData ? existingData.revenue : 0,
        orders: existingData ? existingData.orders : 0
      });
    }
    
    console.log('Processed monthly revenue:', monthlyRevenue);
    
    res.json({
      year: targetYear,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ error: 'Failed to fetch monthly revenue data' });
  }
});

// Category Management Endpoints

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Add new category
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = new Category({
      name: name.trim(),
      description: description || '',
      createdBy: 'admin' // You can update this to use actual user info
    });

    await newCategory.save();
    res.status(201).json({ 
      message: 'Category added successfully', 
      category: newCategory 
    });
  } catch (error) {
    console.error('Error adding category:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category already exists' });
    } else {
      res.status(500).json({ message: 'Error adding category' });
    }
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { 
        name: name?.trim(), 
        description: description || '', 
        isActive: isActive !== undefined ? isActive : true 
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ 
      message: 'Category updated successfully', 
      category 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category (soft delete)
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Update product stock and automatically process prebookings
router.put('/products/:productId/stock', async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;
    
    console.log('Updating stock for product:', productId, 'New stock:', stock);
    
    // Get current product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const oldStock = product.stock || 0;
    const newStock = parseInt(stock);
    
    // Update product stock
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { stock: newStock },
      { new: true }
    );
    
    // If stock increased from 0 to positive, process pending prebookings
    if (oldStock === 0 && newStock > 0) {
      console.log('Stock replenished! Processing prebookings...');
      
      // Find all pending prebookings for this product
      const prebookings = await Order.find({
        status: 'prebooked',
        $or: [
          { products: productId },
          { 'items.product': productId }
        ]
      }).populate('user', 'username email');
      
      console.log(`Found ${prebookings.length} prebookings to process`);
      
      let processedCount = 0;
      let availableStock = newStock;
      
      // Process prebookings in order of creation (FIFO)
      for (const prebooking of prebookings) {
        if (availableStock <= 0) break;
        
        let quantityNeeded = 1; // Default for old format
        
        // Calculate quantity needed for new format
        if (prebooking.items && prebooking.items.length > 0) {
          const item = prebooking.items.find(item => 
            item.product.toString() === productId.toString()
          );
          if (item) {
            quantityNeeded = item.quantity;
          }
        }
        
        // Check if we have enough stock for this prebooking
        if (availableStock >= quantityNeeded) {
          try {
            // Convert prebooking to order
            await Order.findByIdAndUpdate(prebooking._id, {
              status: 'ordered',
              convertedAt: new Date(),
              updatedAt: new Date()
            });
            
            // Update product counts
            await Product.findByIdAndUpdate(productId, {
              $inc: {
                stock: -quantityNeeded,
                sold: quantityNeeded,
                prebooked: -quantityNeeded
              }
            });
            
            availableStock -= quantityNeeded;
            processedCount++;
            
            console.log(`Converted prebooking ${prebooking._id} to order for user ${prebooking.user.username}`);
            
            // Here you could send notification to customer
            // await sendNotification(prebooking.user.email, 'Your prebooking is now available!');
            
          } catch (conversionError) {
            console.error('Error converting prebooking:', conversionError);
          }
        }
      }
      
      console.log(`Successfully processed ${processedCount} prebookings`);
      
      return res.json({
        message: 'Stock updated successfully',
        product: updatedProduct,
        prebookingsProcessed: processedCount,
        remainingStock: availableStock
      });
    }
    
    res.json({
      message: 'Stock updated successfully',
      product: updatedProduct
    });
    
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
});

// Product Management Routes for Admin

// Get all products (admin view)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a new product (admin only)
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    console.log('Received file:', req.file);
    
    // Map category to correct enum value
    const validCategories = ['Seeds', 'Herbicides', 'Insecticides', 'Fertilizers', 'Fungicides', 'Tools', 'Equipment', 'Organic Products'];
    let category = req.body.category;
    
    // Try to find a matching category (case-insensitive)
    const matchedCategory = validCategories.find(cat => 
      cat.toLowerCase() === category.toLowerCase()
    );
    
    if (!matchedCategory) {
      // If no exact match, try partial matches
      const partialMatch = validCategories.find(cat => 
        cat.toLowerCase().includes(category.toLowerCase()) || 
        category.toLowerCase().includes(cat.toLowerCase())
      );
      category = partialMatch || 'Tools'; // Default to Tools if no match
    } else {
      category = matchedCategory;
    }
    
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      basePrice: Number(req.body.basePrice || req.body.price), // Use basePrice if provided, otherwise use price
      originalPrice: Number(req.body.price), // Default to same as price
      category: category,
      stock: Number(req.body.stock),
      available: true,
      unit: req.body.unit || 'pieces',
      brand: req.body.brand || 'Generic',
      weight: req.body.weight || '1 unit',
      features: req.body.features ? req.body.features.split(',').map(f => f.trim()) : [],
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      isActive: true,
      featured: false
    };
    
    // Add image filename if uploaded
    if (req.file) {
      productData.image = req.file.filename;
    }
    
    const product = new Product(productData);
    await product.save();
    
    console.log('Product created successfully:', product._id);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// Update a product (admin only)
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    console.log('Updating product:', req.params.id);
    console.log('Update data:', req.body);
    console.log('New file:', req.file);
    
    // Map category to correct enum value
    const validCategories = ['Seeds', 'Herbicides', 'Insecticides', 'Fertilizers', 'Fungicides', 'Tools', 'Equipment', 'Organic Products'];
    let category = req.body.category;
    
    // Try to find a matching category (case-insensitive)
    const matchedCategory = validCategories.find(cat => 
      cat.toLowerCase() === category.toLowerCase()
    );
    
    if (!matchedCategory) {
      // If no exact match, try partial matches
      const partialMatch = validCategories.find(cat => 
        cat.toLowerCase().includes(category.toLowerCase()) || 
        category.toLowerCase().includes(cat.toLowerCase())
      );
      category = partialMatch || 'Tools'; // Default to Tools if no match
    } else {
      category = matchedCategory;
    }
    
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      basePrice: Number(req.body.basePrice || req.body.price), // Use basePrice if provided
      originalPrice: Number(req.body.price), // Update to same as price
      category: category,
      stock: Number(req.body.stock),
      unit: req.body.unit || 'pieces',
      brand: req.body.brand || 'Generic',
      weight: req.body.weight || '1 unit',
      features: req.body.features ? req.body.features.split(',').map(f => f.trim()) : [],
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    };
    
    // Add new image filename if uploaded, otherwise keep existing
    if (req.file) {
      updateData.image = req.file.filename;
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product updated successfully:', product._id);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

// Delete a product (admin only)
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product', details: error.message });
  }
});

// Calculate price for specific quantity (public route for pricing)
router.get('/products/:id/price/:quantity', async (req, res) => {
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

// Test endpoint for download reports
router.get('/test-download', (req, res) => {
  res.json({ 
    message: 'Download endpoint is accessible',
    availableFormats: ['pdf', 'excel', 'json'],
    availablePeriods: ['yearly', 'monthly']
  });
});

// Download reports endpoint
router.get('/download-report', async (req, res) => {
  try {
    const { period, year, month, format } = req.query;
    
    console.log('Download report request:', { period, year, month, format });
    
    // Build date filter based on period
    let dateFilter = {};
    const currentYear = parseInt(year) || new Date().getFullYear();
    
    if (period === 'yearly') {
      dateFilter = {
        createdAt: {
          $gte: new Date(currentYear, 0, 1), // Jan 1st
          $lte: new Date(currentYear, 11, 31, 23, 59, 59) // Dec 31st
        }
      };
    } else if (period === 'monthly') {
      const currentMonth = parseInt(month) || new Date().getMonth();
      dateFilter = {
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lte: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
        }
      };
    }

    // Fetch orders with date filter
    const orders = await Order.find(dateFilter)
      .populate('items.product')
      .populate('user')
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    if (format === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report-${period}-${year}${month ? `-${month + 1}` : ''}.pdf"`);
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // PDF Content
      doc.fontSize(20).text('Sales Report', 100, 100);
      doc.fontSize(12).text(`Period: ${period === 'yearly' ? 'Yearly' : 'Monthly'} - ${year}${month !== undefined ? `/${month + 1}` : ''}`, 100, 130);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 100, 150);
      
      // Summary
      doc.text('Summary:', 100, 180);
      doc.text(`Total Orders: ${totalOrders}`, 120, 200);
      doc.text(`Completed Orders: ${completedOrders}`, 120, 220);
      doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 120, 240);
      
      // Orders table header
      let yPos = 280;
      doc.text('Order Details:', 100, yPos);
      yPos += 30;
      
      doc.text('Date', 100, yPos);
      doc.text('Order ID', 180, yPos);
      doc.text('Customer', 280, yPos);
      doc.text('Status', 380, yPos);
      doc.text('Amount', 450, yPos);
      yPos += 20;
      
      // Draw line
      doc.moveTo(100, yPos).lineTo(500, yPos).stroke();
      yPos += 10;
      
      // Orders data
      orders.forEach(order => {
        if (yPos > 750) { // New page if needed
          doc.addPage();
          yPos = 100;
        }
        
        doc.text(order.createdAt.toLocaleDateString(), 100, yPos);
        doc.text(order._id.toString().substring(0, 8), 180, yPos);
        doc.text(order.user?.username || 'N/A', 280, yPos);
        doc.text(order.status || 'pending', 380, yPos);
        doc.text(`₹${(order.totalAmount || 0).toFixed(2)}`, 450, yPos);
        yPos += 20;
      });
      
      doc.end();
    } else if (format === 'excel') {
      const xl = require('excel4node');
      const wb = new xl.Workbook();
      const ws = wb.addWorksheet('Sales Report');
      
      // Headers
      ws.cell(1, 1).string('Sales Report');
      ws.cell(2, 1).string(`Period: ${period === 'yearly' ? 'Yearly' : 'Monthly'} - ${year}${month !== undefined ? `/${month + 1}` : ''}`);
      ws.cell(3, 1).string(`Generated: ${new Date().toLocaleDateString()}`);
      
      // Summary
      ws.cell(5, 1).string('Summary:');
      ws.cell(6, 1).string(`Total Orders: ${totalOrders}`);
      ws.cell(7, 1).string(`Completed Orders: ${completedOrders}`);
      ws.cell(8, 1).string(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
      
      // Headers for orders table
      const headers = ['Date', 'Order ID', 'Customer', 'Status', 'Amount'];
      headers.forEach((header, index) => {
        ws.cell(10, index + 1).string(header);
      });
      
      // Orders data
      orders.forEach((order, index) => {
        const row = index + 11;
        ws.cell(row, 1).string(order.createdAt.toLocaleDateString());
        ws.cell(row, 2).string(order._id.toString());
        ws.cell(row, 3).string(order.user?.username || 'N/A');
        ws.cell(row, 4).string(order.status || 'pending');
        ws.cell(row, 5).number(order.totalAmount || 0);
      });
      
      // Set response headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="report-${period}-${year}${month ? `-${month + 1}` : ''}.xlsx"`);
      
      wb.write(`report-${period}-${year}${month ? `-${month + 1}` : ''}.xlsx`, res);
    } else {
      // Default JSON response
      res.json({
        summary: {
          totalOrders,
          completedOrders,
          totalRevenue,
          period: period === 'yearly' ? 'Yearly' : 'Monthly',
          year: currentYear,
          month: month !== undefined ? month + 1 : undefined
        },
        orders: orders.map(order => ({
          id: order._id,
          date: order.createdAt,
          customer: order.user?.username,
          status: order.status,
          amount: order.totalAmount,
          items: order.items?.length || 0
        }))
      });
    }
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Create Admin Route
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'admin' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Generate username from email
    const username = email.split('@')[0];
    
    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        error: 'Username already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin user
    const newAdmin = new User({
      name,
      email,
      username,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'customer',
      isActive: true,
      address: {
        phone: phone || ''
      }
    });

    await newAdmin.save();

    // Return success (don't send password back)
    const { password: _, ...adminData } = newAdmin.toObject();
    
    res.status(201).json({
      message: 'Administrator created successfully',
      admin: adminData
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ 
      error: 'Failed to create administrator', 
      details: error.message 
    });
  }
});

// Get Admin List Route
router.get('/admin-list', async (req, res) => {
  try {
    // Find all users with admin role, excluding passwords
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(admins);
  } catch (error) {
    console.error('Error fetching admin list:', error);
    res.status(500).json({ 
      error: 'Failed to fetch administrator list', 
      details: error.message 
    });
  }
});

// Delete Admin Route
router.delete('/delete-admin/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;

    // Prevent deletion of the last admin (for safety)
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return res.status(400).json({ 
        error: 'Cannot delete the last administrator' 
      });
    }

    // Delete the admin
    const deletedAdmin = await User.findByIdAndDelete(adminId);
    
    if (!deletedAdmin) {
      return res.status(404).json({ 
        error: 'Administrator not found' 
      });
    }

    res.json({ 
      message: 'Administrator deleted successfully',
      deletedAdmin: deletedAdmin.name 
    });

  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ 
      error: 'Failed to delete administrator', 
      details: error.message 
    });
  }
});

// Toggle Admin Status Route
router.patch('/toggle-admin-status/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        error: 'Administrator not found' 
      });
    }

    // Toggle the isActive status (add this field if it doesn't exist)
    admin.isActive = !admin.isActive;
    await admin.save();

    // Return without password
    const { password: _, ...adminData } = admin.toObject();

    res.json({ 
      message: `Administrator ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      admin: adminData 
    });

  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({ 
      error: 'Failed to update administrator status', 
      details: error.message 
    });
  }
});

module.exports = router;
