const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/pavithratraders');

async function createSampleProducts() {
  try {
    // Check if products already exist
    const existingProducts = await Product.find();
    console.log(`Found ${existingProducts.length} existing products`);

    if (existingProducts.length === 0) {
      const sampleProducts = [
        {
          name: 'Premium Organic Fertilizer',
          description: 'High-quality organic fertilizer for better plant growth. Made from natural ingredients.',
          price: 299,
          category: 'fertilizers',
          stock: 50,
          image: 'sample-fertilizer.jpg'
        },
        {
          name: 'Hybrid Tomato Seeds',
          description: 'Disease-resistant hybrid tomato seeds with high yield potential.',
          price: 149,
          category: 'seeds',
          stock: 25,
          image: 'sample-seeds.jpg'
        },
        {
          name: 'Natural Pest Control Spray',
          description: 'Eco-friendly pest control solution safe for plants and environment.',
          price: 199,
          category: 'pesticides',
          stock: 15,
          image: 'sample-pesticide.jpg'
        },
        {
          name: 'Heavy Duty Garden Hoe',
          description: 'Professional grade garden hoe for efficient soil cultivation.',
          price: 399,
          category: 'tools',
          stock: 8,
          image: 'sample-tool.jpg'
        },
        {
          name: 'Drip Irrigation Kit',
          description: 'Complete drip irrigation system for water-efficient farming.',
          price: 1299,
          category: 'irrigation',
          stock: 12,
          image: 'sample-irrigation.jpg'
        },
        {
          name: 'Organic Compost Mix',
          description: 'Rich organic compost for soil enrichment and plant nutrition.',
          price: 249,
          category: 'organic',
          stock: 0, // Out of stock for preorder testing
          image: 'sample-compost.jpg'
        }
      ];

      for (const productData of sampleProducts) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${productData.name}`);
      }

      console.log('\n🎉 Sample products created successfully!');
    } else {
      console.log('Products already exist in database');
      existingProducts.forEach(product => {
        console.log(`- ${product.name} (Stock: ${product.stock})`);
      });
    }
  } catch (error) {
    console.error('Error creating sample products:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleProducts();
