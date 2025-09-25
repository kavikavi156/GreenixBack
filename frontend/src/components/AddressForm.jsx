import { useState } from 'react';
import '../css/EcommerceStyles.css';

export default function AddressForm({ user, onNext, onBack, onClose, currentStep, totalSteps, loading }) {
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    let value = e.target.value;
    
    // Handle phone number - only allow digits
    if (e.target.name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Handle pincode - only allow digits
    if (e.target.name === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    
    setAddress({
      ...address,
      [e.target.name]: value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    console.log('Address form submission:', address);

    // Validation
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      const missingFields = [];
      if (!address.fullName) missingFields.push('Full Name');
      if (!address.phone) missingFields.push('Phone');
      if (!address.street) missingFields.push('Street');
      if (!address.city) missingFields.push('City');
      if (!address.state) missingFields.push('State');
      if (!address.pincode) missingFields.push('Pincode');
      
      const errorMsg = `Please fill required fields: ${missingFields.join(', ')}`;
      console.log('Validation error:', errorMsg);
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }

    // More flexible phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(address.phone.replace(/\D/g, ''))) {
      const errorMsg = 'Phone number must be 10 digits';
      console.log('Phone validation error:', errorMsg);
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }

    // More flexible pincode validation  
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(address.pincode.replace(/\D/g, ''))) {
      const errorMsg = 'Pincode must be 6 digits';
      console.log('Pincode validation error:', errorMsg);
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }

    console.log('Address validation passed, calling onNext');
    onNext({ address });
    setIsSubmitting(false);
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h3>📍 Delivery Address</h3>
        <p>Enter your delivery address details</p>
      </div>
      
      <form onSubmit={handleSubmit} className="address-form modern">
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={address.fullName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter 10-digit phone number"
              value={address.phone}
              onChange={handleChange}
              maxLength="10"
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Street Address *</label>
          <input
            type="text"
            name="street"
            placeholder="House/Flat no, Building, Street"
            value={address.street}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Landmark (Optional)</label>
          <input
            type="text"
            name="landmark"
            placeholder="Nearby landmark for easy delivery"
            value={address.landmark}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-grid three-col">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Pincode *</label>
            <input
              type="text"
              name="pincode"
              placeholder="6-digit pincode"
              value={address.pincode}
              onChange={handleChange}
              maxLength="6"
              required
              className="form-input"
            />
          </div>
        </div>

        {error && (
          <div className="error-message modern">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="form-actions modern">
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                Continue to Payment
                <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
