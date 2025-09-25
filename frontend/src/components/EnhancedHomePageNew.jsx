import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import EnhancedCart from './EnhancedCart.jsx';
import MyOrders from './MyOrders.jsx';
import ProductDetails from './ProductDetails.jsx';
import '../css/ProfessionalEcommerce.css';
import '../css/Overlays.css';

export default function EnhancedHomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [showMyOrders, setShowMyOrders] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const navigate = useNavigate();

  // Helper function to get product icon based on category
  function getProductIcon(category) {
    const icons = {
      'fertilizers': '🌱',
      'seeds': '🌾',
      'pesticides': '🦟',
      'tools': '🔧',
      'irrigation': '💧',
      'organic': '🍃'
    };
    return icons[category] || '📦';
  }

  useEffect(() => {
    checkAuthStatus();
    fetchProducts();
    if (isLoggedIn) {
      fetchCartCounts();
    }
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy, searchTerm]);

  function checkAuthStatus() {
    const token = localStorage.getItem('customerToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp > Date.now() / 1000) {
          setIsLoggedIn(true);
          // Set user information from token
          setUser({
            name: decodedToken.name || 'Customer',
            email: decodedToken.email || '',
            id: decodedToken.userId || decodedToken.id
          });
        } else {
          localStorage.removeItem('customerToken');
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem('customerToken');
        setUser(null);
      }
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch('https://greenix-3.onrender.com/api/products');
      const data = await response.json();
      console.log('Fetched products:', data);
      setProducts(data.products || data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  async function fetchCartCounts() {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      // Fetch cart count
      const cartRes = await fetch(`https://greenix-3.onrender.com/api/customer/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        console.log('Cart data:', cartData);
        setCartCount(cartData.items?.length || 0);
        setCartItems(cartData.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart counts:', error);
    }
  }

  function filterAndSortProducts() {
    let filtered = products;
    console.log('Filtering products:', { 
      totalProducts: products.length, 
      selectedCategory, 
      searchTerm,
      availableCategories: [...new Set(products.map(p => p.category))]
    });

    // Filter by category (case-insensitive)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const productCategory = product.category?.toLowerCase() || '';
        const selectedCat = selectedCategory.toLowerCase();
        const matches = productCategory === selectedCat || productCategory.includes(selectedCat);
        if (!matches) {
          console.log('Category mismatch:', { productCategory: product.category, selectedCategory });
        }
        return matches;
      });
      console.log('After category filter:', filtered.length);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }

  async function handleAddToCart(productId, quantity = 1) {
    if (!isLoggedIn) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    try {
      const token = localStorage.getItem('customerToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await fetch(`https://greenix-3.onrender.com/api/customer/cart/${userId}/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: quantity })
      });

      if (response.ok) {
        alert('Product added to cart successfully!');
        fetchCartCounts();
      } else {
        const errorData = await response.json();
        if (errorData.error === 'User not found') {
          alert('Session expired. Please login again.');
          localStorage.removeItem('customerToken');
          setIsLoggedIn(false);
          navigate('/login');
        } else {
          alert(`Failed to add product to cart: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart. Please try again.');
    }
  }

  function handlePreorder(productId) {
    alert('Pre-order functionality coming soon! This product will be available for pre-booking.');
  }

  function handleProductClick(productId) {
    setSelectedProductId(productId);
  }

  async function removeFromCart(itemId) {
    try {
      const token = localStorage.getItem('customerToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await fetch(`https://greenix-3.onrender.com/api/customer/cart/${userId}/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCartCounts();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  return (
    <div className="enhanced-home">
      {/* Professional Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <Link to="/" className="logo">
              <span className="logo-icon">🌾</span>
              <span>Pavithra Traders</span>
            </Link>
          </div>
          
          <div className="nav-actions">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="user-actions">
              {isLoggedIn ? (
                <>
                  <div className="user-welcome">
                    <span className="user-greeting">Welcome, {user?.name || 'Customer'}</span>
                  </div>
                  <div className="cart-wishlist-icons">
                    <button 
                      onClick={() => setShowCart(true)}
                      className="icon-button"
                    >
                      🛒
                      {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
                    </button>
                    <button 
                      onClick={() => setShowMyOrders(true)}
                      className="icon-button"
                    >
                      📦
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('customerToken');
                      setIsLoggedIn(false);
                      setCartCount(0);
                      setUser(null);
                    }} 
                    className="auth-button logout-button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="auth-button login-button">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Products Section */}
      <div className="products-section">
        <div className="section-title">
          <h2>Our Products</h2>
          <p>Premium quality agricultural products for your farming needs</p>
        </div>
        
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product._id} className="product-card">
                <div 
                  className="product-image-container"
                  onClick={() => handleProductClick(product._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={product.image?.startsWith('http') 
                      ? product.image 
                      : `https://greenix-3.onrender.com/uploads/${product.image}`
                    }
                    alt={product.name}
                    className="product-image"
                    onLoad={(e) => {
                      console.log('Image loaded successfully for:', product.name, 'URL:', e.target.src);
                    }}
                    onError={(e) => {
                      console.log('Image load error for:', product.name, 'URL:', e.target.src);
                      console.log('Product data:', product);
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23f1f5f9" width="200" height="200"/><text fill="%236b7280" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="40">${getProductIcon(product.category)}</text></svg>`;
                    }}
                  />
                  <div className="product-badge">{product.category}</div>
                  <div className={`stock-indicator ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                  </div>
                </div>
                
                <div 
                  className="product-info"
                  onClick={() => handleProductClick(product._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description?.substring(0, 100)}...</p>
                  <div className="product-price">₹{product.price}</div>
                  <div className="view-details-hint">👁️ Click to view details</div>
                  
                  <div className="product-actions">
                    {product.stock > 0 ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        className="add-to-cart-btn"
                      >
                        🛒 Add to Cart
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreorder(product._id);
                        }}
                        className="add-to-cart-btn preorder-btn"
                      >
                        📋 Pre-order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Cart Component */}
      <EnhancedCart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)}
        onCartUpdate={(count) => {
          console.log('Cart count updated to:', count);
          setCartCount(count);
        }}
      />

      {/* My Orders Component */}
      {showMyOrders && (
        <MyOrders 
          token={localStorage.getItem('customerToken')} 
          onClose={() => setShowMyOrders(false)} 
        />
      )}

      {/* Product Details Modal */}
      {selectedProductId && (
        <ProductDetails
          productId={selectedProductId}
          token={localStorage.getItem('customerToken')}
          onClose={() => setSelectedProductId(null)}
          onAddToCart={(cartItem) => {
            // Handle the new cart item structure
            if (typeof cartItem === 'object' && cartItem.productId) {
              handleAddToCart(cartItem.productId, cartItem.quantity || 1);
            } else {
              // Fallback for legacy calls
              handleAddToCart(cartItem, 1);
            }
            setSelectedProductId(null);
          }}
        />
      )}

      {/* Professional Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        marginTop: '64px',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Main Footer Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '48px 24px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '20px', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🌱 Pavithra Traders
            </h3>
            <p style={{ 
              margin: '0 0 16px 0', 
              lineHeight: '1.6', 
              opacity: '0.9',
              fontSize: '14px'
            }}>
              Leading supplier of high-quality agricultural products, seeds, fertilizers, and farming tools. 
              Committed to supporting farmers with premium products for better yields.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <span style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '8px 12px', 
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                🏆 Premium Quality
              </span>
              <span style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                padding: '8px 12px', 
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                🚚 Fast Delivery
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
              Quick Links
            </h4>
            <ul style={{ margin: '0', padding: '0', listStyle: 'none' }}>
              {['All Products', 'Seeds', 'Fertilizers', 'Herbicides', 'Tools', 'New Arrivals'].map(link => (
                <li key={link} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
              Contact Information
            </h4>
            <div style={{ fontSize: '14px', lineHeight: '1.8', opacity: '0.9' }}>
              <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 Agricultural Market, Main Street
              </p>
              <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📞 +91 98765 43210
              </p>
              <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✉️ info@pavithratraders.com
              </p>
              <p style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🕒 Mon-Sat: 9:00 AM - 7:00 PM
              </p>
            </div>
            
            {/* Social Links */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {['📘', '📷', '🐦', '📱'].map((icon, idx) => (
                <a key={idx} href="#" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  textDecoration: 'none',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'scale(1)';
                }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: '0.8' }}>
            © 2025 Pavithra Traders. All rights reserved.
          </p>
          <p style={{ margin: '0', fontSize: '12px', opacity: '0.6' }}>
            Empowering Agriculture • Growing Together • Quality Assured
          </p>
        </div>
      </footer>
    </div>
  );
}
