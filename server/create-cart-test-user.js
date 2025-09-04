const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.js');

async function createCartTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');

    // Delete existing test user if exists
    await User.deleteOne({ username: 'carttest' });
    
    // Create new test user
    const hashedPassword = await bcrypt.hash('carttest123', 10);
    
    const testUser = new User({
      name: 'Cart Test User',
      email: 'carttest@example.com',
      username: 'carttest',
      password: hashedPassword,
      role: 'customer',
      cart: [],
      wishlist: []
    });

    await testUser.save();
    
    console.log('Cart test user created successfully!');
    console.log('Username: carttest');
    console.log('Password: carttest123');
    console.log('User ID:', testUser._id);
    
  } catch (error) {
    console.error('Error creating cart test user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createCartTestUser();
