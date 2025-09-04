import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm.jsx';
import SignupForm from './SignupForm.jsx';
import '../css/EnhancedLogin.css';

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  function handleLogin(token) {
    // Store token in localStorage
    localStorage.setItem('customerToken', token);
    // Redirect back to enhanced home page
    navigate('/');
  }

  function handleSignup() {
    // After successful signup, switch to login form
    setShowSignup(false);
  }

  return (
    <div className="enhanced-login-page">
      {/* Animated Background */}
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Header */}
      <header className="login-header">
        <nav className="login-nav">
          <Link to="/" className="login-logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">Pavithra Traders</span>
          </Link>
          <Link to="/" className="back-btn">
            ← Back to Home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-container">
          <div className="login-content">
            <div className="login-form-section">
              <div className="form-card">
                <div className="form-header">
                  <h1 className="form-title">
                    {showSignup ? 'Join Pavithra Traders' : 'Welcome Back'}
                  </h1>
                  <p className="form-subtitle">
                    {showSignup 
                      ? 'Create your account to start shopping premium agricultural products'
                      : 'Sign in to access your account and continue shopping'
                    }
                  </p>
                </div>

                <div className="form-container">
                  {showSignup ? (
                    <div className="form-wrapper">
                      <SignupForm role="customer" onSignup={handleSignup} />
                      <div className="form-switch">
                        <p>
                          Already have an account?{' '}
                          <button 
                            onClick={() => setShowSignup(false)} 
                            className="switch-btn"
                          >
                            Sign in here
                          </button>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="form-wrapper">
                      <LoginForm role="customer" onLogin={handleLogin} />
                      <div className="form-switch">
                        <p>
                          Don't have an account?{' '}
                          <button 
                            onClick={() => setShowSignup(true)} 
                            className="switch-btn"
                          >
                            Create account
                          </button>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="login-info-section">
              <div className="info-content">
                <h2 className="info-title">Premium Agricultural Products</h2>
                <p className="info-description">
                  Join thousands of farmers and agricultural businesses who trust 
                  Pavithra Traders for quality products and exceptional service.
                </p>

                <div className="benefits-list">
                  <div className="benefit-item">
                    <span className="benefit-icon">✨</span>
                    <div>
                      <h4>Quality Guaranteed</h4>
                      <p>Premium products from verified suppliers</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🚚</span>
                    <div>
                      <h4>Fast Delivery</h4>
                      <p>Quick delivery across the region</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">💰</span>
                    <div>
                      <h4>Best Prices</h4>
                      <p>Competitive pricing with great deals</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <span className="benefit-icon">🛡️</span>
                    <div>
                      <h4>Secure Shopping</h4>
                      <p>Safe and secure payment processing</p>
                    </div>
                  </div>
                </div>

                <div className="stats-section">
                  <div className="stat-item">
                    <h3>10,000+</h3>
                    <p>Happy Customers</p>
                  </div>
                  <div className="stat-item">
                    <h3>500+</h3>
                    <p>Products</p>
                  </div>
                  <div className="stat-item">
                    <h3>50+</h3>
                    <p>Cities Served</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
