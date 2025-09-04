const mongoose = require('mongoose');

// Define User schema directly since we're not loading the full app
const userSchema = new mongoose.Schema({
  email: String,
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }]
});

const productSchema = new mongoose.Schema({
  name: String
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function cleanupInvalidCartItems() {
  try {
    console.log('Starting cart cleanup...');
    
    // Get all users with cart items
    const users = await User.find({ 'cart.0': { $exists: true } });
    console.log(`Found ${users.length} users with cart items`);
    
    let totalCleaned = 0;
    
    for (const user of users) {
      const originalCartLength = user.cart.length;
      const validCartItems = [];
      
      // Check each cart item
      for (const cartItem of user.cart) {
        const product = await Product.findById(cartItem.product);
        if (product) {
          validCartItems.push(cartItem);
        } else {
          console.log(`Removing invalid cart item ${cartItem.product} for user ${user._id}`);
        }
      }
      
      // Update user cart if items were removed
      if (validCartItems.length !== originalCartLength) {
        user.cart = validCartItems;
        await user.save();
        const cleaned = originalCartLength - validCartItems.length;
        totalCleaned += cleaned;
        console.log(`Cleaned ${cleaned} invalid items from user ${user.email || user._id}`);
      }
    }
    
    console.log(`Cart cleanup completed! Removed ${totalCleaned} invalid items total.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during cart cleanup:', error);
    process.exit(1);
  }
}

cleanupInvalidCartItems();
