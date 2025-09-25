 const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }, // price at time of order
  }],
  // Keep products field for backward compatibility
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  status: { 
    type: String, 
    enum: ['prebooked', 'ordered', 'confirmed', 'shipped', 'delivered', 'cancelled'], 
    default: 'prebooked' 
  },
  totalAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cod', 'gpay', 'upi', 'razorpay', 'netbanking', 'cards'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentDate: { type: Date },
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

module.exports = mongoose.model('Order', orderSchema);
