const mongoose = require('mongoose');
const Product = require('./models/Product.js');

async function fixImagePaths() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);
    
    for (const product of products) {
      let needsUpdate = false;
      let newImagePath = product.image;
      
      // Fix full URLs with wrong port
      if (product.image && product.image.includes('localhost:5000')) {
        newImagePath = product.image.replace('localhost:5000', 'localhost:3001');
        needsUpdate = true;
        console.log(`Fixing URL for ${product.name}: ${product.image} -> ${newImagePath}`);
      }
      
      // Fix relative paths to use existing uploaded images
      if (product.image && product.image.startsWith('/uploads/') && !product.image.includes('product-')) {
        // Use one of the existing uploaded images as placeholder
        newImagePath = 'product-1755924187918-529152160.jpeg';
        needsUpdate = true;
        console.log(`Fixing relative path for ${product.name}: ${product.image} -> ${newImagePath}`);
      }
      
      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, { image: newImagePath });
      }
    }
    
    console.log('Image paths updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixImagePaths();
