import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from './ProductList';
import AddProduct from './AddProduct';
import OrderManagement from './OrderManagement';
import LoginForm from './LoginForm';
import EnhancedAdminDashboard from './EnhancedAdminDashboard';

export default function AdminPage() {
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

  return (
    <div className="flipkart-wrapper">
      {/* Header */}
      <header className="flipkart-header">
        <nav className="flipkart-nav">
          <Link to="/" className="flipkart-logo">
            Pavithra Traders
            <span>Admin Panel</span>
          </Link>
          <div className="flipkart-actions">
            {token ? (
              <>
                <Link to="/" className="flipkart-btn flipkart-btn-primary">
                  Customer View
                </Link>
                <button onClick={handleLogout} className="flipkart-btn flipkart-btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/" className="flipkart-btn flipkart-btn-primary">
                Back to Store
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flipkart-main">
        <div className="flipkart-container">
          {showLogin ? (
            <div className="admin-login-container">
              <div className="admin-login-header">
                <h2>Admin Login</h2>
                <p>Access your admin dashboard to manage products and orders</p>
              </div>
              <LoginForm role="admin" onLogin={handleLogin} />
            </div>
          ) : (
            <EnhancedAdminDashboard token={token} onLogout={handleLogout} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="flipkart-footer">
        <div className="flipkart-footer-content">
          <p>&copy; {new Date().getFullYear()} Pavithra Traders. Admin Dashboard.</p>
        </div>
      </footer>
    </div>
  );
}
