import { useState } from 'react';

export default function SignupForm({ role, onSignup }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Email validation function
  function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Password validation function
  function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    
    return {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar: hasNonalphas,
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers
    };
  }

  // Real-time validation
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear previous validation errors for this field
    setValidationErrors({
      ...validationErrors,
      [name]: ''
    });

    // Real-time validation
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address (e.g., user@example.com)'
        }));
      }
    }

    if (name === 'password' && value) {
      const passwordCheck = validatePassword(value);
      if (!passwordCheck.isValid) {
        let errorMsg = 'Password must contain: ';
        const requirements = [];
        if (!passwordCheck.minLength) requirements.push('at least 8 characters');
        if (!passwordCheck.hasUpperCase) requirements.push('uppercase letter');
        if (!passwordCheck.hasLowerCase) requirements.push('lowercase letter');
        if (!passwordCheck.hasNumbers) requirements.push('number');
        
        setValidationErrors(prev => ({
          ...prev,
          password: errorMsg + requirements.join(', ')
        }));
      }
    }

    if (name === 'confirmPassword' && value) {
      if (value !== formData.password) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
    }

    if (name === 'name' && value) {
      if (value.length < 2) {
        setValidationErrors(prev => ({
          ...prev,
          name: 'Name must be at least 2 characters long'
        }));
      }
    }

    if (name === 'username' && value) {
      if (value.length < 3) {
        setValidationErrors(prev => ({
          ...prev,
          username: 'Username must be at least 3 characters long'
        }));
      } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        setValidationErrors(prev => ({
          ...prev,
          username: 'Username can only contain letters, numbers, and underscores'
        }));
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Comprehensive validation
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address (e.g., user@example.com)';
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.isValid) {
        let errorMsg = 'Password must contain: ';
        const requirements = [];
        if (!passwordCheck.minLength) requirements.push('at least 8 characters');
        if (!passwordCheck.hasUpperCase) requirements.push('uppercase letter');
        if (!passwordCheck.hasLowerCase) requirements.push('lowercase letter');
        if (!passwordCheck.hasNumbers) requirements.push('number');
        errors.password = errorMsg + requirements.join(', ');
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the validation errors above');
      setIsLoading(false);
      return;
    }

    // Clear validation errors if all is good
    setValidationErrors({});

    try {
      console.log('Attempting signup with:', { 
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role 
      });
      
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name,
          email: formData.email,
          username: formData.username, 
          password: formData.password, 
          role 
        }),
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Response data:', data);
      
      setSuccess('Signup successful! You can now login.');
      // Reset form
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      });
      onSignup && onSignup();
    } catch (err) {
      console.error('Signup error:', err);
      setError(`Signup failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="enhanced-login-form">
      <h2 className="form-title-hidden">{role.charAt(0).toUpperCase() + role.slice(1)} Signup</h2>
      
      <div className="input-group">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={`enhanced-input ${validationErrors.name ? 'error' : ''}`}
        />
        {validationErrors.name && <span className="validation-error">{validationErrors.name}</span>}
      </div>
      
      <div className="input-group">
        <input
          type="email"
          name="email"
          placeholder="Email Address (e.g., user@example.com)"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={`enhanced-input ${validationErrors.email ? 'error' : ''}`}
        />
        {validationErrors.email && <span className="validation-error">{validationErrors.email}</span>}
      </div>
      
      <div className="input-group">
        <input
          type="text"
          name="username"
          placeholder="Username (letters, numbers, underscores only)"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={`enhanced-input ${validationErrors.username ? 'error' : ''}`}
        />
        {validationErrors.username && <span className="validation-error">{validationErrors.username}</span>}
      </div>
      
      <div className="input-group">
        <input
          type="password"
          name="password"
          placeholder="Password (8+ chars, uppercase, lowercase, number)"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={`enhanced-input ${validationErrors.password ? 'error' : ''}`}
        />
        {validationErrors.password && <span className="validation-error">{validationErrors.password}</span>}
        {formData.password && (
          <div className="password-strength">
            {(() => {
              const check = validatePassword(formData.password);
              return (
                <div className="strength-indicators">
                  <span className={`indicator ${check.minLength ? 'valid' : 'invalid'}`}>
                    ✓ 8+ characters
                  </span>
                  <span className={`indicator ${check.hasUpperCase ? 'valid' : 'invalid'}`}>
                    ✓ Uppercase letter
                  </span>
                  <span className={`indicator ${check.hasLowerCase ? 'valid' : 'invalid'}`}>
                    ✓ Lowercase letter
                  </span>
                  <span className={`indicator ${check.hasNumbers ? 'valid' : 'invalid'}`}>
                    ✓ Number
                  </span>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      
      <div className="input-group">
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={`enhanced-input ${validationErrors.confirmPassword ? 'error' : ''}`}
        />
        {validationErrors.confirmPassword && <span className="validation-error">{validationErrors.confirmPassword}</span>}
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="enhanced-submit-btn"
      >
        {isLoading ? (
          <span className="loading-content">
            <span className="spinner"></span>
            Creating account...
          </span>
        ) : (
          `Create ${role === 'admin' ? 'Admin' : 'Customer'} Account`
        )}
      </button>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <p>{success}</p>
        </div>
      )}
    </form>
  );
}
