import { useEffect, useState } from 'react';
import '../css/EcommerceStyles.css';
import Checkout from './Checkout';

export default function Cart({ token, onClose }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

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
    if (userId) {
      fetchCart();
    } else {
      setLoading(false);
      setError('Please login to view your cart');
    }
  }, [userId]);

  async function fetchCart() {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/customer/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart || []);
        setError('');
      } else {
        throw new Error('Failed to fetch cart');
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:3001/api/customer/cart/${userId}/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (res.ok) {
        setCart(prev => prev.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
      alert('Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  }

  async function removeFromCart(productId) {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:3001/api/customer/cart/${userId}/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setCart(prev => prev.filter(item => item.product._id !== productId));
      } else {
        throw new Error('Failed to remove from cart');
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      alert('Failed to remove from cart');
    } finally {
      setUpdating(false);
    }
  }

  function calculateTotal() {
    return cart.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  function calculateSavings() {
    return cart.reduce((savings, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      const currentPrice = item.product.price;
      return savings + ((originalPrice - currentPrice) * item.quantity);
    }, 0);
  }

  function getTotalItems() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  function handleOrderComplete() {
    setCart([]);
    setShowCheckout(false);
    if (onClose) onClose();
  }

  if (showCheckout) {
    return (
      <Checkout
        token={token}
        cartItems={cart}
        totalAmount={calculateTotal()}
        onClose={() => setShowCheckout(false)}
        onOrderComplete={handleOrderComplete}
      />
    );
  }

  if (loading) {
    return (
      <div className="cart-overlay">
        <div className="ecommerce-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-overlay">
        <div className="ecommerce-container">
          <div className="error-message">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-overlay">
      <div className="cart-modal">
        <div className="cart-layout">
          <div className="cart-content">
            <div className="page-header">
              <h2>Shopping Cart</h2>
              <p>{getTotalItems()} items in your cart</p>
              {onClose && (
                <button className="close-btn" onClick={onClose}>×</button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started</p>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map((item) => {
                  const product = item.product;
                  const itemTotal = product.price * item.quantity;
                  const originalItemTotal = (product.originalPrice || product.price) * item.quantity;
                  const itemSavings = originalItemTotal - itemTotal;

                  return (
                    <div key={product._id} className="cart-item">
                      <div className="cart-item-image">
                        <img 
                          src={product.image || 'https://via.placeholder.com/150x150?text=No+Image'} 
                          alt={product.name}
                        />
                      </div>
                      
                      <div className="cart-item-details">
                        {product.brand && (
                          <div className="cart-item-brand">{product.brand}</div>
                        )}
                        <h3 className="cart-item-name">{product.name}</h3>
                        
                        <div className="cart-item-pricing">
                          <span className="cart-item-price">₹{product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <>
                              <span className="cart-item-original-price">₹{product.originalPrice}</span>
                              <span className="cart-item-discount">{product.discount}% off</span>
                            </>
                          )}
                        </div>

                        {product.features && product.features.length > 0 && (
                          <div className="cart-item-features">
                            {product.features.slice(0, 2).map((feature, index) => (
                              <span key={index} className="feature-tag small">{feature}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            disabled={updating || item.quantity >= product.stock}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="cart-item-total">
                          <span className="total-price">₹{itemTotal}</span>
                          {itemSavings > 0 && (
                            <span className="savings">Save ₹{itemSavings}</span>
                          )}
                        </div>
                        
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(product._id)}
                          disabled={updating}
                          title="Remove from cart"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                
                <div className="summary-row">
                  <span>Items ({getTotalItems()})</span>
                  <span>₹{calculateTotal() + calculateSavings()}</span>
                </div>
                
                {calculateSavings() > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-₹{calculateSavings()}</span>
                  </div>
                )}
                
                <div className="summary-row">
                  <span>Delivery</span>
                  <span>FREE</span>
                </div>
                
                <hr />
                
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                
                {calculateSavings() > 0 && (
                  <div className="total-savings">
                    You will save ₹{calculateSavings()} on this order
                  </div>
                )}
                
                <button 
                  className="checkout-btn"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </button>
                
                <div className="secure-checkout">
                  🔒 Secure and safe checkout
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
