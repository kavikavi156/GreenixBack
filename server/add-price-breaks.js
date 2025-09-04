const mongoose = require('mongoose');
const Product = require('./models/Product.js');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function addPriceBreaks() {
  try {
    // Get all products
    const products = await Product.find({});
    
    for (const product of products) {
      console.log(`Updating product: ${product.name}`);
      
      // Ensure basePrice is set
      if (!product.basePrice) {
        product.basePrice = product.price;
      }
      
      // Add sample price breaks for bulk purchasing
      const priceBreaks = [
        { minQuantity: 1, pricePerUnit: product.basePrice },
        { minQuantity: 5, pricePerUnit: Math.round(product.basePrice * 0.95) }, // 5% discount for 5+ items
        { minQuantity: 10, pricePerUnit: Math.round(product.basePrice * 0.90) }, // 10% discount for 10+ items
        { minQuantity: 20, pricePerUnit: Math.round(product.basePrice * 0.85) }, // 15% discount for 20+ items
        { minQuantity: 50, pricePerUnit: Math.round(product.basePrice * 0.80) }  // 20% discount for 50+ items
      ];
      
      product.priceBreaks = priceBreaks;
      await product.save();
      
      console.log(`  - Base price: ₹${product.basePrice}`);
      console.log(`  - Price breaks added: ${priceBreaks.length}`);
      console.log(`  - Bulk discount (50+ items): ₹${priceBreaks[4].pricePerUnit} (${Math.round((1 - priceBreaks[4].pricePerUnit/product.basePrice) * 100)}% off)`);
    }
    
    console.log(`\nUpdated ${products.length} products with price breaks`);
    process.exit(0);
  } catch (error) {
    console.error('Error adding price breaks:', error);
    process.exit(1);
  }
}

addPriceBreaks();
