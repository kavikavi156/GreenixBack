import { useState, useEffect } from 'react';

export default function ProductShowcase() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Failed to load products');
      }
    } catch (error) {
      setError('Error loading products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: "'Roboto', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #2874f0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '24px', 
        textAlign: 'center',
        fontFamily: "'Roboto', sans-serif"
      }}>
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#f1f3f6',
      minHeight: '100vh',
      fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
      
      {/* Header */}
      <div style={{
        background: '#2874f0',
        color: 'white',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0', fontSize: '28px', fontWeight: '500' }}>
          🌱 Pavithra Traders - Product Showcase
        </h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '16px', opacity: '0.9' }}>
          Real Agricultural Products with High-Quality Images
        </p>
      </div>

      {/* Products Grid */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {products.map((product) => (
            <div
              key={product._id}
              style={{
                background: '#ffffff',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {/* Product Image */}
              <div style={{ position: 'relative' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '240px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/320x240/f0f0f0/666666?text=No+Image';
                  }}
                />
                
                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#2874f0',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {product.category}
                </div>

                {/* Discount Badge */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#ff6b35',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}

                {/* Stock Status */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: product.stock > 10 ? '#4caf50' : product.stock > 0 ? '#ff9800' : '#f44336',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                </div>
              </div>

              {/* Product Info */}
              <div style={{ padding: '20px' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#212121',
                  lineHeight: '1.4'
                }}>
                  {product.name}
                </h3>

                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  color: '#757575',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.description}
                </p>

                {/* Brand */}
                <div style={{
                  fontSize: '12px',
                  color: '#9e9e9e',
                  marginBottom: '12px'
                }}>
                  Brand: <strong>{product.brand}</strong>
                </div>

                {/* Rating */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#4caf50',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    ⭐ {product.rating}
                  </div>
                  <span style={{ fontSize: '12px', color: '#9e9e9e' }}>
                    ({product.reviews} reviews)
                  </span>
                  <span style={{ fontSize: '12px', color: '#9e9e9e' }}>
                    {product.sold} sold
                  </span>
                </div>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px'
                    }}>
                      {product.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: '11px',
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '2px 6px',
                            borderRadius: '3px'
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#212121'
                  }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span style={{
                      fontSize: '14px',
                      color: '#9e9e9e',
                      textDecoration: 'line-through'
                    }}>
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span style={{
                    fontSize: '12px',
                    color: '#757575'
                  }}>
                    per {product.unit}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button style={{
                    flex: 1,
                    background: '#2874f0',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#1565c0'}
                  onMouseLeave={(e) => e.target.style.background = '#2874f0'}
                  >
                    Add to Cart
                  </button>
                  <button style={{
                    background: '#ffffff',
                    color: '#757575',
                    border: '1px solid #e0e0e0',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f5f5f5';
                    e.target.style.borderColor = '#bdbdbd';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#ffffff';
                    e.target.style.borderColor = '#e0e0e0';
                  }}
                  >
                    ♡
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#757575'
          }}>
            <p style={{ fontSize: '18px', margin: '0' }}>No products found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        background: '#2874f0',
        color: 'white',
        padding: '24px',
        textAlign: 'center',
        marginTop: '48px'
      }}>
        <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
          📈 Total Products: {products.length} | 
          💰 Total Inventory Value: ₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
}
