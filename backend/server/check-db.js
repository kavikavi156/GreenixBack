require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';

console.log('Connecting to:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Import Product model
  const Product = require('./models/Product.js');
  
  try {
    const productCount = await Product.countDocuments();
    console.log('Total products in database:', productCount);
    
    if (productCount > 0) {
      const sampleProducts = await Product.find().limit(5);
      console.log('Sample products:');
      sampleProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${product.category} - $${product.price}`);
      });
    } else {
      console.log('No products found in database');
    }
  } catch (error) {
    console.error('Error querying products:', error);
  } finally {
    mongoose.disconnect();
  }
}).catch(error => {
  console.error('MongoDB connection error:', error);
});