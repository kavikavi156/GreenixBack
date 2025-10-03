const express = require('express');
const Product = require('../models/Product.js');
const User = require('../models/User.js');
const Order = require('../models/Order.js');
const router = express.Router();

// Customer: Prebook a product
router.post('/prebook/:productId', async (req, res) => {
  try {
    const { userId } = req.body;
    const { productId } = req.params;
    
    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create prebook order with new items format
    const order = new Order({
      user: userId,
      items: [{
        product: productId,
        quantity: 1,
        price: product.price
      }],
      totalAmount: product.price,
      status: 'prebooked',
    });
    
    await order.save();
    await Product.findByIdAndUpdate(productId, { $inc: { prebooked: 1 } });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Prebook error:', error);
    res.status(500).json({ error: 'Failed to prebook product' });
  }
});

// Customer: Add to cart with quantity
router.post('/cart/:userId/:productId', async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const { userId, productId } = req.params;
    
    // Validate that the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if product already exists in cart
    const existingCartItem = user.cart.find(item => 
      item.product.toString() === productId
    );

    if (existingCartItem) {
      // Update quantity if product already in cart
      existingCartItem.quantity += parseInt(quantity);
    } else {
      // Add new item to cart
      user.cart.push({
        product: productId,
        quantity: parseInt(quantity)
      });
    }

    await user.save();
    res.status(200).json({ message: 'Product added to cart', cart: user.cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Customer: Get cart contents
router.get('/cart/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('cart.product', 'name price image images category brand description originalPrice');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Filter out cart items with null or invalid products
    const validCartItems = user.cart.filter(item => item.product && item.product._id);
    
    // If we found invalid items, clean them from the database
    if (validCartItems.length !== user.cart.length) {
      console.log(`Cleaning ${user.cart.length - validCartItems.length} invalid cart items for user ${req.params.userId}`);
      user.cart = validCartItems;
      await user.save();
    }
    
    res.status(200).json({ items: validCartItems || [] });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to load cart' });
  }
});

// Customer: Update cart item quantity
router.put('/cart/:userId/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const { userId, productId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cartItem = user.cart.find(item => 
      item.product.toString() === productId
    );

    if (cartItem) {
      if (quantity > 0) {
        cartItem.quantity = parseInt(quantity);
      } else {
        // Remove item if quantity is 0
        user.cart = user.cart.filter(item => 
          item.product.toString() !== productId
        );
      }
      await user.save();
      res.status(200).json({ message: 'Cart updated', cart: user.cart });
    } else {
      res.status(404).json({ error: 'Product not found in cart' });
    }
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Customer: Remove item from cart
router.delete('/cart/:userId/:productId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.cart = user.cart.filter(item => 
      item.product.toString() !== req.params.productId
    );
    
    await user.save();
    res.status(200).json({ message: 'Product removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Customer: Clean up invalid cart items
router.post('/cart/:userId/cleanup', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('cart.product');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const originalLength = user.cart.length;
    user.cart = user.cart.filter(item => item.product && item.product._id);
    
    if (user.cart.length !== originalLength) {
      await user.save();
      const removed = originalLength - user.cart.length;
      res.status(200).json({ 
        message: `Cleaned up ${removed} invalid cart items`,
        removedCount: removed,
        currentCount: user.cart.length
      });
    } else {
      res.status(200).json({ 
        message: 'No invalid items found',
        removedCount: 0,
        currentCount: user.cart.length
      });
    }
  } catch (error) {
    console.error('Cart cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup cart' });
  }
});

