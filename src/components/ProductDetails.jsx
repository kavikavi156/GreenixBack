import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/EcommerceStyles.css';
import '../css/ProfessionalEcommerce.css';

export default function ProductDetails({ productId, token, onClose, onAddToCart }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [dynamicPrice, setDynamicPrice] = useState(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const navigate = useNavigate();

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
    if (productId) {
      fetchProductDetails();
      if (userId) {
        checkWishlistStatus();
      }
    }
    
    // Add keyboard event listener for ESC key
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [productId, userId, onClose]);

  // Set default package when product loads
  useEffect(() => {
    if (product) {
      console.log('Product data loaded:', product);
      console.log('Package sizes:', product.packageSizes);
      
      if (product.packageSizes && product.packageSizes.length > 0 && !selectedPackage) {
        // Select the first package size as default
        setSelectedPackage(product.packageSizes[0]);
        console.log('Selected first package:', product.packageSizes[0]);
      } else if (!product.packageSizes && !selectedPackage) {
        // Create a default package for products without packageSizes
        const defaultPackage = {
          size: 1,
          unit: product.baseUnit || product.unit || 'unit',
          price: product.price,
          stock: product.stock || 0,
          priceMultiplier: 1
        };
        setSelectedPackage(defaultPackage);
        console.log('Created default package:', defaultPackage);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product && quantity > 0 && selectedPackage) {
      calculateDynamicPrice();
    }
  }, [product, quantity, selectedPackage]);

  async function calculateDynamicPrice() {
    if (!product || !selectedPackage || quantity <= 0) return;
    
    setIsCalculatingPrice(true);
    try {
      // Calculate price based on selected package
      const packagePrice = selectedPackage.price;
      const totalPrice = packagePrice * quantity;
      
      // Calculate savings if applicable
      let savings = 0;
      if (product.originalPrice && selectedPackage.size) {
        const originalTotalPrice = (product.originalPrice * selectedPackage.size) * quantity;
        savings = originalTotalPrice - totalPrice;
      }

      setDynamicPrice({
        pricePerUnit: packagePrice,
        totalPrice: totalPrice,
        savings: Math.max(0, savings),
        packageSize: selectedPackage.size,
        packageUnit: selectedPackage.unit
      });
    } catch (error) {
      console.error('Error calculating price:', error);
      // Fallback calculation
      const fallbackPrice = selectedPackage?.price || product.basePrice || product.price;
      setDynamicPrice({
        pricePerUnit: fallbackPrice,
        totalPrice: fallbackPrice * quantity,
        savings: 0,
        packageSize: selectedPackage?.size || 1,
        packageUnit: selectedPackage?.unit || product.baseUnit || 'unit'
      });
    } finally {
      setIsCalculatingPrice(false);
    }
  }

  async function fetchProductDetails() {
    setLoading(true);
    try {
      console.log('Fetching product details for ID:', productId);
      const response = await fetch(`http://localhost:3001/api/products/${productId}`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Product data received:', data);
        setProduct(data);
        // Don't create fake image variants, just use the actual image
        setError('');
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch product details: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(`Failed to load product details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function checkWishlistStatus() {
    try {
      const response = await fetch(`http://localhost:3001/api/customer/wishlist/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.wishlist.some(item => item._id === productId));
      }
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  }

  async function toggleWishlist() {
    if (!userId) {
      alert('Please login to add to wishlist');
      return;
    }

    try {
      const endpoint = isInWishlist ? 'remove-from-wishlist' : 'add-to-wishlist';
      const response = await fetch(`http://localhost:3001/api/customer/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, productId })
      });

      if (response.ok) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      alert('Failed to update wishlist');
    }
  }

  function handleAddToCart() {
    if (onAddToCart) {
      if (selectedPackage) {
        const cartItem = {
          productId: productId,
          quantity: quantity,
          packageSize: selectedPackage.size,
          packageUnit: selectedPackage.unit,
          packagePrice: selectedPackage.price,
          totalPrice: selectedPackage.price * quantity
        };
        onAddToCart(cartItem);
      } else {
        // Fallback for products without selectedPackage
        const cartItem = {
          productId: productId,
          quantity: quantity,
          packageSize: 1,
          packageUnit: product.unit || 'unit',
          packagePrice: product.price,
          totalPrice: product.price * quantity
        };
        onAddToCart(cartItem);
      }
    }
  }

  async function handleBuyNow() {
    if (!token) {
      // Store the buy now action for after login
      const packageInfo = selectedPackage || {
        size: 1,
        unit: product.unit || 'unit',
        price: product.price
      };
      localStorage.setItem('pendingBuyNow', JSON.stringify({
        productId: productId,
        quantity: quantity,
        packageSize: packageInfo.size,
        packageUnit: packageInfo.unit,
        redirectTo: 'checkout'
      }));
      alert('Please login to purchase products');
      // Close the modal and let the user login
      onClose();
      return;
    }

    setIsBuyingNow(true);

    try {
      // Create a cart item for immediate checkout
      const packageInfo = selectedPackage || {
        size: 1,
        unit: product.unit || 'unit',
        price: product.price
      };
      
      const cartItem = {
        _id: `temp-${productId}`,
        product: product,
        quantity: quantity,
        packageSize: packageInfo.size,
        packageUnit: packageInfo.unit,
        packagePrice: packageInfo.price,
        price: packageInfo.price,
        totalPrice: packageInfo.price * quantity
      };

      const totalAmount = cartItem.totalPrice;

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to checkout with the single item
      navigate('/checkout', {
        state: {
          cartItems: [cartItem],
          totalAmount: totalAmount,
          token: token,
          isBuyNow: true // Flag to indicate this is a buy now action
        }
      });
    } catch (error) {
      console.error('Error processing buy now:', error);
      alert('Error processing your request. Please try again.');
    } finally {
      setIsBuyingNow(false);
    }
  }

  function renderStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  }

  function getStockStatus(stock) {
    if (stock === 0) return { status: 'out-of-stock', text: 'Out of Stock' };
    if (stock <= 5) return { status: 'low-stock', text: `Only ${stock} left` };
    return { status: 'in-stock', text: 'In Stock' };
  }

  if (loading) {
    return (
      <div className="product-details-overlay">
        <div className="product-details-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-overlay">
        <div className="product-details-modal">
          <div className="error-container">
            <h3>Error</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const currentStock = selectedPackage ? selectedPackage.stock : product.stock || 0;
  const stockStatus = getStockStatus(currentStock);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  return (
    <div className="product-details-overlay">
      <div className="product-details-modal">
        <div className="modal-header">
          <button className="back-btn" onClick={onClose}>
            ← Back to Products
          </button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="product-details-content">
          {/* Left Section - Images */}
          <div className="product-images-section">
            <div className="main-image">
              <img 
                src={(() => {
                  // If there are multiple images, show the selected one
                  if (product.images && product.images.length > 0) {
                    const selectedImage = product.images[selectedImageIndex] || product.image;
                    return selectedImage?.startsWith('http') 
                      ? selectedImage 
                      : `http://localhost:3001/uploads/${selectedImage}`;
                  }
                  // Otherwise show the main product image
                  return product.image?.startsWith('http') 
                    ? product.image 
                    : `http://localhost:3001/uploads/${product.image}`;
                })()}
                alt={product.name}
                onError={(e) => {
                  console.log('Image load error in details:', e.target.src);
                  e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect fill="%23f1f5f9" width="400" height="400"/><text fill="%236b7280" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="60">📦</text><text fill="%236b7280" x="50%" y="70%" text-anchor="middle" dy=".3em" font-size="16">No Image Available</text></svg>`;
                }}
              />
              {product.discount > 0 && (
                <div className="discount-badge-large">
                  {product.discount}% OFF
                </div>
              )}
            </div>
            
            {/* Only show thumbnails if there are actually multiple images */}
            {product.images && product.images.length > 1 && product.images.some(img => img !== product.image) && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image?.startsWith('http') 
                      ? image 
                      : `http://localhost:3001/uploads/${image}`
                    }
                    alt={`${product.name} view ${index + 1}`}
                    className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f1f5f9" width="100" height="100"/><text fill="%236b7280" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20">📦</text></svg>`;
                    }}
                  />
                ))}
              </div>
            )}
            
            <div className="product-actions-mobile">
              <button 
                className={`wishlist-btn-large ${isInWishlist ? 'active' : ''}`}
                onClick={toggleWishlist}
              >
                {isInWishlist ? '💖 WISHLISTED' : '🤍 WISHLIST'}
              </button>
              <button 
                className="share-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: `Check out this ${product.name}`,
                      url: window.location.href
                    });
                  }
                }}
              >
                📤 SHARE
              </button>
            </div>
          </div>

          {/* Right Section - Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              {product.brand && (
                <div className="product-brand-large">{product.brand}</div>
              )}
              <h1 className="product-title">{product.name}</h1>
              
              {product.rating && (
                <div className="product-rating-large">
                  <div className="rating-container">
                    <span className="rating-score">{product.rating}</span>
                    <div className="rating-stars">
                      {renderStars(product.rating)}
                    </div>
                    <span className="rating-count">
                      ({product.reviews || 0} reviews)
                    </span>
                  </div>
                  {product.sold > 0 && (
                    <div className="sales-count">
                      {product.sold} sold recently
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="product-pricing-large">
              <div className="price-section">
                {isCalculatingPrice ? (
                  <span className="calculating-price">Calculating...</span>
                ) : dynamicPrice && selectedPackage ? (
                  <>
                    <span className="current-price-large">₹{dynamicPrice.pricePerUnit}</span>
                    <span className="price-per-unit"> per {selectedPackage.size} {selectedPackage.unit} package</span>
                    {quantity > 1 && (
                      <div className="total-price">
                        Total: ₹{dynamicPrice.totalPrice} for {quantity} packages ({quantity * selectedPackage.size} {selectedPackage.unit} total)
                      </div>
                    )}
                    {dynamicPrice.savings > 0 && (
                      <div className="bulk-savings">
                        You save: ₹{dynamicPrice.savings} with bulk pricing!
                      </div>
                    )}
                    <div className="unit-price-breakdown">
                      Price per {product.baseUnit || 'unit'}: ₹{(dynamicPrice.pricePerUnit / selectedPackage.size).toFixed(2)}
                    </div>
                  </>
                ) : selectedPackage ? (
                  <>
                    <span className="current-price-large">₹{selectedPackage.price}</span>
                    <span className="price-per-unit"> per {selectedPackage.size} {selectedPackage.unit} package</span>
                    {product.originalPrice && product.originalPrice > product.basePrice && (
                      <>
                        <span className="original-price-large">₹{(product.originalPrice * selectedPackage.size).toFixed(2)}</span>
                        <span className="discount-percent-large">{Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100)}% off</span>
                      </>
                    )}
                    <div className="unit-price-breakdown">
                      Price per {product.baseUnit || 'unit'}: ₹{(selectedPackage.price / selectedPackage.size).toFixed(2)}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="current-price-large">₹{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="original-price-large">₹{product.originalPrice}</span>
                        <span className="discount-percent-large">{product.discount}% off</span>
                      </>
                    )}
                  </>
                )}
              </div>
              {selectedPackage && product.originalPrice && product.originalPrice > product.basePrice && (
                <div className="savings-info">
                  You save: ₹{((product.originalPrice - product.basePrice) * selectedPackage.size).toFixed(2)} per package
                </div>
              )}
            </div>

            <div className={`stock-status-large ${stockStatus.status}`}>
              <div className="stock-indicator-large"></div>
              <span className="stock-text">{stockStatus.text}</span>
              {stockStatus.status === 'in-stock' && (
                <span className="delivery-info">
                  Get it by {deliveryDate.toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Offers Section */}
            <div className="offers-section">
              <h3>Available Offers</h3>
              <div className="offers-list">
                <div className="offer-item">
                  <span className="offer-icon">🏷️</span>
                  <span>Bank Offer: 10% instant discount on SBI Credit Cards</span>
                </div>
                <div className="offer-item">
                  <span className="offer-icon">💳</span>
                  <span>No Cost EMI available for orders above ₹3,000</span>
                </div>
                <div className="offer-item">
                  <span className="offer-icon">🚚</span>
                  <span>Free delivery on orders above ₹500</span>
                </div>
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="features-section">
                <h3>Key Features</h3>
                <div className="features-list">
                  {product.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-bullet">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="purchase-section">
              {/* Package Size Selection */}
              {product.packageSizes && product.packageSizes.length > 0 ? (
                <div className="package-selection-section">
                  <label>Select Package Size:</label>
                  <div className="package-options">
                    {product.packageSizes.map((pkg, index) => (
                      <div 
                        key={index}
                        className={`package-option ${selectedPackage === pkg ? 'selected' : ''}`}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <div className="package-size">
                          {pkg.size} {pkg.unit}
                        </div>
                        <div className="package-price">
                          ₹{pkg.price}
                        </div>
                        {pkg.stock > 0 ? (
                          <div className="package-stock">
                            {pkg.stock} available
                          </div>
                        ) : (
                          <div className="package-stock out-of-stock">
                            Out of stock
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="package-selection-section">
                  <label>Product Unit:</label>
                  <div className="package-options">
                    <div className="package-option selected">
                      <div className="package-size">
                        1 {product.unit || 'unit'}
                      </div>
                      <div className="package-price">
                        ₹{product.price}
                      </div>
                      <div className="package-stock">
                        {product.stock} available
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="quantity-section">
                <label>Number of {selectedPackage ? `${selectedPackage.size} ${selectedPackage.unit} packages` : 'Units'}:</label>
                <div className="quantity-controls-large">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display-large">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn btn-secondary add-to-cart-large"
                  onClick={handleAddToCart}
                  disabled={stockStatus.status === 'out-of-stock'}
                >
                  🛒 ADD TO CART
                </button>
                <button 
                  className="btn btn-primary buy-now-large"
                  onClick={handleBuyNow}
                  disabled={stockStatus.status === 'out-of-stock' || isBuyingNow}
                >
                  {isBuyingNow ? '⏳ Processing...' : '⚡ BUY NOW'}
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="delivery-section">
              <h3>Delivery Options</h3>
              <div className="delivery-info">
                <div className="delivery-item">
                  <span className="delivery-icon">🚚</span>
                  <div>
                    <strong>Standard Delivery</strong>
                    <div>Expected by {deliveryDate.toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="delivery-item">
                  <span className="delivery-icon">🔄</span>
                  <div>
                    <strong>Easy Returns</strong>
                    <div>7 days return policy</div>
                  </div>
                </div>
                <div className="delivery-item">
                  <span className="delivery-icon">💯</span>
                  <div>
                    <strong>Genuine Product</strong>
                    <div>Verified by seller</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="description-section">
              <h3>Product Description</h3>
              <div className={`description-content ${showFullDescription ? 'expanded' : ''}`}>
                <p>
                  {product.description || `Experience the premium quality of ${product.name} from ${product.brand || 'our trusted brand'}. This product offers exceptional value with its superior features and reliable performance. Perfect for daily use with long-lasting durability.`}
                </p>
                {!showFullDescription && (
                  <div className="description-fade"></div>
                )}
              </div>
              <button 
                className="read-more-btn"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Read Less' : 'Read More'}
              </button>
            </div>

            {/* Specifications */}
            <div className="specifications-section">
              <h3>Product Specifications</h3>
              <div className="spec-table">
                <div className="spec-row">
                  <span className="spec-label">Brand</span>
                  <span className="spec-value">{product.brand || 'Generic'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Category</span>
                  <span className="spec-value">{product.category || 'General'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Stock Available</span>
                  <span className="spec-value">{product.stock} units</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Weight</span>
                  <span className="spec-value">{product.weight || 'As per product'}</span>
                </div>
              </div>
              
              {/* Agricultural Product Details */}
              {(product.chemicalComposition || product.packaging || product.application) && (
                <>
                  <h3 style={{ marginTop: '2rem' }}>Agricultural Product Details</h3>
                  
                  {/* Chemical Composition */}
                  {product.chemicalComposition && (
                    <div className="agri-section">
                      <h4>Chemical Composition</h4>
                      <div className="spec-table">
                        {product.chemicalComposition.nitrogen && (
                          <div className="spec-row">
                            <span className="spec-label">Nitrogen (N)</span>
                            <span className="spec-value">{product.chemicalComposition.nitrogen}%</span>
                          </div>
                        )}
                        {product.chemicalComposition.phosphorus && (
                          <div className="spec-row">
                            <span className="spec-label">Phosphorus (P)</span>
                            <span className="spec-value">{product.chemicalComposition.phosphorus}%</span>
                          </div>
                        )}
                        {product.chemicalComposition.potassium && (
                          <div className="spec-row">
                            <span className="spec-label">Potassium (K)</span>
                            <span className="spec-value">{product.chemicalComposition.potassium}%</span>
                          </div>
                        )}
                        {product.chemicalComposition.activeIngredients?.map((ingredient, index) => (
                          <div key={index} className="spec-row">
                            <span className="spec-label">{ingredient.name}</span>
                            <span className="spec-value">{ingredient.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Packaging Information */}
                  {product.packaging && (
                    <div className="agri-section">
                      <h4>Packaging Options</h4>
                      <div className="packaging-options">
                        {product.packaging.sizes?.map((size, index) => (
                          <div key={index} className="packaging-item">
                            <span className="packaging-size">{size.quantity} {size.unit}</span>
                            <span className="packaging-price">₹{size.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="spec-table">
                        <div className="spec-row">
                          <span className="spec-label">Form</span>
                          <span className="spec-value">{product.packaging.form}</span>
                        </div>
                        <div className="spec-row">
                          <span className="spec-label">Storage</span>
                          <span className="spec-value">{product.packaging.storage}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Application Information */}
                  {product.application && (
                    <div className="agri-section">
                      <h4>Application Guidelines</h4>
                      <div className="spec-table">
                        {product.application.crops?.length > 0 && (
                          <div className="spec-row">
                            <span className="spec-label">Suitable Crops</span>
                            <span className="spec-value">{product.application.crops.join(', ')}</span>
                          </div>
                        )}
                        {product.application.dosage && (
                          <div className="spec-row">
                            <span className="spec-label">Dosage</span>
                            <span className="spec-value">{product.application.dosage.amount} {product.application.dosage.unit} per {product.application.dosage.area}</span>
                          </div>
                        )}
                        {product.application.instructions && (
                          <div className="spec-row full-width">
                            <span className="spec-label">Instructions</span>
                            <div className="spec-value">
                              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                {product.application.instructions.map((instruction, index) => (
                                  <li key={index}>{instruction}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
