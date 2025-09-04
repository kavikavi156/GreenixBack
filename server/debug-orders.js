const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders');

// Define schemas (same as in your models)
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
  }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  status: { 
    type: String, 
    enum: ['prebooked', 'ordered', 'confirmed', 'shipped', 'delivered', 'cancelled'], 
    default: 'prebooked' 
  },
  totalAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cod', 'gpay', 'upi'], default: 'cod' },
  deliveryAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  brand: String,
  stock: { type: Number, default: 0 },
});

const Order = mongoose.model('Order', orderSchema);
const Product = mongoose.model('Product', productSchema);

async function debugOrders() {
  try {
    console.log('=== DEBUG ORDERS ===');
    
    // Check total orders
    const orderCount = await Order.countDocuments();
    console.log('Total orders:', orderCount);
    
    // Get first order without populate
    const firstOrderRaw = await Order.findOne().lean();
    console.log('First order (raw):', JSON.stringify(firstOrderRaw, null, 2));
    
    // Get first order with populate
    const firstOrderPopulated = await Order.findOne()
      .populate('items.product', 'name price category')
      .populate('products', 'name price category')
      .lean();
    console.log('First order (populated):', JSON.stringify(firstOrderPopulated, null, 2));
    
    // Check products
    const productCount = await Product.countDocuments();
    console.log('Total products:', productCount);
    
    if (productCount > 0) {
      const sampleProduct = await Product.findOne().lean();
      console.log('Sample product:', JSON.stringify(sampleProduct, null, 2));
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugOrders();
