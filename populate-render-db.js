// Run this script locally to populate Render backend with products
const mongoose = require('mongoose');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://naveenk:kavi%402023@cluster0.srgtbbb.mongodb.net/pavithratraders?retryWrites=true&w=majority&appName=Cluster0';

// Product model schema (simplified)
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  brand: String,
  stock: Number,
  image: String,
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
});

const Product = mongoose.model('Product', productSchema);

const sampleProducts = [
  {
    name: "NPK Complex Fertilizer 19:19:19",
    description: "Balanced NPK fertilizer suitable for all crops. Promotes healthy growth and higher yields.",
    brand: "NutriGrow",
    category: "Fertilizers",
    price: 890,
    stock: 160,
    image: "/uploads/npk-fertilizer.jpg",
    featured: true
  },
  {
    name: "Tomato Seeds - Hybrid Variety",
    description: "High-yield hybrid tomato seeds perfect for commercial farming. Disease resistant and high germination rate.",
    brand: "AgriSeeds Pro",
    category: "Seeds",
    price: 250,
    stock: 150,
    image: "/uploads/tomato-seeds.jpg",
    featured: true
  },
  {
    name: "Copper Fungicide Spray",
    description: "Copper-based fungicide for controlling fungal diseases in crops. Preventive and curative action.",
    brand: "FungiShield",
    category: "Fungicides",
    price: 420,
    stock: 190,
    image: "/uploads/copper-fungicide.jpg"
  },
  {
    name: "Neem Oil Insecticide - Organic",
    description: "Natural neem oil based insecticide. Safe for plants, humans and beneficial insects.",
    brand: "BioGuard",
    category: "Insecticides",
    price: 320,
    stock: 230,
    image: "/uploads/neem-oil.jpg"
  },
  {
    name: "Garden Hand Tool Set - 5 Pieces",
    description: "Complete hand tool set including trowel, cultivator, weeder, pruner and gloves.",
    brand: "ToolMaster",
    category: "Tools",
    price: 850,
    stock: 80,
    image: "/uploads/hand-tool-set.jpg",
    featured: true
  }
];

async function createProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Sample products created successfully!');
    
    const count = await Product.countDocuments();
    console.log(`Total products in database: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createProducts();