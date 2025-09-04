import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from './ProductList';
import AddProduct from './AddProduct';
import OrderManagement from './OrderManagement';
import LoginForm from './LoginForm';
import '../css/EnhancedAdmin.css';

export default function EnhancedAdminPage() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [showLogin, setShowLogin] = useState(!token);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  function handleLogin(newToken) {
    setToken(newToken);
    localStorage.setItem('adminToken', newToken);
    setShowLogin(false);
  }

  function handleLogout() {
    setToken('');
    localStorage.removeItem('adminToken');
    setShowLogin(true);
    setEditingProduct(null);
    setActiveTab('products');
  }

  function handleAddProduct(product) {
    setProducts(prev => [...prev, product]);
  }

  function handleEditProduct(product) {
    setEditingProduct(product);
  }

  function handleUpdateProduct(updatedProduct) {
    setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    setEditingProduct(null);
  }

  function handleCancelEdit() {
    setEditingProduct(null);
  }

  if (showLogin) {
    return (
      <div className="enhanced-admin-login">
        {/* Animated Background */}
        <div className="admin-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
          </div>
        </div>

        {/* Header */}
        <header className="admin-login-header">
          <nav className="admin-login-nav">
            <Link to="/" className="admin-logo">
              <span className="logo-icon">🛠️</span>
              <span className="logo-text">Pavithra Traders</span>
              <span className="logo-admin">Admin Panel</span>
            </Link>
            <Link to="/" className="back-btn">
              ← Back to Store
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="admin-login-main">
          <div className="admin-login-container">
            <div className="admin-login-content">
              <div className="admin-form-section">
                <div className="admin-form-card">
                  <div className="admin-form-header">
                    <h1 className="admin-form-title">Admin Access</h1>
                    <p className="admin-form-subtitle">
                      Secure login to manage your store, products, and orders
                    </p>
                  </div>

                  <div className="admin-form-container">
                    <LoginForm role="admin" onLogin={handleLogin} />
                  </div>

                  <div className="admin-security-notice">
                    <div className="security-icon">🔒</div>
                    <p>This is a secure admin area. All activities are logged.</p>
                  </div>
                </div>
              </div>

              <div className="admin-info-section">
                <div className="admin-info-content">
                  <h2 className="admin-info-title">Administrative Dashboard</h2>
                  <p className="admin-info-description">
                    Manage your agricultural business with powerful tools and 
                    comprehensive analytics for optimal performance.
                  </p>

                  <div className="admin-features-list">
                    <div className="admin-feature-item">
                      <span className="feature-icon">📦</span>
                      <div>
                        <h4>Product Management</h4>
                        <p>Add, edit, and organize your product catalog</p>
                      </div>
                    </div>
                    <div className="admin-feature-item">
                      <span className="feature-icon">📋</span>
                      <div>
                        <h4>Order Management</h4>
                        <p>Track and process customer orders efficiently</p>
                      </div>
                    </div>
                    <div className="admin-feature-item">
                      <span className="feature-icon">📊</span>
                      <div>
                        <h4>Analytics & Reports</h4>
                        <p>Monitor sales performance and trends</p>
                      </div>
                    </div>
                    <div className="admin-feature-item">
                      <span className="feature-icon">👥</span>
                      <div>
                        <h4>Customer Management</h4>
                        <p>View and manage customer accounts</p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-stats-section">
                    <div className="admin-stat-item">
                      <h3>Real-time</h3>
                      <p>Order Updates</p>
                    </div>
                    <div className="admin-stat-item">
                      <h3>24/7</h3>
                      <p>System Monitoring</p>
                    </div>
                    <div className="admin-stat-item">
                      <h3>Secure</h3>
                      <p>Data Protection</p>
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

  return (
    <div className="enhanced-admin-dashboard">
      {/* Header */}
      <header className="admin-dashboard-header">
        <nav className="admin-dashboard-nav">
          <div className="admin-nav-left">
            <div className="admin-logo-dashboard">
              <span className="logo-icon">🛠️</span>
              <span className="logo-text">Pavithra Traders</span>
              <span className="logo-admin">Admin</span>
            </div>
          </div>
          <div className="admin-nav-right">
            <Link to="/" className="dashboard-btn dashboard-btn-secondary">
              🏠 Customer View
            </Link>
            <button onClick={handleLogout} className="dashboard-btn dashboard-btn-primary">
              🚪 Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="admin-dashboard-main">
        <div className="admin-dashboard-container">
          <div className="admin-panel-enhanced">
            <div className="admin-panel-header">
              <h1 className="panel-title">Admin Dashboard</h1>
              <p className="panel-subtitle">Manage your agricultural business efficiently</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="admin-tabs-enhanced">
              <button 
                className={`tab-btn-enhanced ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <span className="tab-icon">📦</span>
                <span className="tab-text">Product Management</span>
              </button>
              <button 
                className={`tab-btn-enhanced ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <span className="tab-icon">📋</span>
                <span className="tab-text">Order Management</span>
              </button>
            </div>

            <div className="admin-content-enhanced">
              {activeTab === 'products' ? (
                <div className="products-section">
                  <AddProduct 
                    token={token} 
                    onAdd={handleAddProduct}
                    product={editingProduct}
                    onUpdate={handleUpdateProduct}
                    onCancel={handleCancelEdit}
                  />
                  <ProductList 
                    token={token} 
                    isAdmin={true}
                    onEdit={handleEditProduct}
                  />
                </div>
              ) : (
                <div className="orders-section">
                  <OrderManagement token={token} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="admin-dashboard-footer">
        <div className="admin-footer-content">
          <p>&copy; {new Date().getFullYear()} Pavithra Traders. Admin Dashboard - Secure & Reliable.</p>
        </div>
      </footer>
    </div>
  );
}
