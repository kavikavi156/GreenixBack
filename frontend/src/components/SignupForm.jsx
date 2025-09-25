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

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting signup with:', { 
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role 
      });
      
      const res = await fetch('https://greenix-3.onrender.com/api/auth/register', {
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
          className="enhanced-input"
        />
      </div>
      
      <div className="input-group">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="enhanced-input"
        />
      </div>
      
      <div className="input-group">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="enhanced-input"
        />
      </div>
      
      <div className="input-group">
        <input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="enhanced-input"
        />
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
          className="enhanced-input"
        />
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
