const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Product = require('./models/Product.js');

async function testCartAndCheckout() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');
    
    // Check if test user exists
    let user = await User.findOne({ username: 'testuser' });
    
    if (!user) {
      // Create test user
      const hashedPassword = await bcrypt.hash('test123', 10);
      user = new User({
        name: 'Test User',
        username: 'testuser',
        email: 'test@test.com',
        password: hashedPassword,
        role: 'customer'
      });
      await user.save();
      console.log('Test user created');
    }
    
    // Clear existing cart
    user.cart = [];
    
    // Get some products to add to cart
    const products = await Product.find({}).limit(3);
    console.log(`Found ${products.length} products`);
    
    // Add products to cart
    for (const product of products) {
      user.cart.push({
        product: product._id,
        quantity: Math.floor(Math.random() * 3) + 1
      });
      console.log(`Added ${product.name} to cart`);
    }
    
    await user.save();
    console.log(`Cart updated with ${user.cart.length} items`);
    
    // Generate token for this user
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('\n=== LOGIN CREDENTIALS FOR TESTING ===');
    console.log('Username: testuser');
    console.log('Password: test123');
    console.log('Token:', token);
    console.log('User ID:', user._id);
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testCartAndCheckout();
