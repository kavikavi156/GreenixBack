import { useState, useEffect } from 'react';

const RazorpayPayment = ({ orderData, onPaymentSuccess, onPaymentFailure, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (amount) => {
    try {
      const response = await fetch('http://localhost:3001/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await fetch('http://localhost:3001/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        return;
      }

      // Create order
      const orderResult = await createRazorpayOrder(orderData.totalAmount);
      if (!orderResult.success) {
        setError('Failed to create payment order. Please try again.');
        return;
      }

      // Configure Razorpay options
      const options = {
        key: orderResult.key,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: 'Greenix Store',
        description: 'Payment for your order',
        order_id: orderResult.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verificationResult = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: orderData,
            });

            if (verificationResult.success) {
              onPaymentSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
            } else {
              onPaymentFailure('Payment verification failed');
            }
          } catch (error) {
            onPaymentFailure('Payment verification failed');
          }
        },
        prefill: {
          name: orderData.address?.fullName || '',
          email: orderData.userEmail || '',
          contact: orderData.address?.phone || '',
        },
        theme: {
          color: '#2E7D32',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-initiate payment when component mounts
    if (orderData && orderData.totalAmount) {
      handlePayment();
    }
  }, []);

  return (
    <div className="razorpay-payment-container">
      <div className="payment-header">
        <h3>Complete Your Payment</h3>
        <p>Amount to pay: ₹{orderData.totalAmount}</p>
      </div>

      {loading && (
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>Processing payment...</p>
        </div>
      )}

      {error && (
        <div className="payment-error">
          <p>{error}</p>
          <button onClick={handlePayment} className="retry-btn">
            Retry Payment
          </button>
        </div>
      )}

      <div className="payment-info">
        <div className="security-info">
          <h4>🔒 Secure Payment</h4>
          <p>Your payment is secured by Razorpay with 256-bit SSL encryption</p>
        </div>
        
        <div className="payment-methods">
          <h4>Accepted Payment Methods:</h4>
          <div className="method-icons">
            <span>💳 Cards</span>
            <span>🏦 Net Banking</span>
            <span>📱 UPI</span>
            <span>📱 Wallets</span>
          </div>
        </div>
      </div>

      <div className="payment-actions">
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        {!loading && (
          <button onClick={handlePayment} className="pay-now-btn">
            Pay Now ₹{orderData.totalAmount}
          </button>
        )}
      </div>

      <style jsx>{`
        .razorpay-payment-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .payment-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .payment-header h3 {
          color: #2E7D32;
          margin-bottom: 8px;
        }

        .payment-header p {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }

        .payment-loading {
          text-align: center;
          padding: 20px;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #2E7D32;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .payment-error {
          background: #ffebee;
          border: 1px solid #ef5350;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
          text-align: center;
        }

        .payment-error p {
          color: #c62828;
          margin-bottom: 10px;
        }

        .retry-btn {
          background: #ef5350;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .payment-info {
          margin: 20px 0;
        }

        .security-info {
          background: #e8f5e8;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .security-info h4 {
          color: #2E7D32;
          margin-bottom: 5px;
        }

        .payment-methods h4 {
          margin-bottom: 10px;
        }

        .method-icons {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .method-icons span {
          background: #f5f5f5;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
        }

        .payment-actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .cancel-btn, .pay-now-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
        }

        .cancel-btn {
          background: #f5f5f5;
          color: #333;
        }

        .pay-now-btn {
          background: #2E7D32;
          color: white;
        }

        .pay-now-btn:hover {
          background: #1B5E20;
        }

        .cancel-btn:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
};

export default RazorpayPayment;
