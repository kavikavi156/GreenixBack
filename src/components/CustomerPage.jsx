import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm.jsx';
import SignupForm from './SignupForm.jsx';
import ProductList from './ProductList.jsx';
import Cart from './Cart.jsx';
import MyOrders from './MyOrders.jsx';
import React from 'react';

function ErrorFallback({ error }) {
  return (
    <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>
      <h2>Something went wrong with Cart</h2>
      <pre>{error?.message || String(error)}</pre>
      <p>Please try refreshing the page or contact support.</p>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default function CustomerPage() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('customerToken') || '');
  // Extract userId from JWT
  function getUserIdFromToken(token) {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  }
  const userId = getUserIdFromToken(token);
  const [showCart, setShowCart] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  function handleLogin(newToken) {
    setToken(newToken);
    localStorage.setItem('customerToken', newToken);
    setShowLogin(false);
    setShowLoginPrompt(false);
  }

  function handleLogout() {
    setToken('');
    localStorage.removeItem('customerToken');
    setShowCart(false);
    setShowMyOrders(false);
    setShowLogin(false);
    setShowSignup(false);
  }

  async function handleAddToCart(productId, quantity = 1) {
    console.log('CustomerPage handleAddToCart called with:', { productId, token: !!token, userId });
    
    if (!token || !userId) {
      console.log('User not logged in, showing login prompt');
      alert('Please login to add items to cart');
      setShowLoginPrompt(true);
      setShowLogin(true);
      return;
    }

    // Add item to cart with quantity 1 by default
    try {
      console.log('Making API call to add to cart');
      const res = await fetch(`http://localhost:3001/api/customer/cart/${userId}/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Add to cart successful:', data);
        alert('Added to cart! You can adjust quantity in the cart.');
      } else {
        const errorData = await res.json();
        console.error('Add to cart error:', errorData);
        alert(`Add to cart failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Add to cart failed: Network error. Please check your connection.');
    }
  }

  function handleSignup() {
    setShowSignup(false);
    setShowLogin(true);
  }

  try {
    return (
      <div className="flipkart-wrapper">
        {/* Header */}
        <header className="flipkart-header">
          <nav className="flipkart-nav">
            <Link to="/" className="flipkart-logo">
              Pavithra Traders
              <span>Explore Plus+</span>
            </Link>
            <div className="flipkart-actions">
              {token ? (
                <>
                  <button onClick={() => {
                    setShowCart(!showCart); 
                    setShowMyOrders(false);
                  }} className="flipkart-btn flipkart-btn-primary">
                    🛒 Cart
                  </button>
                  <button onClick={() => {setShowMyOrders(!showMyOrders); setShowCart(false);}} className="flipkart-btn flipkart-btn-primary">
                    📦 My Orders
                  </button>
                  <button onClick={handleLogout} className="flipkart-btn flipkart-btn-secondary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowLogin(true)} className="flipkart-btn flipkart-btn-primary">
                    Login
                  </button>
                  <Link to="/admin" className="flipkart-btn flipkart-btn-secondary">
                    Admin
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flipkart-main">
          <div className="flipkart-container">
            {showLoginPrompt && showLogin && (
              <div className="login-prompt">
                <div className="login-prompt-content">
                  <h3>Login Required</h3>
                  <p>Please login to add items to cart and place orders.</p>
                  <button onClick={() => { setShowLoginPrompt(false); setShowLogin(false); }} className="flipkart-btn flipkart-btn-secondary">
                    Continue Browsing
                  </button>
                </div>
              </div>
            )}

            {showSignup ? (
              <div className="form-center">
                <SignupForm role="customer" onSignup={handleSignup} />
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                  Already have an account?{' '}
                  <button onClick={() => { setShowSignup(false); setShowLogin(true); }} className="link-btn">Login</button>
                </p>
              </div>
            ) : showLogin && !showLoginPrompt ? (
              <div className="form-center">
                <LoginForm role="customer" onLogin={handleLogin} />
                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                  Don't have an account?{' '}
                  <button onClick={() => { setShowSignup(true); setShowLogin(false); }} className="link-btn">Sign up</button>
                </p>
              </div>
            ) : showCart && token ? (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  minWidth: '300px',
                  maxWidth: '80%',
                  maxHeight: '80%',
                  overflow: 'auto'
                }}>
                  <ErrorBoundary>
                    <Cart token={token} onClose={() => setShowCart(false)} />
                  </ErrorBoundary>
                </div>
              </div>
            ) : showMyOrders && token ? (
              <MyOrders token={token} onClose={() => setShowMyOrders(false)} />
            ) : (
              <>
                {!token && (
                  <div className="welcome-banner">
                    <h2>Welcome to Pavithra Traders</h2>
                    <p>Browse our products. Login to add items to cart and place orders.</p>
                  </div>
                )}
                <ProductList
                  token={token}
                  isAdmin={false}
                  onAddToCart={handleAddToCart}
                />
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="flipkart-footer">
          <div className="flipkart-footer-content">
            <p>&copy; {new Date().getFullYear()} Pavithra Traders. Professional e-commerce platform.</p>
          </div>
        </footer>
      </div>
    );
  } catch (err) {
    setHasError(true);
    setError(err);
    return <ErrorFallback error={err} />;
  }
}
