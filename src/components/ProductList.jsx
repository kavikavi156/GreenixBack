
import { useEffect, useState } from 'react';
import '../css/EcommerceStyles.css';
import ProductDetails from './ProductDetails';

export default function ProductList({ token, isAdmin, onPrebook, onAddToCart, onEdit }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    sort: 'name',
    search: '',
    minPrice: '',
    maxPrice: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Get user ID from token
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

  useEffect(() => {
    fetchProducts();
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  async function fetchProducts() {
    console.log('Fetching products from backend...');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/products');
      console.log('Products response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Products data received:', data);
      
      // Handle both old and new API response formats
      const productsArray = data.products || data;
      
      if (Array.isArray(productsArray) && productsArray.length > 0) {
        setProducts(productsArray);
        setError('');
      } else {
        setProducts([]);
        setError('No products found in database.');
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
      setError('Failed to load products from server.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchWishlist() {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:3001/api/customer/wishlist/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data.wishlist.map(item => item.product._id || item.product));
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  }

  function applyFilters() {
    let filtered = [...products];
    
    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= Number(filters.maxPrice));
    }
    
    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popularity':
          return (b.sold || 0) - (a.sold || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }

  async function toggleWishlist(productId) {
    if (!userId) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      const isInWishlist = wishlist.includes(productId);
      const method = isInWishlist ? 'DELETE' : 'POST';
      
      const res = await fetch(`http://localhost:3001/api/customer/wishlist/${userId}/${productId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        if (isInWishlist) {
          setWishlist(prev => prev.filter(id => id !== productId));
        } else {
          setWishlist(prev => [...prev, productId]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  }

  function handleAddToCartClick(productId) {
    if (onAddToCart) {
      // Use the function passed from parent (CustomerPage)
      onAddToCart(productId);
    } else {
      // Fallback for when no parent handler is provided
      if (!userId) {
        alert('Please login to add items to cart');
        return;
      }
      console.log('No onAddToCart handler provided');
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) return;
    try {
      await fetch(`http://localhost:3001/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter(p => p._id !== id));
    } catch {
      setError('Delete failed');
    }
  }

  async function togglePrebooking(productId, currentStatus) {
    if (!isAdmin) return;
    try {
      const res = await fetch(`http://localhost:3001/api/admin/products/${productId}/prebooking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !currentStatus }),
      });
      
      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts(prev => prev.map(p => 
          p._id === productId ? { ...p, prebookingEnabled: updatedProduct.prebookingEnabled } : p
        ));
      } else {
        setError('Failed to toggle prebooking');
      }
    } catch (err) {
      setError('Failed to toggle prebooking');
      console.error('Toggle prebooking error:', err);
    }
  }

  function handleFilterChange(field, value) {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function renderStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i}>★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half">☆</span>);
    }
    while (stars.length < 5) {
      stars.push(<span key={`empty-${stars.length}`}>☆</span>);
    }
    
    return stars;
  }

  function getStockStatus(stock) {
    if (stock === 0) return { status: 'out-stock', text: 'Out of Stock' };
    if (stock < 20) return { status: 'low-stock', text: 'Low Stock' };
    return { status: 'in-stock', text: 'In Stock' };
  }

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="ecommerce-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="ecommerce-container">
      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Products</label>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, brand, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Category</label>
            <select 
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Seeds">Seeds</option>
              <option value="Herbicides">Herbicides</option>
              <option value="Insecticides">Insecticides</option>
              <option value="Fertilizers">Fertilizers</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By</label>
            <select 
              className="filter-select"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="name">Name A-Z</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="popularity">Best Sellers</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Price Range</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="number"
                className="filter-select"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <input
                type="number"
                className="filter-select"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Header */}
      <div className="products-header">
        <div className="results-count">
          Showing {currentProducts.length} of {filteredProducts.length} products
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {currentProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          const isInWishlist = wishlist.includes(product._id);
          
          return (
            <div key={product._id} className="product-card">
              <div 
                className="product-image-container"
                onClick={() => setSelectedProductId(product._id)}
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={product.image || 'https://via.placeholder.com/300x250?text=No+Image'} 
                  alt={product.name}
                  className="product-image"
                />
                {product.discount > 0 && (
                  <div className="discount-badge">
                    {product.discount}% OFF
                  </div>
                )}
                {!isAdmin && (
                  <button 
                    className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product._id);
                    }}
                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    ♡
                  </button>
                )}
              </div>
              
              <div 
                className="product-info"
                onClick={() => setSelectedProductId(product._id)}
                style={{ cursor: 'pointer' }}
              >
                {product.brand && (
                  <div className="product-brand">{product.brand}</div>
                )}
                
                <h3 className="product-name">{product.name}</h3>
                
                {product.rating && (
                  <div className="product-rating">
                    <div className="rating-stars">
                      {renderStars(product.rating)}
                    </div>
                    <span className="rating-text">
                      ({product.rating}) · {product.reviews || 0} reviews
                    </span>
                  </div>
                )}
                
                <div className="product-pricing">
                  <span className="current-price">₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="original-price">₹{product.originalPrice}</span>
                      <span className="discount-percent">{product.discount}% off</span>
                    </>
                  )}
                </div>
                
                <div className={`stock-status ${stockStatus.status}`}>
                  <div className="stock-indicator"></div>
                  <span>{stockStatus.text}</span>
                  {product.sold > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#666' }}>
                      {product.sold} sold
                    </span>
                  )}
                </div>
                
                {product.features && product.features.length > 0 && (
                  <div className="product-features">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                )}
                
                <div className="product-actions">
                  {!isAdmin ? (
                    <>
                      {product.stock > 0 ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleAddToCartClick(product._id)}
                        >
                          🛒 Add to Cart
                        </button>
                      ) : (
                        <button 
                          className="btn btn-warning"
                          onClick={() => onPrebook && onPrebook(product._id)}
                        >
                          📅 Prebook (Out of Stock)
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="admin-actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit && onEdit(product);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product._id);
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className={`btn ${product.prebookingEnabled !== false ? 'btn-warning' : 'btn-success'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePrebooking(product._id, product.prebookingEnabled);
                        }}
                      >
                        {product.prebookingEnabled !== false ? 'Disable PB' : 'Enable PB'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            if (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page}>...</span>;
            }
            return null;
          })}
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProductId && (
        <ProductDetails
          productId={selectedProductId}
          token={token}
          onClose={() => setSelectedProductId(null)}
          onAddToCart={(productId, quantity) => {
            if (onAddToCart) {
              onAddToCart(productId, quantity);
            }
            setSelectedProductId(null);
          }}
        />
      )}
    </div>
  );
}
