const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  description: String,
  brand: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Seeds', 'Herbicides', 'Insecticides', 'Fertilizers', 'Fungicides', 'Tools', 'Equipment', 'Organic Products'], 
    default: 'Seeds' 
  },
  
  // Pricing
  price: { type: Number, required: true }, // Main price (for display, usually smallest package)
  basePrice: { type: Number, required: true }, // Base price per base unit
  baseUnit: { type: String, required: true, default: 'kg' }, // Base unit for pricing
  originalPrice: { type: Number }, // For showing discounts
  discount: { type: Number, default: 0 }, // Percentage discount
  packageSizes: [{ // Available package sizes
    size: { type: Number, required: true }, // Package size (e.g., 1, 5, 10)
    unit: { type: String, required: true }, // Unit for this package (kg, liter, etc.)
    priceMultiplier: { type: Number, default: 1 }, // Multiplier for bulk pricing
    price: { type: Number, required: true }, // Calculated price for this package
    stock: { type: Number, default: 0 } // Stock for this specific package size
  }],
  priceBreaks: [{ // Quantity-based pricing (legacy, for compatibility)
    minQuantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true }
  }],
  
  // Inventory
  available: { type: Boolean, default: true },
  prebooked: { type: Number, default: 0 },
  prebookingEnabled: { type: Boolean, default: true },
  unit: { type: String, default: 'bags' },
  stock: { type: Number, default: 100 },
  weight: { type: String }, // e.g., "1.5 kg", "500 g"
  
  // Media
  image: { type: String, required: true }, // Primary product image
  images: [{ type: String }], // Multiple images array
  
  // Sales & Rating
  sold: { type: Number, default: 0 }, // For tracking top sales
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  
  // Product Details
  features: [{ type: String }], // Key features
  tags: [{ type: String }], // For search filters
  
  // Specifications
  specifications: {
    material: { type: String },
    color: { type: String },
    dimensions: { type: String },
    manufacturer: { type: String },
    countryOfOrigin: { type: String, default: 'India' },
    warranty: { type: String }
  },
  
  // SEO & Marketing
  seoData: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: { type: String }
  },
  
  // System Fields
  inWishlist: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for calculating discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Method to check if product is on sale
productSchema.methods.isOnSale = function() {
  return this.originalPrice && this.originalPrice > this.price;
};

// Method to get stock status
productSchema.methods.getStockStatus = function() {
  if (this.stock === 0) return 'out-of-stock';
  if (this.stock <= 5) return 'low-stock';
  return 'in-stock';
};

// Method to calculate price based on quantity
productSchema.methods.calculatePrice = function(quantity) {
  if (!quantity || quantity <= 0) return this.basePrice;
  
  // Check for price breaks (bulk pricing)
  if (this.priceBreaks && this.priceBreaks.length > 0) {
    // Sort price breaks by minimum quantity (descending)
    const sortedBreaks = this.priceBreaks.sort((a, b) => b.minQuantity - a.minQuantity);
    
    // Find applicable price break
    for (const priceBreak of sortedBreaks) {
      if (quantity >= priceBreak.minQuantity) {
        return priceBreak.pricePerUnit;
      }
    }
  }
  
  // Return base price if no price breaks apply
  return this.basePrice;
};

// Method to calculate total price for quantity
productSchema.methods.calculateTotalPrice = function(quantity) {
  return this.calculatePrice(quantity) * quantity;
};

// Pre-save middleware to set originalPrice and basePrice if not provided
productSchema.pre('save', function(next) {
  if (!this.originalPrice) {
    this.originalPrice = this.price;
  }
  
  if (!this.basePrice) {
    this.basePrice = this.price; // Set basePrice to current price if not provided
  }
  
  // Calculate discount percentage
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.discount = 0;
  }
  
  next();
});

module.exports = mongoose.model('Product', productSchema);
