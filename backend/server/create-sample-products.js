require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product.js');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavithratraders';

console.log('Connecting to MongoDB...');

async function createSampleProducts() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Check if products already exist
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`📦 Database already has ${existingCount} products`);
      return;
    }
    
    console.log('🌱 Creating sample agricultural products...');
    
    const sampleProducts = [
      // Seeds
      {
        name: 'Tomato Seeds - Hybrid Variety',
        description: 'High-yield hybrid tomato seeds perfect for commercial farming. Disease resistant and high germination rate.',
        brand: 'AgriSeeds Pro',
        category: 'Seeds',
        price: 250,
        basePrice: 250,
        baseUnit: 'packet',
        originalPrice: 300,
        discount: 17,
        packageSizes: [
          { size: 50, unit: 'grams', priceMultiplier: 1, price: 250, stock: 100 },
          { size: 100, unit: 'grams', priceMultiplier: 1.8, price: 450, stock: 50 }
        ],
        available: true,
        stock: 150,
        image: '/uploads/tomato-seeds.jpg',
        images: ['/uploads/tomato-seeds.jpg', '/uploads/tomato-seeds-2.jpg'],
        sold: 45,
        rating: 4.5,
        reviews: 23,
        features: ['High germination rate', 'Disease resistant', 'Hybrid variety', 'Commercial grade'],
        tags: ['tomato', 'hybrid', 'seeds', 'vegetables'],
        specifications: {
          material: 'Hybrid seeds',
          countryOfOrigin: 'India',
          warranty: '90 days germination guarantee'
        },
        featured: true
      },
      {
        name: 'Wheat Seeds - Premium Quality',
        description: 'Premium quality wheat seeds with excellent yield potential. Suitable for various soil types.',
        brand: 'FarmSelect',
        category: 'Seeds',
        price: 180,
        basePrice: 180,
        baseUnit: 'kg',
        packageSizes: [
          { size: 1, unit: 'kg', priceMultiplier: 1, price: 180, stock: 200 },
          { size: 5, unit: 'kg', priceMultiplier: 4.5, price: 810, stock: 80 }
        ],
        available: true,
        stock: 280,
        image: '/uploads/wheat-seeds.jpg',
        sold: 67,
        rating: 4.3,
        reviews: 34,
        features: ['High yield', 'Drought tolerant', 'Premium quality'],
        tags: ['wheat', 'grains', 'seeds', 'cereals']
      },
      
      // Fertilizers
      {
        name: 'NPK Complex Fertilizer 19:19:19',
        description: 'Balanced NPK fertilizer suitable for all crops. Promotes healthy growth and higher yields.',
        brand: 'NutriGrow',
        category: 'Fertilizers',
        price: 890,
        basePrice: 890,
        baseUnit: 'kg',
        originalPrice: 950,
        discount: 6,
        packageSizes: [
          { size: 5, unit: 'kg', priceMultiplier: 1, price: 890, stock: 120 },
          { size: 25, unit: 'kg', priceMultiplier: 4.8, price: 4272, stock: 40 }
        ],
        available: true,
        stock: 160,
        image: '/uploads/npk-fertilizer.jpg',
        sold: 89,
        rating: 4.6,
        reviews: 45,
        features: ['Balanced nutrition', 'Water soluble', 'Quick acting', 'All crops'],
        tags: ['NPK', 'fertilizer', 'nutrients', 'growth'],
        specifications: {
          material: 'NPK 19:19:19',
          countryOfOrigin: 'India'
        },
        featured: true
      },
      {
        name: 'Organic Vermi Compost',
        description: 'Premium quality vermi compost rich in organic matter. Improves soil health naturally.',
        brand: 'OrganicFarm',
        category: 'Fertilizers',
        price: 450,
        basePrice: 450,
        baseUnit: 'kg',
        packageSizes: [
          { size: 10, unit: 'kg', priceMultiplier: 1, price: 450, stock: 200 },
          { size: 50, unit: 'kg', priceMultiplier: 4.5, price: 2025, stock: 60 }
        ],
        available: true,
        stock: 260,
        image: '/uploads/vermi-compost.jpg',
        sold: 134,
        rating: 4.8,
        reviews: 67,
        features: ['100% organic', 'Soil enricher', 'Eco-friendly', 'Natural nutrients'],
        tags: ['organic', 'compost', 'natural', 'soil health']
      },
      
      // Pesticides/Insecticides
      {
        name: 'Neem Oil Insecticide - Organic',
        description: 'Natural neem oil based insecticide. Safe for plants, humans and beneficial insects.',
        brand: 'BioGuard',
        category: 'Insecticides',
        price: 320,
        basePrice: 320,
        baseUnit: 'liter',
        packageSizes: [
          { size: 250, unit: 'ml', priceMultiplier: 1, price: 320, stock: 150 },
          { size: 1, unit: 'liter', priceMultiplier: 3.5, price: 1120, stock: 80 }
        ],
        available: true,
        stock: 230,
        image: '/uploads/neem-oil.jpg',
        sold: 78,
        rating: 4.4,
        reviews: 42,
        features: ['Organic', 'Safe for humans', 'Broad spectrum', 'Eco-friendly'],
        tags: ['neem', 'organic', 'insecticide', 'natural']
      },
      
      // Herbicides
      {
        name: 'Glyphosate Herbicide 41%',
        description: 'Effective systemic herbicide for controlling weeds. Fast acting and long lasting.',
        brand: 'WeedControl Pro',
        category: 'Herbicides',
        price: 580,
        basePrice: 580,
        baseUnit: 'liter',
        packageSizes: [
          { size: 500, unit: 'ml', priceMultiplier: 1, price: 580, stock: 100 },
          { size: 1, unit: 'liter', priceMultiplier: 1.8, price: 1044, stock: 60 }
        ],
        available: true,
        stock: 160,
        image: '/uploads/glyphosate.jpg',
        sold: 56,
        rating: 4.2,
        reviews: 28,
        features: ['Systemic action', 'Broad spectrum', 'Long lasting', 'Professional grade'],
        tags: ['herbicide', 'weed control', 'glyphosate', 'systemic']
      },
      
      // Fungicides
      {
        name: 'Copper Fungicide Spray',
        description: 'Copper-based fungicide for controlling fungal diseases in crops. Preventive and curative action.',
        brand: 'FungiShield',
        category: 'Fungicides',
        price: 420,
        basePrice: 420,
        baseUnit: 'kg',
        packageSizes: [
          { size: 500, unit: 'grams', priceMultiplier: 1, price: 420, stock: 120 },
          { size: 1, unit: 'kg', priceMultiplier: 1.9, price: 798, stock: 70 }
        ],
        available: true,
        stock: 190,
        image: '/uploads/copper-fungicide.jpg',
        sold: 43,
        rating: 4.3,
        reviews: 19,
        features: ['Copper-based', 'Preventive & curative', 'Broad spectrum', 'Weather resistant'],
        tags: ['fungicide', 'copper', 'disease control', 'prevention']
      },
      
      // Tools
      {
        name: 'Garden Hand Tool Set - 5 Pieces',
        description: 'Complete hand tool set including trowel, cultivator, weeder, pruner and gloves.',
        brand: 'ToolMaster',
        category: 'Tools',
        price: 850,
        basePrice: 850,
        baseUnit: 'set',
        originalPrice: 1000,
        discount: 15,
        packageSizes: [
          { size: 1, unit: 'set', priceMultiplier: 1, price: 850, stock: 80 }
        ],
        available: true,
        stock: 80,
        image: '/uploads/hand-tool-set.jpg',
        sold: 67,
        rating: 4.7,
        reviews: 34,
        features: ['5-piece set', 'Ergonomic handles', 'Stainless steel', 'Durable construction'],
        tags: ['tools', 'hand tools', 'gardening', 'cultivation'],
        specifications: {
          material: 'Stainless steel with plastic handles',
          warranty: '1 year'
        },
        featured: true
      },
      
      // Equipment
      {
        name: 'Knapsack Sprayer - 16L Capacity',
        description: 'Professional grade knapsack sprayer with pressure gauge. Perfect for pesticide application.',
        brand: 'SprayTech',
        category: 'Equipment',
        price: 2850,
        basePrice: 2850,
        baseUnit: 'unit',
        packageSizes: [
          { size: 1, unit: 'unit', priceMultiplier: 1, price: 2850, stock: 25 }
        ],
        available: true,
        stock: 25,
        image: '/uploads/knapsack-sprayer.jpg',
        sold: 23,
        rating: 4.5,
        reviews: 12,
        features: ['16L capacity', 'Pressure gauge', 'Adjustable nozzle', 'Comfortable straps'],
        tags: ['sprayer', 'equipment', 'pesticide application', 'farming'],
        specifications: {
          material: 'HDPE tank with brass fittings',
          warranty: '2 years'
        }
      },
      
      // Organic Products
      {
        name: 'Bio Pesticide - Bacillus thuringiensis',
        description: 'Biological pesticide containing Bt bacteria. Safe and effective against caterpillars.',
        brand: 'BioSafe',
        category: 'Organic Products',
        price: 680,
        basePrice: 680,
        baseUnit: 'kg',
        packageSizes: [
          { size: 100, unit: 'grams', priceMultiplier: 1, price: 680, stock: 60 },
          { size: 500, unit: 'grams', priceMultiplier: 4.5, price: 3060, stock: 30 }
        ],
        available: true,
        stock: 90,
        image: '/uploads/bt-pesticide.jpg',
        sold: 34,
        rating: 4.6,
        reviews: 18,
        features: ['Biological control', '100% organic', 'Safe for environment', 'Selective action'],
        tags: ['organic', 'biological', 'bt', 'eco-friendly']
      }
    ];
    
    // Insert products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully created ${insertedProducts.length} sample products`);
    
    // Display summary
    const productsByCategory = {};
    insertedProducts.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = 0;
      }
      productsByCategory[product.category]++;
    });
    
    console.log('\n📊 Products by category:');
    Object.entries(productsByCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });
    
    console.log('\n🎉 Sample products created successfully!');
    console.log('You can now refresh your frontend to see the products.');
    
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
  } finally {
    mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

// Run the script
createSampleProducts();