// Customer: Clear entire cart
router.post('/cart/:userId/clear', async (req, res) => {
  try {
    console.log('Clear cart request received for userId:', req.params.userId);
    console.log('Request headers:', req.headers);
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.username, 'Current cart length:', user.cart.length);
    user.cart = [];
    await user.save();
    console.log('Cart cleared successfully for user:', user.username);
    
    res.status(200).json({ 
      message: 'Cart cleared successfully',
      currentCount: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to clear cart', details: error.message });
  }
});

// Customer: Order products in cart
router.post('/order/:userId', async (req, res) => {
  try {
    console.log('Order request received for userId:', req.params.userId);
    console.log('Order payload:', req.body);
    
    const user = await User.findById(req.params.userId).populate('cart.product');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get delivery address and payment method from request body
    const { paymentMethod = 'cod', deliveryAddress, status = 'ordered', cartItems } = req.body;
    
    console.log('User cart from DB:', user.cart);
    console.log('Cart items from request:', cartItems);

    // Use cart items from request if provided, otherwise use user's cart from DB
    let orderItems = [];
    let totalAmount = 0;
    
    if (cartItems && cartItems.length > 0) {
      // Frontend passed cart items directly
      console.log('Using cart items from frontend');
      
      for (const cartItem of cartItems) {
        if (!cartItem.product || !cartItem.product._id) {
          console.error('Invalid cart item:', cartItem);
          continue;
        }
        
        const itemTotal = (cartItem.product.price || 0) * (cartItem.quantity || 0);
        totalAmount += itemTotal;
        
        orderItems.push({
          product: cartItem.product._id,
          quantity: cartItem.quantity || 1,
          price: cartItem.product.price || 0
        });
      }
    } else if (user.cart && user.cart.length > 0) {
      // Use cart from database
      console.log('Using cart from database');
      
      orderItems = user.cart.map(cartItem => {
        const itemTotal = cartItem.product.price * cartItem.quantity;
        totalAmount += itemTotal;
        return {
          product: cartItem.product._id,
          quantity: cartItem.quantity,
          price: cartItem.product.price
        };
      });
    } else {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'No valid items to order' });
    }

    console.log('Creating order with items:', orderItems);
    console.log('Total amount:', totalAmount);

    const order = new Order({
      user: user._id,
      items: orderItems,
      products: orderItems.map(item => item.product), // For backward compatibility
      status: 'ordered', // Use valid enum value
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        address: deliveryAddress.street, // Map street to address
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
        landmark: deliveryAddress.landmark
      }
    });

    await order.save();
    console.log('Order saved successfully:', order._id);
    
    // Update product stock counts for each item in the order
    for (const orderItem of orderItems) {
      await Product.findByIdAndUpdate(
        orderItem.product,
        { 
          $inc: { 
            stock: -orderItem.quantity,
            sold: orderItem.quantity 
          }
        }
      );
    }
    console.log('Product stocks updated');
    
    // Clear cart after successful order (only if using DB cart)
    if (!cartItems) {
      user.cart = [];
      await user.save();
      console.log('User cart cleared');
    }
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ error: 'Failed to place order', details: error.message });
  }
});

// Customer: Add to wishlist
router.post('/wishlist/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if product already in wishlist
    const existingWishlistItem = user.wishlist.find(item => 
      item.product.toString() === productId
    );

    if (existingWishlistItem) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    user.wishlist.push({
      product: productId,
      addedAt: new Date()
    });

    await user.save();
    res.status(200).json({ message: 'Product added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Customer: Remove from wishlist
router.delete('/wishlist/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.wishlist = user.wishlist.filter(item => 
      item.product.toString() !== productId
    );
    
    await user.save();
    res.status(200).json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Customer: Get order history for tracking
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product', 'name price image images category brand description')
      .sort({ createdAt: -1 });
    
    if (!orders) {
      return res.status(404).json({ error: 'No orders found' });
    }
    
    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Customer: Handle preorder for out-of-stock items
router.post('/preorder/:productId', async (req, res) => {
  try {
    const { userId } = req.body;
    const { productId } = req.params;
    
    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is out of stock
    if (product.stock > 0) {
      return res.status(400).json({ error: 'Product is in stock, use regular order' });
    }

    // Create preorder
    const preorder = new Order({
      user: userId,
      products: [{
        product: productId,
        name: product.name,
        price: product.price,
        quantity: 1
      }],
      totalAmount: product.price,
      status: 'prebooked',
      paymentMethod: 'cod',
      deliveryAddress: {
        fullName: 'To be updated',
        phone: 'To be updated',
        address: 'To be updated',
        city: 'To be updated',
        state: 'To be updated',
        pincode: 'To be updated'
      }
    });
    
    await preorder.save();
    
    res.status(201).json({ 
      message: 'Preorder placed successfully. You will be notified when the product is back in stock.',
      preorder 
    });
  } catch (error) {
    console.error('Preorder error:', error);
    res.status(500).json({ error: 'Failed to place preorder' });
  }
});

// Customer: Get wishlist
router.get('/wishlist/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('wishlist.product', 'name price image images category brand description originalPrice');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ items: user.wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

// Debug endpoint to list all users
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email username role');
    return res.json({ 
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }))
    });
  } catch (error) {
    console.error('Debug users list error:', error);
    return res.status(500).json({ 
      error: 'Error listing users', 
      message: error.message
    });
  }
});

// Debug endpoint to check user existence
router.get('/debug/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Debug: Checking user ID:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ 
        exists: false, 
        message: 'User not found in database',
        searchedId: userId
      });
    }
    
    return res.json({ 
      exists: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Debug user check error:', error);
    return res.status(500).json({ 
      error: 'Error checking user', 
      message: error.message,
      searchedId: req.params.userId
    });
  }
});

module.exports = router;
