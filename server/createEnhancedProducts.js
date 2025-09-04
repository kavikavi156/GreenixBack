// Enhanced script to add realistic products with real images
const mongoose = require('mongoose');
const Product = require('./models/Product.jsx');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const enhancedProducts = [
  // Seeds Category
  {
    name: 'Premium Wheat Seeds - HD 2967',
    description: 'High-yield drought-resistant wheat variety with excellent grain quality. Suitable for timely and late sown conditions.',
    price: 120,
    originalPrice: 140,
    discount: 14,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=400&fit=crop'
    ],
    unit: 'kg',
    stock: 150,
    sold: 89,
    rating: 4.5,
    reviews: 23,
    brand: 'AgriSeeds Pro',
    weight: '1kg',
    features: ['High Yield', 'Drought Resistant', 'Disease Tolerance', 'Premium Quality'],
    tags: ['wheat', 'seeds', 'farming', 'agriculture']
  },
  {
    name: 'Hybrid Rice Seeds - Basmati Gold',
    description: 'Premium aromatic basmati rice seeds with superior grain length and excellent cooking quality.',
    price: 180,
    originalPrice: 200,
    discount: 10,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1550473016-69a46c90b1b0?w=400&h=400&fit=crop'
    ],
    unit: 'kg',
    stock: 120,
    sold: 156,
    rating: 4.8,
    reviews: 45,
    brand: 'Golden Harvest',
    weight: '1kg',
    features: ['Aromatic', 'Long Grain', 'High Market Value', 'Disease Resistant'],
    tags: ['rice', 'basmati', 'premium', 'seeds']
  },
  {
    name: 'Sweet Corn Seeds - Sugar 75',
    description: 'High-quality sweet corn variety with excellent taste and uniform cob development.',
    price: 95,
    originalPrice: 110,
    discount: 14,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1605819538173-f0b3e90fec2f?w=400&h=400&fit=crop'
    ],
    unit: 'packet',
    stock: 200,
    sold: 78,
    rating: 4.3,
    reviews: 18,
    brand: 'VegSeeds Plus',
    weight: '50g',
    features: ['Sweet Variety', 'High Germination', 'Uniform Growth', 'Good Yield'],
    tags: ['corn', 'sweet', 'vegetable', 'seeds']
  },
  {
    name: 'Sunflower Seeds - Hybrid DRSH-1',
    description: 'High oil content sunflower variety with excellent head size and disease resistance.',
    price: 220,
    originalPrice: 250,
    discount: 12,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1597848212624-e269d8d9ce1e?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1597848212624-e269d8d9ce1e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop'
    ],
    unit: 'kg',
    stock: 80,
    sold: 234,
    rating: 4.7,
    reviews: 67,
    brand: 'OilSeeds Pro',
    weight: '1kg',
    features: ['High Oil Content', 'Large Heads', 'Disease Resistant', 'Commercial Grade'],
    tags: ['sunflower', 'oilseeds', 'commercial', 'hybrid']
  },

  // Herbicides Category
  {
    name: 'Glyphosate 41% SL - WeedOut Pro',
    description: 'Broad-spectrum systemic herbicide for effective control of annual and perennial weeds.',
    price: 350,
    originalPrice: 380,
    discount: 8,
    category: 'Herbicides',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=400&h=400&fit=crop'
    ],
    unit: 'liter',
    stock: 95,
    sold: 145,
    rating: 4.4,
    reviews: 35,
    brand: 'CropCare',
    weight: '1L',
    features: ['Broad Spectrum', 'Systemic Action', 'Long Control', 'Professional Grade'],
    tags: ['herbicide', 'weed control', 'glyphosate', 'farming']
  },
  {
    name: 'Atrazine 50% WP - CropGuard',
    description: 'Pre and post-emergence herbicide for maize, sugarcane, and other crops.',
    price: 285,
    originalPrice: 320,
    discount: 11,
    category: 'Herbicides',
    image: 'https://images.unsplash.com/photo-1530836176668-4d3ffe938b23?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1530836176668-4d3ffe938b23?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop'
    ],
    unit: 'kg',
    stock: 110,
    sold: 89,
    rating: 4.2,
    reviews: 28,
    brand: 'AgriChem',
    weight: '1kg',
    features: ['Pre/Post Emergence', 'Selective Action', 'Long Residual', 'Cost Effective'],
    tags: ['atrazine', 'herbicide', 'maize', 'selective']
  },

  // Insecticides Category
  {
    name: 'Chlorpyrifos 20% EC - BugBuster',
    description: 'Contact and stomach insecticide for control of soil and foliar pests.',
    price: 275,
    originalPrice: 300,
    discount: 8,
    category: 'Insecticides',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=400&h=400&fit=crop'
    ],
    unit: 'liter',
    stock: 85,
    sold: 167,
    rating: 4.6,
    reviews: 42,
    brand: 'PestControl Pro',
    weight: '1L',
    features: ['Contact Action', 'Stomach Poison', 'Broad Spectrum', 'Residual Effect'],
    tags: ['insecticide', 'pest control', 'chlorpyrifos', 'farming']
  },
  {
    name: 'Neem Oil Extract 1500ppm',
    description: 'Organic neem-based insecticide for eco-friendly pest management.',
    price: 195,
    originalPrice: 220,
    discount: 11,
    category: 'Insecticides',
    image: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop'
    ],
    unit: 'liter',
    stock: 125,
    sold: 98,
    rating: 4.5,
    reviews: 31,
    brand: 'EcoFarm',
    weight: '1L',
    features: ['Organic', 'Eco-Friendly', 'Safe for Beneficial Insects', 'Biodegradable'],
    tags: ['neem', 'organic', 'natural', 'eco-friendly']
  },

  // Fertilizers Category
  {
    name: 'NPK 19-19-19 Complex Fertilizer',
    description: 'Balanced nutrition fertilizer with equal proportions of Nitrogen, Phosphorus, and Potassium.',
    price: 850,
    originalPrice: 920,
    discount: 8,
    category: 'Fertilizers',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=400&h=400&fit=crop'
    ],
    unit: 'bag',
    stock: 60,
    sold: 298,
    rating: 4.8,
    reviews: 89,
    brand: 'NutriGrow',
    weight: '50kg',
    features: ['Balanced Nutrition', 'Water Soluble', 'All Crops', 'High Quality'],
    tags: ['npk', 'fertilizer', 'balanced', 'nutrition']
  },
  {
    name: 'Urea 46% Nitrogen Fertilizer',
    description: 'High-grade urea fertilizer for enhanced vegetative growth and green foliage.',
    price: 620,
    originalPrice: 650,
    discount: 5,
    category: 'Fertilizers',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop'
    ],
    unit: 'bag',
    stock: 75,
    sold: 456,
    rating: 4.7,
    reviews: 123,
    brand: 'FarmMax',
    weight: '50kg',
    features: ['High Nitrogen', 'Quick Release', 'Cost Effective', 'Government Approved'],
    tags: ['urea', 'nitrogen', 'growth', 'fertilizer']
  },
  {
    name: 'Organic Compost Premium Grade',
    description: 'Well-decomposed organic compost enriched with beneficial microorganisms.',
    price: 350,
    originalPrice: 400,
    discount: 13,
    category: 'Fertilizers',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=400&h=400&fit=crop'
    ],
    unit: 'bag',
    stock: 90,
    sold: 187,
    rating: 4.6,
    reviews: 56,
    brand: 'EcoGarden',
    weight: '25kg',
    features: ['100% Organic', 'Microbial Enriched', 'Soil Health', 'Sustainable'],
    tags: ['organic', 'compost', 'natural', 'soil health']
  }
];

async function createEnhancedProducts() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');
    
    // Insert enhanced products
    const products = await Product.insertMany(enhancedProducts);
    console.log(`✅ Created ${products.length} enhanced products with real images:`);
    
    products.forEach(product => {
      console.log(`   - ${product.name} - ₹${product.price} (${product.discount}% off) - ${product.sold} sold`);
    });
    
    console.log('\n🎉 Enhanced e-commerce products setup complete!');
    console.log('📸 All products now have real images from Unsplash');
    console.log('💰 Products include pricing, discounts, ratings, and sales data');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating enhanced products:', error);
    process.exit(1);
  }
}

createEnhancedProducts();
