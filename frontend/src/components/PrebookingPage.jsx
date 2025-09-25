import React, { useState, useEffect } from 'react';

export default function PrebookingPage({ token, user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [prebookingInProgress, setPrebookingInProgress] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch('https://greenix-3.onrender.com/api/products');
      if (res.ok) {
        const data = await res.json();
        const productsArray = data.products || data;
        
        setProducts(productsArray);
        
        const uniqueCategories = [...new Set(productsArray.map(p => p.category))];
        setCategories(uniqueCategories);
        setError('');
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  async function handlePrebook(productId) {
    if (!token || !user?.userId) {
      alert('Please login to prebook products');
      return;
    }

    setPrebookingInProgress(prev => ({ ...prev, [productId]: true }));

    try {
      const res = await fetch(`https://greenix-3.onrender.com/api/customer/prebook/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.userId }),
      });
      
      if (res.ok) {
        alert('Product prebooked successfully! ✅');
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert(`Prebook failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Prebook error:', err);
      alert('Failed to prebook product');
    } finally {
      setPrebookingInProgress(prev => ({ ...prev, [productId]: false }));
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return (b.prebooked || 0) - (a.prebooked || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      default:
        return (b.prebooked || 0) - (a.prebooked || 0);
    }
  });

  if (loading) {
    return (
      <div className="prebooking-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading available products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prebooking-page">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prebooking-page">
      <div className="page-header">
        <h1>🎯 Pre-Book Products</h1>
        <p>Reserve your favorite products and see prebooking demand!</p>
        <div className="stats-summary">
          <span className="stat-item">
            📦 {products.length} Products Available
          </span>
          <span className="stat-item">
            🎯 {products.reduce((total, product) => total + (product.prebooked || 0), 0)} Total Prebookings
          </span>
          <span className="stat-item">
            📊 {products.filter(p => (p.prebooked || 0) > 0).length} Products with Prebookings
          </span>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filter">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-filter">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="category-select"
          >
            <option value="popularity">🔥 Most Popular</option>
            <option value="name">📝 Name (A-Z)</option>
            <option value="price">💰 Price (Low to High)</option>
            <option value="price-desc">💎 Price (High to Low)</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">📭</div>
          <h3>No Products Available</h3>
          <p>
            {searchTerm || selectedCategory !== 'all' 
              ? 'No products match your current filters. Try adjusting your search.'
              : 'No products are currently available.'}
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product._id} className="product-card prebooking-card">
              <div className="product-image-container">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={`https://greenix-3.onrender.com/uploads/product.images[0]`} 
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200/f0f0f0/666?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <span>📷</span>
                    <p>No Image</p>
                  </div>
                )}
                <div className="prebooking-badge">
                  🎯 Pre-Book Available
                </div>
                {(product.prebooked || 0) > 0 && (
                  <div className="popularity-badge">
                    🔥 {product.prebooked} prebookings!
                  </div>
                )}
              </div>

              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3 className="product-name">{product.name}</h3>
                
                <div className="product-pricing">
                  <span className="product-price">₹{product.price?.toLocaleString()}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                <div className="product-stats">
                  <div className="stat">
                    <span className="stat-label">Stock:</span>
                    <span className="stat-value">{product.stock || 0}</span>
                  </div>
                  <div className="stat prebooking-stat">
                    <span className="stat-label">🎯 Prebookings:</span>
                    <span className="stat-value highlight-count">{product.prebooked || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Sold:</span>
                    <span className="stat-value">{product.sold || 0}</span>
                  </div>
                  {product.rating && (
                    <div className="stat">
                      <span className="stat-label">Rating:</span>
                      <span className="stat-value">⭐ {product.rating}</span>
                    </div>
                  )}
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="product-features">
                    <h4>Key Features:</h4>
                    <ul>
                      {product.features.slice(0, 3).map((feature, index) => (
                        <li key={index}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="product-actions">
                  <button
                    onClick={() => handlePrebook(product._id)}
                    disabled={prebookingInProgress[product._id]}
                    className="btn btn-primary prebook-btn"
                  >
                    {prebookingInProgress[product._id] ? (
                      <>
                        <span className="btn-spinner"></span>
                        Prebooking...
                      </>
                    ) : (
                      <>
                        🎯 Pre-Book Now
                      </>
                    )}
                  </button>
                  
                  <div className="prebook-info">
                    <small>
                      💡 Pre-booking secures your order before official launch
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="prebooking-info-section">
        <div className="info-card">
          <h3>📋 What is Pre-booking?</h3>
          <ul>
            <li>✅ Reserve products before they're officially available</li>
            <li>🎯 Secure your order with priority fulfillment</li>
            <li>💰 Lock in current prices</li>
            <li>🚀 Get notified when products are ready to ship</li>
          </ul>
        </div>
        
        <div className="info-card">
          <h3>🛡️ Pre-booking Benefits</h3>
          <ul>
            <li>🏆 Priority access to limited stock items</li>
            <li>📞 Direct communication about order status</li>
            <li>🔄 Easy cancellation if plans change</li>
            <li>💝 Special pre-booking customer support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
