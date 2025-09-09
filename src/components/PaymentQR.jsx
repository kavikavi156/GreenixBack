import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function PaymentQR({ orderData, totalAmount, onNext, onBack, currentStep, totalSteps }) {
  const [selectedUPI, setSelectedUPI] = useState('googlepay'); // Default to Google Pay
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const upiApps = [
    { id: 'phonepe', name: 'PhonePe', icon: '📱', color: '#5f259f' },
    { id: 'googlepay', name: 'Google Pay', icon: '🟢', color: '#4285f4' },
    { id: 'paytm', name: 'Paytm', icon: '🔵', color: '#00baf2' }
  ];

  // Generate QR code data (using your actual UPI details)
  const qrData = {
    upiId: 'kavinesh948-1@okhdfcbank',
    amount: totalAmount,
    merchantName: 'Kavinesh V',
    transactionNote: 'Payment for agricultural products'
  };

  // Generate QR code from UPI URL
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Standard UPI URL format for better compatibility
        const upiUrl = `upi://pay?pa=${qrData.upiId}&pn=${encodeURIComponent(qrData.merchantName)}&am=${qrData.amount}&cu=INR&tn=${encodeURIComponent(qrData.transactionNote)}&mc=0000&tid=0000&tr=0000`;
        
        const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (err) {
        console.error('QR Code generation failed:', err);
      }
    };

    // Only generate QR if amount is valid (minimum ₹1)
    if (qrData.amount && qrData.amount >= 1) {
      generateQRCode();
    }
  }, [totalAmount]);

  // Generate UPI payment URL for direct app opening
  const generateUPIUrl = (app) => {
    // Standard UPI URL with additional parameters for better compatibility
    const baseUrl = `upi://pay?pa=${qrData.upiId}&pn=${encodeURIComponent(qrData.merchantName)}&am=${qrData.amount}&cu=INR&tn=${encodeURIComponent(qrData.transactionNote)}&mc=0000&tid=0000&tr=0000`;
    
    switch(app) {
      case 'googlepay':
        // GPay specific URL format
        return `tez://upi/pay?pa=${qrData.upiId}&pn=${encodeURIComponent(qrData.merchantName)}&am=${qrData.amount}&cu=INR&tn=${encodeURIComponent(qrData.transactionNote)}`;
      case 'phonepe':
        // PhonePe specific URL format
        return `phonepe://pay?pa=${qrData.upiId}&pn=${encodeURIComponent(qrData.merchantName)}&am=${qrData.amount}&cu=INR&tn=${encodeURIComponent(qrData.transactionNote)}`;
      case 'paytm':
        // Paytm specific URL format
        return `paytmmp://pay?pa=${qrData.upiId}&pn=${encodeURIComponent(qrData.merchantName)}&am=${qrData.amount}&cu=INR&tn=${encodeURIComponent(qrData.transactionNote)}`;
      default:
        return baseUrl;
    }
  };

  const handleUPIAppClick = (appId) => {
    setSelectedUPI(appId);
    
    // Check minimum amount before proceeding
    if (totalAmount < 1) {
      setError('Minimum payment amount is ₹1. Please add more items to your cart.');
      return;
    }
    
    // Clear any existing errors
    setError('');
    
    // If GPay is selected, use Razorpay integration
    if (appId === 'googlepay') {
      handleRazorpayGPayPayment();
      return;
    }
    
    // For other UPI apps, use direct UPI URL
    const upiUrl = generateUPIUrl(appId);
    
    try {
      // Create a temporary link to trigger the UPI app
      const link = document.createElement('a');
      link.href = upiUrl;
      link.target = '_blank';
      link.click();
      
      // Show success message
      console.log(`Opening ${appId} with URL:`, upiUrl);
      
    } catch (error) {
      console.error('Error opening UPI app:', error);
      setError(`Unable to open ${appId}. Please use manual UPI ID or try scanning the QR code.`);
    }
  };

  // Razorpay GPay Integration
  const handleRazorpayGPayPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Create order on backend
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          receipt: `receipt_${Date.now()}`
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => initializeRazorpay(orderData);
        script.onerror = () => {
          setError('Failed to load Razorpay. Please try again.');
          setIsProcessingPayment(false);
        };
        document.body.appendChild(script);
      } else {
        initializeRazorpay(orderData);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to initialize payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const initializeRazorpay = (orderData) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Pavithra Traders',
      description: 'Payment for agricultural products',
      order_id: orderData.orderId,
      prefill: {
        name: orderData.customerInfo?.name || 'Customer',
        email: orderData.customerInfo?.email || '',
        contact: orderData.customerInfo?.phone || ''
      },
      method: {
        upi: true,
        wallet: false,
        netbanking: false,
        card: false
      },
      config: {
        display: {
          blocks: {
            utib: {
              name: 'Pay using UPI',
              instruments: [
                {
                  method: 'upi',
                  flows: ['intent'] // This will open GPay app directly
                }
              ]
            }
          },
          sequence: ['block.utib'],
          preferences: {
            show_default_blocks: false
          }
        }
      },
      handler: function (response) {
        // Payment successful
        setIsProcessingPayment(false);
        setTransactionId(response.razorpay_payment_id);
        
        // Auto-confirm the payment
        const paymentDetails = {
          method: 'upi',
          upiApp: 'googlepay',
          transactionId: response.razorpay_payment_id,
          amount: totalAmount,
          timestamp: new Date().toISOString(),
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature
        };
        
        onNext({ paymentDetails, paymentCompleted: true });
      },
      modal: {
        ondismiss: function() {
          setIsProcessingPayment(false);
          setError('Payment was cancelled. Please try again.');
        }
      },
      theme: {
        color: '#4caf50'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  function handlePaymentConfirm() {
    if (!transactionId.trim()) {
      setError('Please enter transaction ID');
      return;
    }

    if (transactionId.length < 6) {
      setError('Transaction ID must be at least 6 characters');
      return;
    }

    const paymentDetails = {
      method: orderData.paymentMethod,
      upiApp: selectedUPI,
      transactionId: transactionId,
      amount: totalAmount,
      timestamp: new Date().toISOString()
    };

    onNext({ paymentDetails, paymentCompleted: true });
  }

  if (orderData.paymentMethod === 'cod') {
    // Skip this step for COD
    useEffect(() => {
      onNext({ paymentDetails: { method: 'cod' }, paymentCompleted: true });
    }, []);
    return null;
  }

  return (
    <div className="payment-qr-container">
      <h3>Complete Payment</h3>
      
      <div className="payment-details">
        <div className="amount-display">
          <h2>₹{totalAmount}</h2>
          <p>Amount to Pay</p>
        </div>

        {/* UPI App Selection */}
        <div className="upi-selection">
          <h4>Choose your UPI app:</h4>
          <div className="upi-apps">
            {upiApps.map((app) => (
              <button
                key={app.id}
                className={`upi-app ${selectedUPI === app.id ? 'selected' : ''} ${isProcessingPayment && app.id === 'googlepay' ? 'processing' : ''}`}
                onClick={() => handleUPIAppClick(app.id)}
                disabled={isProcessingPayment && app.id === 'googlepay'}
                style={{ borderColor: selectedUPI === app.id ? app.color : '#e0e0e0' }}
              >
                <span className="upi-icon">{app.icon}</span>
                <span className="upi-name">
                  {app.name}
                  {isProcessingPayment && app.id === 'googlepay' && <span> (Processing...)</span>}
                </span>
                {app.id === 'googlepay' && !isProcessingPayment && <span className="recommended">✨ Recommended</span>}
                {app.id === 'googlepay' && <span className="razorpay-badge">🔒 Secure Payment</span>}
              </button>
            ))}
          </div>
          <p className="upi-hint">
            {selectedUPI === 'googlepay' 
              ? 'Click GPay to open secure Razorpay payment gateway that will redirect to your GPay app' 
              : 'Click on your preferred UPI app to open it directly for payment'
            }
          </p>
        </div>

        {/* QR Code Display - Only for Google Pay */}
        {selectedUPI === 'googlepay' && (
          <div className="qr-code-section">
            <h4>Scan GPay QR Code to Pay</h4>
            
            {/* Check minimum amount */}
            {totalAmount < 1 ? (
              <div className="amount-warning">
                <p style={{color: '#ff6b35', fontWeight: 'bold'}}>
                  ⚠️ Minimum payment amount is ₹1. Current amount: ₹{totalAmount}
                </p>
                <p>Please add more items to your cart to meet the minimum payment requirement.</p>
              </div>
            ) : (
              <div className="qr-code-container">
                <div className="qr-code-display">
                  {/* Show generated QR Code with your UPI details */}
                  {qrCodeUrl && (
                    <img 
                      src={qrCodeUrl}
                      alt="Kavinesh V - GPay QR Code"
                      className="qr-code-image"
                    />
                  )}
                  
                  {/* Loading placeholder while generating QR */}
                  {!qrCodeUrl && (
                    <div className="qr-code-placeholder">
                      <div className="qr-pattern">
                        <div className="qr-corner top-left"></div>
                        <div className="qr-corner top-right"></div>
                        <div className="qr-corner bottom-left"></div>
                        <div className="qr-corner bottom-right"></div>
                        <div className="qr-center">
                          <span>Generating QR...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="qr-details">
                  <p><strong>UPI ID:</strong> {qrData.upiId}</p>
                  <p><strong>Merchant:</strong> Kavinesh V</p>
                  <p><strong>Amount:</strong> ₹{qrData.amount}</p>
                  <p className="scan-instruction">Open GPay and scan this QR code to pay</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual UPI ID */}
        <div className="manual-upi">
          <h4>Or pay manually using UPI ID:</h4>
          <div className="upi-id-copy">
            <input 
              type="text" 
              value={qrData.upiId} 
              readOnly 
              className="upi-id-input"
            />
            <button 
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(qrData.upiId)}
            >
              Copy
            </button>
          </div>
        </div>

        {/* Transaction Confirmation */}
        <div className="transaction-confirmation">
          <h4>After making payment, enter transaction ID:</h4>
          <input
            type="text"
            placeholder="Enter Transaction ID / Reference Number"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="transaction-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            Back
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handlePaymentConfirm}
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}
