const mongoose = require('mongoose');
require('dotenv').config();

async function testCartClear() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Test the userId from the error
    const userId = '68ce257f3f1a4d13c1b5a4aa';
    console.log('Testing userId:', userId);
    
    // Check if userId is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ Invalid ObjectId format');
      return;
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.username);
    console.log('Current cart length:', user.cart.length);
    
    // Test cart clearing
    console.log('Clearing cart...');
    user.cart = [];
    await user.save();
    
    console.log('✅ Cart cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testCartClear();