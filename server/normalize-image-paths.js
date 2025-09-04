const mongoose = require('mongoose');
const Product = require('./models/Product.js');

async function normalizeImagePaths() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');
    
    // Get all products with full URL images
    const products = await Product.find({ image: { $regex: '^http' } });
    console.log(`Found ${products.length} products with full URL images`);
    
    for (const product of products) {
      // Extract just the filename from the full URL
      const filename = product.image.split('/').pop();
      
      console.log(`Normalizing ${product.name}: ${product.image} -> ${filename}`);
      
      await Product.findByIdAndUpdate(product._id, { image: filename });
    }
    
    console.log('All image paths normalized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

normalizeImagePaths();
