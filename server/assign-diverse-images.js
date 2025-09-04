const mongoose = require('mongoose');
const Product = require('./models/Product.js');
const fs = require('fs');
const path = require('path');

async function assignDiverseImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');
    
    // Get existing uploaded images
    const uploadsDir = path.join(__dirname, 'uploads');
    const existingImages = fs.readdirSync(uploadsDir).filter(file => file.startsWith('product-'));
    console.log('Available images:', existingImages);
    
    // Get all products grouped by category
    const products = await Product.find({});
    const categories = {};
    
    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push(product);
    });
    
    console.log('Categories:', Object.keys(categories));
    
    // Assign different images to different categories
    const imageAssignments = {
      'Seeds': 'product-1755924187918-529152160.jpeg',
      'Fertilizers': 'product-1755924232164-863084415.jpeg', 
      'Tools': 'product-1755924750679-341355297.jpeg',
      'Equipment': 'product-1755924750679-341355297.jpeg'
    };
    
    for (const [category, productList] of Object.entries(categories)) {
      const assignedImage = imageAssignments[category] || existingImages[0];
      
      console.log(`\nAssigning image "${assignedImage}" to ${productList.length} products in category "${category}"`);
      
      for (const product of productList) {
        if (product.image !== assignedImage) {
          console.log(`  Updating ${product.name}: ${product.image} -> ${assignedImage}`);
          await Product.findByIdAndUpdate(product._id, { image: assignedImage });
        }
      }
    }
    
    console.log('\nImage assignments completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignDiverseImages();
