require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// Environment variables
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS allowed origins - includes Netlify domain
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://greenixx.netlify.app',
    'https://greenix-3.onrender.com'
  ];

console.log('Allowed CORS origins:', ALLOWED_ORIGINS);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with environment variable
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Health endpoints
app.get('/api/health', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const productCount = await Product.countDocuments();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      environment: NODE_ENV,
      productCount: productCount,
      dbName: mongoose.connection.db?.databaseName || 'unknown'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Greenix Backend' });
});

// Debug endpoint for products
app.get('/api/debug/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find().limit(5);
    
    // If no products exist, create sample products
    if (products.length === 0) {
      const sampleProducts = [
        {
          name: 'Organic Tomatoes',
          description: 'Fresh organic tomatoes from local farms',
          price: 50,
          category: 'Vegetables',
          stock: 100,
          image: '/uploads/sample-tomato.jpg',
          tags: ['organic', 'fresh', 'local']
        },
        {
          name: 'Fresh Apples',
          description: 'Crispy red apples, perfect for snacking',
          price: 120,
          category: 'Fruits',
          stock: 80,
          image: '/uploads/sample-apple.jpg',
          tags: ['fresh', 'sweet', 'healthy']
        }
      ];
      
      await Product.insertMany(sampleProducts);
      const newProducts = await Product.find().limit(5);
      
      res.json({ 
        status: 'OK', 
        message: 'Created sample products',
        count: newProducts.length,
        products: newProducts.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          category: p.category
        }))
      });
    } else {
      res.json({ 
        status: 'OK', 
        count: products.length,
        products: products.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          category: p.category
        }))
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Routes
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/customer', require('./routes/customer'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/upload', require('./routes/upload'));
  app.use('/api/razorpay', require('./routes/razorpay')); // Add Razorpay routes
  app.use('/razorpay', require('./routes/razorpay')); // Also mount at /razorpay for frontend compatibility
  
  // Categories route (accessible to both admin and customer)
  app.get('/api/categories', async (req, res) => {
    try {
      const mongoose = require('mongoose');
      
      // Check if Category model already exists
      let Category;
      try {
        Category = mongoose.model('Category');
      } catch (error) {
        // Model doesn't exist, create it
        const categorySchema = new mongoose.Schema({
          name: { type: String, required: true, unique: true },
          description: String,
          icon: String,
          isActive: { type: Boolean, default: true },
          createdBy: String,
          createdAt: { type: Date, default: Date.now }
        });
        Category = mongoose.model('Category', categorySchema);
      }
      
      const categories = await Category.find({ isActive: true }).sort({ name: 1 });
      res.json({ categories });
    } catch (error) {
      console.error('Categories route error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });
  
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

app.get('/', (req, res) => {
  res.json({ 
    message: 'Greenix Backend API is running', 
    version: '1.0.0',
    environment: NODE_ENV 
  });
});

// Health check endpoint for Render
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Health endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
    
    // Try to count products
    let productCount = 0;
    try {
      const Product = require('./models/Product.js');
      productCount = await Product.countDocuments();
    } catch (err) {
      console.error('Error counting products:', err);
    }
    
    res.json({
      status: 'OK',
      database: dbStatus,
      productCount: productCount,
      environment: NODE_ENV,
      cors: ALLOWED_ORIGINS,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`MongoDB: ${MONGODB_URI.includes('localhost') ? 'Local' : 'Remote'}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
