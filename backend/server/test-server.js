const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

// Test route to simulate the cart clear
app.post('/test-clear/:userId', async (req, res) => {
  try {
    console.log('Test clear route called for userId:', req.params.userId);
    
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.username);
    console.log('Current cart length:', user.cart.length);
    
    user.cart = [];
    await user.save();
    
    console.log('Cart cleared successfully');
    res.status(200).json({ 
      message: 'Cart cleared successfully',
      currentCount: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart', details: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});

console.log('Test the route with: curl -X POST http://localhost:3002/test-clear/68ce257f3f1a4d13c1b5a4aa');