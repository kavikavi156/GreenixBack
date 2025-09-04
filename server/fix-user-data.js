const mongoose = require('mongoose');
const User = require('./models/User.js');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixUserData() {
  try {
    console.log('Checking for users with invalid cart/wishlist data...');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    for (let user of users) {
      console.log(`Checking user: ${user.username || 'no username'}, email: ${user.email || 'no email'}, name: ${user.name || 'no name'}`);
      
      let needsUpdate = false;
      
      // Check if user has required fields
      if (!user.email || !user.name) {
        console.log(`User ${user.username || user._id} is missing required fields. Deleting...`);
        await User.deleteOne({ _id: user._id });
        continue;
      }
      
      // Clean invalid cart items
      const validCartItems = user.cart.filter(item => item.product && item.quantity > 0);
      if (validCartItems.length !== user.cart.length) {
        console.log(`Cleaning cart for user ${user.username}: ${user.cart.length} -> ${validCartItems.length}`);
        user.cart = validCartItems;
        needsUpdate = true;
      }
      
      // Clean invalid wishlist items
      const validWishlistItems = user.wishlist.filter(item => item.product);
      if (validWishlistItems.length !== user.wishlist.length) {
        console.log(`Cleaning wishlist for user ${user.username}: ${user.wishlist.length} -> ${validWishlistItems.length}`);
        user.wishlist = validWishlistItems;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        console.log(`Updated user ${user.username}`);
      }
    }
    
    console.log('User data cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user data:', error);
    process.exit(1);
  }
}

fixUserData();
