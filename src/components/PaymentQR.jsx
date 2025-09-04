import { useState, useEffect } from 'react';

export default function PaymentQR({ orderData, totalAmount, onNext, onBack, currentStep, totalSteps }) {
  const [selectedUPI, setSelectedUPI] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');

  const upiApps = [
    { id: 'phonepe', name: 'PhonePe', icon: '📱', color: '#5f259f' },
    { id: 'googlepay', name: 'Google Pay', icon: '🟢', color: '#4285f4' },
    { id: 'paytm', name: 'Paytm', icon: '🔵', color: '#00baf2' },
    { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳', color: '#ff6b35' },
    { id: 'amazonpay', name: 'Amazon Pay', icon: '🛒', color: '#ff9900' }
  ];

  // Generate QR code data (in real app, this would be from payment gateway)
  const qrData = {
    upiId: 'pavithratraders@upi',
    amount: totalAmount,
    merchantName: 'Pavithra Traders',
    transactionNote: 'Payment for agricultural products'
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
                className={`upi-app ${selectedUPI === app.id ? 'selected' : ''}`}
                onClick={() => setSelectedUPI(app.id)}
                style={{ borderColor: selectedUPI === app.id ? app.color : '#e0e0e0' }}
              >
                <span className="upi-icon">{app.icon}</span>
                <span className="upi-name">{app.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* QR Code Display */}
        <div className="qr-code-section">
          <h4>Scan QR Code to Pay</h4>
          <div className="qr-code-container">
            <div className="qr-code-placeholder">
              <div className="qr-pattern">
                <div className="qr-corner top-left"></div>
                <div className="qr-corner top-right"></div>
                <div className="qr-corner bottom-left"></div>
                <div className="qr-corner bottom-right"></div>
                <div className="qr-center">
                  <span>QR</span>
                </div>
              </div>
            </div>
            <div className="qr-details">
              <p><strong>UPI ID:</strong> {qrData.upiId}</p>
              <p><strong>Merchant:</strong> {qrData.merchantName}</p>
              <p><strong>Amount:</strong> ₹{qrData.amount}</p>
            </div>
          </div>
        </div>

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
