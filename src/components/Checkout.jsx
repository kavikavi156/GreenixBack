import { useState, useEffect } from 'react';
import '../css/EcommerceStyles.css';
import AddressForm from './AddressForm';
import PaymentMethod from './PaymentMethod';
import PaymentQR from './PaymentQR';
import OrderSummary from './OrderSummary';
import Bill from './Bill';

export default function Checkout({ token, cartItems, totalAmount, onClose, onOrderComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    address: null,
    paymentMethod: null,
    paymentDetails: null,
    orderId: null
  });
  const [loading, setLoading] = useState(false);

  // Extract user info from JWT
  function getUserFromToken(token) {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  const user = getUserFromToken(token);

  const steps = [
    { id: 1, title: 'Delivery Address', component: AddressForm, icon: '📍' },
    { id: 2, title: 'Payment Method', component: PaymentMethod, icon: '💳' },
    { id: 3, title: 'Payment', component: PaymentQR, icon: '💰' },
    { id: 4, title: 'Order Summary', component: OrderSummary, icon: '📋' },
    { id: 5, title: 'Bill', component: Bill, icon: '🧾' }
  ];

  function handleNext(data) {
    console.log('Checkout handleNext called with data:', data);
    console.log('Current step before update:', currentStep);
    
    setLoading(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const newOrderData = { ...orderData, ...data };
      setOrderData(newOrderData);
      
      let nextStep = currentStep + 1;
      
      // Skip payment step for COD
      if (currentStep === 2 && data.paymentMethod === 'cod') {
        nextStep = 4; // Skip step 3 (PaymentQR) and go to step 4 (OrderSummary)
      }
      
      console.log('Moving to step:', nextStep);
      console.log('Available steps:', steps.length);
      
      // Ensure we don't go beyond the available steps
      if (nextStep <= steps.length) {
        setCurrentStep(nextStep);
        console.log('Successfully moved to step:', nextStep);
      } else {
        console.error('Trying to go beyond available steps. NextStep:', nextStep, 'Max steps:', steps.length);
        setLoading(false);
        return;
      }
      
      console.log('Updated order data:', newOrderData);
      setLoading(false);
    }, 300);
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function renderCurrentStep() {
    console.log('Rendering step:', currentStep, 'of', steps.length);
    
    const stepIndex = currentStep - 1;
    if (stepIndex < 0 || stepIndex >= steps.length) {
      console.error('Invalid step index:', stepIndex);
      return (
        <div className="error-container">
          <h3>Invalid Step</h3>
          <p>Something went wrong. Please try again.</p>
          <button onClick={() => setCurrentStep(1)}>Start Over</button>
        </div>
      );
    }
    
    const CurrentStepComponent = steps[stepIndex].component;
    
    return (
      <CurrentStepComponent
        token={token}
        user={user}
        cartItems={cartItems}
        totalAmount={totalAmount}
        orderData={orderData}
        onNext={handleNext}
        onBack={handleBack}
        onClose={onClose}
        onOrderComplete={onOrderComplete}
        currentStep={currentStep}
        totalSteps={steps.length}
        loading={loading}
      />
    );
  }

  if (loading) {
    return (
      <div className="checkout-overlay">
        <div className="checkout-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay">
      <div className="checkout-container modern">
        <div className="checkout-header">
          <h2>Secure Checkout</h2>
          <button className="close-checkout" onClick={onClose}>×</button>
        </div>

        {/* Progress Steps */}
        <div className="checkout-progress modern">
          {steps.map((step, index) => (
            <div key={step.id} className="progress-step-container">
              <div 
                className={`progress-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
              >
                <div className="step-circle">
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                <span className="step-title">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`step-connector ${currentStep > step.id ? 'completed' : ''}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="checkout-content">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}
