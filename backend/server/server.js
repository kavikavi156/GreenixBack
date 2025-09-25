// Load environment variables first
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();

// Environment variables with defaults
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174'
];

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Serve static files (uploaded images)
app.use('/uploads', express.static(uploadsDir));

// Request logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

db.once('open', () => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`📊 Database: ${MONGODB_URI}`);
});

// Handle MongoDB connection loss
db.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

db.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
try {
  // Authentication routes
  app.use('/api/auth', require('./routes/auth'));
  console.log('📋 Auth routes loaded');

  // Product routes
  app.use('/api/products', require('./routes/products'));
  console.log('🛍️  Product routes loaded');

  // Customer routes
  app.use('/api/customer', require('./routes/customer'));
  console.log('👥 Customer routes loaded');

  // Admin routes
  app.use('/api/admin', require('./routes/admin'));
  console.log('👑 Admin routes loaded');

  // Upload routes
  app.use('/api/upload', require('./routes/upload'));
  console.log('📤 Upload routes loaded');

  // Razorpay routes (if file exists)
  const razorpayPath = './routes/razorpay';
  if (fs.existsSync(path.join(__dirname, 'routes/razorpay.js'))) {
    app.use('/api/razorpay', require(razorpayPath));
    console.log('💳 Razorpay routes loaded');
  }

} catch (routeError) {
  console.error('❌ Error loading routes:', routeError.message);
  process.exit(1);
}

// Categories route (accessible to both admin and customer)
app.get('/api/categories', async (req, res) => {
  try {
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
        createdAt: { type: Date, default: Date.now }
      });
      Category = mongoose.model('Category', categorySchema);
    }

    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Seeds', description: 'High-quality agricultural seeds', icon: '🌾' },
        { name: 'Fertilizers', description: 'Organic and chemical fertilizers', icon: '🌱' },
        { name: 'Pesticides', description: 'Crop protection chemicals', icon: '🦟' },
        { name: 'Tools', description: 'Farming tools and equipment', icon: '🔧' },
        { name: 'Irrigation', description: 'Water management systems', icon: '💧' }
      ];
      
      await Category.insertMany(defaultCategories);
      const newCategories = await Category.find({ isActive: true }).sort({ name: 1 });
      return res.json(newCategories);
    }
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Serve React app in production
if (NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../dist');
  app.use(express.static(buildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  
  // Don't leak error details in production
  if (NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📊 MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📊 MongoDB connection closed.');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log('🚀=================================🚀');
  console.log(`🌱 Pavithra Traders Server Running`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  console.log('🚀=================================🚀');
});

// Export app for testing
module.exports = app;