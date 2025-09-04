// Comprehensive Real Products Database with Images
const mongoose = require('mongoose');
const Product = require('./models/Product.jsx');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const realProducts = [
  // ==== SEEDS CATEGORY ====
  {
    name: 'Wheat Seeds - HD 2967 (Premium Quality)',
    description: 'High-yielding wheat variety suitable for timely and late sown conditions. Excellent resistance to yellow rust and leaf blight. Average yield: 45-50 quintals/hectare.',
    price: 120,
    originalPrice: 140,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&h=500&fit=crop&auto=format'
    ],
    unit: 'kg',
    stock: 250,
    sold: 156,
    rating: 4.6,
    reviews: 89,
    brand: 'IndiaSeeds',
    weight: '1kg',
    features: [
      'High Yield Variety',
      'Disease Resistant',
      'Suitable for Multiple Seasons',
      'Government Certified',
      'Non-GMO'
    ],
    tags: ['wheat', 'seeds', 'farming', 'HD2967', 'high-yield'],
    specifications: {
      material: 'Wheat Seeds',
      color: 'Golden Brown',
      manufacturer: 'India Agricultural Research Institute',
      countryOfOrigin: 'India',
      warranty: '90 days germination guarantee'
    },
    seoData: {
      metaTitle: 'HD 2967 Wheat Seeds - High Yield Variety | Pavithra Traders',
      metaDescription: 'Premium HD 2967 wheat seeds with excellent yield and disease resistance. Perfect for farmers seeking quality seeds.',
      keywords: 'wheat seeds, HD 2967, high yield wheat, farming seeds, agriculture'
    },
    featured: true
  },

  {
    name: 'Basmati Rice Seeds - Pusa Basmati 1121',
    description: 'World-famous aromatic basmati rice variety with extra-long grains. Average grain length after cooking: 22-24mm. Export quality with excellent aroma.',
    price: 280,
    originalPrice: 320,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1550473016-69a46c90b1b0?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&h=500&fit=crop&auto=format'
    ],
    unit: 'kg',
    stock: 180,
    sold: 234,
    rating: 4.8,
    reviews: 127,
    brand: 'Pusa Seeds',
    weight: '1kg',
    features: [
      'Extra Long Grain',
      'Export Quality',
      'Aromatic Variety',
      'High Market Value',
      'Premium Basmati'
    ],
    tags: ['basmati', 'rice', 'pusa', '1121', 'export-quality'],
    specifications: {
      material: 'Basmati Rice Seeds',
      color: 'White',
      manufacturer: 'Indian Agricultural Research Institute, Delhi',
      countryOfOrigin: 'India',
      warranty: '85% germination guarantee'
    },
    featured: true
  },

  {
    name: 'Tomato Seeds - Arka Rakshak (Hybrid)',
    description: 'High-yielding hybrid tomato variety resistant to bacterial wilt and ToLCV. Excellent for both fresh market and processing. Average yield: 80-90 tons/hectare.',
    price: 450,
    originalPrice: 500,
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1546470427-e2741101d0fa?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=500&fit=crop&auto=format'
    ],
    unit: 'grams',
    stock: 95,
    sold: 78,
    rating: 4.7,
    reviews: 45,
    brand: 'Arka Seeds',
    weight: '10g',
    features: [
      'Disease Resistant',
      'High Yield',
      'Uniform Size',
      'Good Shelf Life',
      'Hybrid Variety'
    ],
    tags: ['tomato', 'hybrid', 'vegetable', 'arka-rakshak'],
    specifications: {
      material: 'Tomato Seeds',
      color: 'Brown',
      manufacturer: 'Indian Institute of Horticultural Research',
      countryOfOrigin: 'India',
      warranty: '80% germination guarantee'
    }
  },

  // ==== FERTILIZERS CATEGORY ====
  {
    name: 'NPK 12:32:16 Complex Fertilizer',
    description: 'Balanced NPK fertilizer ideal for all crops. Provides essential nutrients for healthy plant growth. Suitable for drip irrigation and foliar application.',
    price: 850,
    originalPrice: 950,
    category: 'Fertilizers',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1574919981870-4c28d8fc3e0a?w=500&h=500&fit=crop&auto=format'
    ],
    unit: 'kg',
    stock: 500,
    sold: 312,
    rating: 4.5,
    reviews: 156,
    brand: 'FertIndia',
    weight: '50kg',
    features: [
      'Balanced NPK Formula',
      'Water Soluble',
      'Quick Acting',
      'Suitable for All Crops',
      'Enhanced Root Development'
    ],
    tags: ['npk', 'fertilizer', 'complex', 'balanced'],
    specifications: {
      material: 'Granular Fertilizer',
      color: 'Grey',
      manufacturer: 'Indian Farmers Fertilizer Cooperative',
      countryOfOrigin: 'India',
      warranty: '2 years from manufacture date'
    },
    featured: true
  },

  {
    name: 'Organic Vermicompost - Premium Grade',
    description: 'Premium quality vermicompost made from cow dung and organic waste. Rich in nutrients and beneficial microorganisms. Improves soil structure and water retention.',
    price: 180,
    originalPrice: 220,
    category: 'Fertilizers',
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=500&fit=crop&auto=format'
    ],
    unit: 'kg',
    stock: 400,
    sold: 289,
    rating: 4.9,
    reviews: 203,
    brand: 'EcoGrow',
    weight: '25kg',
    features: [
      '100% Organic',
      'Rich in Nutrients',
      'Improves Soil Health',
      'Environmentally Safe',
      'Government Certified'
    ],
    tags: ['organic', 'vermicompost', 'natural', 'eco-friendly'],
    specifications: {
      material: 'Organic Compost',
      color: 'Dark Brown',
      manufacturer: 'EcoGrow Organics',
      countryOfOrigin: 'India',
      warranty: 'Quality guaranteed'
    }
  },

  // ==== PESTICIDES CATEGORY ====
  {
    name: 'Imidacloprid 17.8% SL Insecticide',
    description: 'Systemic insecticide for control of sucking pests like aphids, jassids, and whiteflies. Effective on cotton, vegetables, and fruit crops.',
    price: 320,
    originalPrice: 380,
    category: 'Insecticides',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=500&h=500&fit=crop&auto=format'
    ],
    unit: 'ml',
    stock: 150,
    sold: 67,
    rating: 4.3,
    reviews: 34,
    brand: 'CropCare',
    weight: '250ml',
    features: [
      'Systemic Action',
      'Long Duration Control',
      'Safe for Beneficial Insects',
      'Rainfast Formulation',
      'Government Approved'
    ],
    tags: ['insecticide', 'imidacloprid', 'pest-control', 'systemic'],
    specifications: {
      material: 'Liquid Insecticide',
      color: 'Yellow',
      manufacturer: 'Bayer CropScience',
      countryOfOrigin: 'India',
      warranty: '3 years from manufacture'
    }
  },

  // ==== TOOLS CATEGORY ====
  {
    name: 'Garden Hand Cultivator - Heavy Duty',
    description: 'Professional grade hand cultivator with ergonomic handle. Perfect for weeding, cultivating, and aerating soil in gardens and farms.',
    price: 450,
    originalPrice: 520,
    category: 'Tools',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1615796153287-98eacf0abb13?w=500&h=500&fit=crop&auto=format'
    ],
    unit: 'piece',
    stock: 75,
    sold: 89,
    rating: 4.6,
    reviews: 67,
    brand: 'FarmTools Pro',
    weight: '800g',
    features: [
      'Stainless Steel Tines',
      'Ergonomic Handle',
      'Rust Resistant',
      'Durable Construction',
      'Comfortable Grip'
    ],
    tags: ['cultivator', 'hand-tool', 'gardening', 'farming'],
    specifications: {
      material: 'Stainless Steel',
      color: 'Silver/Black',
      dimensions: '35cm x 10cm',
      manufacturer: 'Indian Tool Works',
      countryOfOrigin: 'India',
      warranty: '2 years against manufacturing defects'
    }
  },

  {
    name: 'Drip Irrigation Kit - 1 Acre Coverage',
    description: 'Complete drip irrigation system for 1 acre land. Includes mainline, laterals, drippers, and fittings. Water-saving technology for efficient farming.',
    price: 12500,
    originalPrice: 15000,
    category: 'Equipment',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=500&h=500&fit=crop&auto=format'
    ],
    unit: 'set',
    stock: 25,
    sold: 18,
    rating: 4.8,
    reviews: 23,
    brand: 'IrrigationTech',
    weight: '45kg',
    features: [
      'Complete Kit',
      'Water Saving Technology',
      'Easy Installation',
      'Uniform Water Distribution',
      '5 Year Warranty'
    ],
    tags: ['drip-irrigation', 'water-saving', 'farming-equipment'],
    specifications: {
      material: 'HDPE/PVC',
      color: 'Black/Blue',
      coverage: '1 Acre',
      manufacturer: 'Jain Irrigation Systems',
      countryOfOrigin: 'India',
      warranty: '5 years on system, 2 years on drippers'
    },
    featured: true
  },

  // ==== ORGANIC PRODUCTS ====
  {
    name: 'Neem Oil - Cold Pressed (Organic)',
    description: 'Pure cold-pressed neem oil for organic farming. Natural pest control and soil conditioner. Certified organic by NPOP standards.',
    price: 380,
    originalPrice: 450,
    category: 'Organic Products',
    image: 'https://images.unsplash.com/photo-1597828598227-f67df7ed6039?w=500&h=500&fit=crop&auto=format',
    images: [
      'https://images.unsplash.com/photo-1597828598227-f67df7ed6039?w=500&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1576615130439-3e7cbc1ce7dc?w=500&h=500&fit=crop&auto=format'
    ],
    unit: 'liter',
    stock: 120,
    sold: 95,
    rating: 4.7,
    reviews: 78,
    brand: 'OrganicCare',
    weight: '1L',
    features: [
      '100% Pure Neem Oil',
      'Cold Pressed',
      'Organic Certified',
      'Natural Pest Control',
      'Eco Friendly'
    ],
    tags: ['neem-oil', 'organic', 'natural', 'pest-control'],
    specifications: {
      material: 'Neem Oil',
      color: 'Golden Brown',
      manufacturer: 'Organic India',
      countryOfOrigin: 'India',
      warranty: '2 years shelf life'
    }
  }
];

async function createRealProducts() {
  try {
    console.log('🌱 Starting to create real agricultural products database...');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');
    
    // Insert new products
    const createdProducts = await Product.insertMany(realProducts);
    console.log(`✅ Successfully created ${createdProducts.length} real products with images`);
    
    // Display summary
    const categoryCount = {};
    createdProducts.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });
    
    console.log('\n📊 Products created by category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    console.log('\n🖼️  All products have high-quality images from Unsplash');
    console.log('💰 Total inventory value:', 
      createdProducts.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('en-IN')
    );
    
    console.log('\n🎯 Featured products:', 
      createdProducts.filter(p => p.featured).map(p => p.name).join(', ')
    );
    
    console.log('\n✨ Database is ready for production use!');
    
  } catch (error) {
    console.error('❌ Error creating products:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createRealProducts();
