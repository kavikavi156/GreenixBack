import { useState } from 'react';

export default function PaymentMethod({ orderData, onNext, onBack, currentStep, totalSteps }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    onNext({ paymentMethod });
  }

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay using PhonePe, Google Pay, Paytm, etc.',
      icon: '📱'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay using your bank account',
      icon: '🏦'
    },
    {
      id: 'cards',
      name: 'Credit/Debit Cards',
      description: 'Pay using Visa, Mastercard, RuPay',
      icon: '💳'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives',
      icon: '💵'
    }
  ];

  return (
    <div className="payment-method-container">
      <h3>Select Payment Method</h3>
      
      <form onSubmit={handleSubmit} className="payment-method-form">
        <div className="payment-options">
          {paymentMethods.map((method) => (
            <label key={method.id} className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="payment-option-content">
                <div className="payment-icon">{method.icon}</div>
                <div className="payment-details">
                  <h4>{method.name}</h4>
                  <p>{method.description}</p>
                </div>
                <div className="radio-check">
                  {paymentMethod === method.id && <span className="checkmark">✓</span>}
                </div>
              </div>
            </label>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="btn-primary">
            {paymentMethod === 'cod' ? 'Place Order' : 'Continue to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}
