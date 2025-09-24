require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection (replace with your URI)
mongoose.connect('mongodb://localhost:27017/pavithratraders', {
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

// Routes
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/products', require('./routes/products'));
  app.use('/api/customer', require('./routes/customer'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/upload', require('./routes/upload'));
  app.use('/api/razorpay', require('./routes/razorpay')); // Add Razorpay routes
  
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
  res.send('Backend API is running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
