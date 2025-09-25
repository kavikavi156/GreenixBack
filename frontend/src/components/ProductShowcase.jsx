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
      const response = await fetch('https://greenix-3.onrender.com/api/products');
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
      fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Responsive Improvements */
          @media (max-width: 768px) {
            .product-grid {
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
              gap: 16px !important;
            }
            
            .product-card {
              border-radius: 12px !important;
            }
            
            .product-image-container {
              height: 240px !important;
              padding: 12px !important;
            }
            
            .footer-grid {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
              text-align: center !important;
            }
            
            .stats-grid {
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
            }
          }
          
          @media (max-width: 480px) {
            .product-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            
            .product-image-container {
              height: 200px !important;
              padding: 8px !important;
            }
            
            .feature-pills {
              justify-content: center !important;
              gap: 8px !important;
            }
          }
        `
      }} />
      
      {/* Enhanced Header */}
      <header style={{
        background: 'linear-gradient(135deg, #2874f0 0%, #1565c0 100%)',
        color: 'white',
        padding: 'clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: 'clamp(24px, 5vw, 36px)', 
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            🌱 Pavithra Traders
          </h1>
          <h2 style={{ 
            margin: '0 0 12px 0', 
            fontSize: 'clamp(18px, 3vw, 24px)', 
            fontWeight: '400',
            opacity: '0.95'
          }}>
            Premium Agricultural Product Showcase
          </h2>
          <p style={{ 
            margin: '0', 
            fontSize: 'clamp(14px, 2vw, 16px)', 
            opacity: '0.85',
            lineHeight: '1.5'
          }}>
            Discover high-quality seeds, fertilizers, and farming essentials for better yields
          </p>
          
          {/* Feature Pills */}
          <div className="feature-pills" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '24px',
            flexWrap: 'wrap'
          }}>
            {['Premium Quality', 'Trusted Brand', 'Fast Delivery'].map(feature => (
              <span key={feature} style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {feature}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {/* Products Section */}
        <section style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)'
        }}>
        {/* Section Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 'clamp(32px, 6vw, 48px)'
        }}>
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: '600',
            color: '#212121'
          }}>
            Our Products
          </h2>
          <p style={{
            margin: '0',
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: '#666',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Browse through our extensive collection of agricultural products, carefully selected for quality and effectiveness
          </p>
        </div>
        <div className="product-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))',
          gap: 'clamp(16px, 4vw, 32px)'
        }}>
          {products.map((product) => (
            <div
              key={product._id}
              className="product-card"
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
              {/* Product Image - Professional & Fully Visible */}
              <div className="product-image-container" style={{ position: 'relative', width: '100%', height: '320px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #eee', padding: '20px' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    background: '#ffffff',
                    border: '1px solid #f0f0f0'
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
        </section>
      </main>

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
        <div className="footer-grid" style={{
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
