const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key', // Replace with your actual Razorpay Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret' // Replace with your actual Razorpay Key Secret
});

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    console.log('Creating Razorpay order with request body:', req.body);
    
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount provided'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise, ensure integer
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    console.log('Creating order with options:', options);

    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', order);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key'
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Verify Payment
router.post('/verify-payment', async (req, res) => {
  try {
    console.log('Verifying payment with data:', req.body);
    
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderDetails } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification data'
      });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'demo_secret')
      .update(sign.toString())
      .digest('hex');

    console.log('Expected signature:', expectedSign);
    console.log('Received signature:', razorpay_signature);

    if (razorpay_signature === expectedSign) {
      // Payment verified successfully
      console.log('Payment verification successful');
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      console.log('Payment verification failed - signature mismatch');
      res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
});

// Get payment details
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
});

// Refund payment
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // amount in paise
      speed: 'normal',
      notes: {
        reason: reason || 'Customer refund request'
      }
    });
    
    res.json({
      success: true,
      refund
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Refund failed',
      error: error.message
    });
  }
});

module.exports = router;
