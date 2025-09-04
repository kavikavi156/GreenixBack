const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  images: [String],
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 }
});

const Product = mongoose.model('Product', productSchema);

async function createSampleProducts() {
  try {
    const sampleProducts = [
      {
        name: 'Organic Fertilizer NPK 10-10-10',
        description: 'Premium organic fertilizer with balanced NPK ratio for optimal plant growth and soil health.',
        price: 450,
        originalPrice: 500,
        category: 'fertilizers',
        images: [],
        stock: 100,
        rating: 4.5,
        reviews: 25
      },
      {
        name: 'Hybrid Tomato Seeds',
        description: 'High-yield hybrid tomato seeds with disease resistance. Perfect for home gardening and commercial farming.',
        price: 120,
        originalPrice: 150,
        category: 'seeds',
        images: [],
        stock: 200,
        rating: 4.8,
        reviews: 45
      },
      {
        name: 'Bio Pesticide Spray',
        description: 'Eco-friendly pesticide made from natural ingredients. Safe for plants, humans, and beneficial insects.',
        price: 280,
        originalPrice: 320,
        category: 'pesticides',
        images: [],
        stock: 75,
        rating: 4.3,
        reviews: 18
      },
      {
        name: 'Garden Hand Tools Set',
        description: 'Complete set of essential gardening tools including trowel, pruner, and weeder. Durable and ergonomic design.',
        price: 850,
        originalPrice: 1000,
        category: 'tools',
        images: [],
        stock: 50,
        rating: 4.6,
        reviews: 32
      },
      {
        name: 'Drip Irrigation Kit',
        description: 'Complete drip irrigation system for efficient water management. Suitable for gardens up to 100 sq ft.',
        price: 1200,
        originalPrice: 1400,
        category: 'irrigation',
        images: [],
        stock: 30,
        rating: 4.7,
        reviews: 28
      },
      {
        name: 'Organic Carrot Seeds',
        description: 'Premium organic carrot seeds with excellent germination rate. Rich in nutrients and flavor.',
        price: 80,
        originalPrice: 100,
        category: 'vegetables',
        images: [],
        stock: 150,
        rating: 4.4,
        reviews: 22
      },
      {
        name: 'Wheat Seeds - HD2967',
        description: 'High-yielding wheat variety suitable for irrigated conditions. Disease resistant and early maturing.',
        price: 60,
        originalPrice: 75,
        category: 'grains',
        images: [],
        stock: 500,
        rating: 4.5,
        reviews: 67
      },
      {
        name: 'Marigold Flower Seeds',
        description: 'Colorful marigold seeds perfect for ornamental gardening. Easy to grow and long-lasting blooms.',
        price: 40,
        originalPrice: 50,
        category: 'flowers',
        images: [],
        stock: 300,
        rating: 4.2,
        reviews: 15
      },
      {
        name: 'Vermicompost Organic Manure',
        description: 'Premium quality vermicompost rich in nutrients. Improves soil structure and plant growth naturally.',
        price: 200,
        originalPrice: 250,
        category: 'organic',
        images: [],
        stock: 80,
        rating: 4.6,
        reviews: 35
      },
      {
        name: 'Apple Saplings - Shimla Variety',
        description: 'Healthy apple saplings from premium Shimla variety. Perfect for hill station cultivation.',
        price: 350,
        originalPrice: 400,
        category: 'fruits',
        images: [],
        stock: 25,
        rating: 4.8,
        reviews: 12
      }
    ];

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log(`Created ${sampleProducts.length} sample products successfully!`);

    // Display products by category
    const categories = ['fertilizers', 'seeds', 'pesticides', 'tools', 'irrigation', 'vegetables', 'grains', 'flowers', 'organic', 'fruits'];
    
    for (const category of categories) {
      const count = await Product.countDocuments({ category });
      console.log(`${category}: ${count} products`);
    }

  } catch (error) {
    console.error('Error creating sample products:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleProducts();
