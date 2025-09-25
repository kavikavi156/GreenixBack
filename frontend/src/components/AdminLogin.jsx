import React, { useState } from 'react';
import '../css/AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'admin') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.token, data.user);
      } else {
        setError('Invalid credentials or insufficient permissions');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-login-container">
      {/* Background Elements */}
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Welcome Header */}
        <div className="login-header">
          <div className="admin-icon">
            <div className="icon-circle">
              <span className="crown-icon">👑</span>
            </div>
          </div>
          <h1>Welcome Back, Admin!</h1>
          <p>Please sign in to access your dashboard</p>
        </div>

        {/* Company Branding */}
        <div className="company-branding">
          <div className="logo-container">
            <span className="logo-text">🌱 Pavithra Traders</span>
          </div>
          <div className="tagline">Agricultural Excellence & Innovation</div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="input-group">
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                className="login-input"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                className="login-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`login-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Signing In...
              </>
            ) : (
              <>
                <span className="login-icon">🚀</span>
                Access Dashboard
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="notice-icon">🔐</div>
          <span>Secure Administrator Access Only</span>
        </div>

        {/* Features Preview */}
        <div className="features-preview">
          <h3>What awaits you:</h3>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Sales Analytics & Reports</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛍️</span>
              <span>Product Management</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>Customer & Order Management</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚙️</span>
              <span>System Administration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <p>© 2025 Pavithra Traders - Agricultural Solutions</p>
        <div className="footer-links">
          <span>🌱 Growing Excellence Together</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;