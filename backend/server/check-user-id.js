const mongoose = require('mongoose');
require('dotenv').config();

async function checkUserId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Check the specific user ID from the error
    const userId = '68df89a5aac7016f8b6e5bd9';
    console.log('Checking userId:', userId);
    
    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ Invalid ObjectId format');
      return;
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (user) {
      console.log('✅ User found:', user.username);
      console.log('Cart length:', user.cart.length);
      
      // Test clearing the cart
      console.log('Clearing cart...');
      user.cart = [];
      await user.save();
      console.log('✅ Cart cleared successfully');
    } else {
      console.log('❌ User not found with ID:', userId);
      
      // List all users to see what's available
      const allUsers = await User.find({});
      console.log('Available users:');
      allUsers.forEach(u => {
        console.log(`- ${u.username} (${u._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkUserId();