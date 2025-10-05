import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../css/EnhancedCart.css';

export default function EnhancedCart({ isOpen, onClose, onCartUpdate }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen]);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const fetchCartItems = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        setError('Please login to view cart');
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      console.log('Fetching cart for user:', userId);

      const response = await fetch(`http://localhost:3001/api/customer/cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Cart data received:', data);
      
      // Filter out items with invalid or null products
      const validItems = (data.items || []).filter(item => 
        item.product && item.product._id
      );
      
      setCartItems(validItems);
      
      // Notify parent component about cart update
      if (onCartUpdate) {
        onCartUpdate(validItems.length);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
    setTotal(totalAmount);
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    try {
      const token = localStorage.getItem('customerToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await fetch(`http://localhost:3001/api/customer/cart/${userId}/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        await fetchCartItems(); // Refresh cart and update parent
      } else {
        setError('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('customerToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await fetch(`http://localhost:3001/api/customer/cart/${userId}/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCartItems(); // Refresh cart and update parent
      } else {
        setError('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    const token = localStorage.getItem('customerToken');
    if (!token) {
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    
    // Navigate to checkout page with cart data
    navigate('/checkout', { 
      state: { 
        cartItems, 
        totalAmount: total,
        token 
      } 
    });
    onClose(); // Close the cart overlay
  };

  const cleanupCart = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await fetch(`http://localhost:3001/api/customer/cart/${userId}/cleanup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cart cleanup result:', data);
        if (data.removedCount > 0) {
          alert(`Removed ${data.removedCount} invalid items from cart`);
        }
        await fetchCartItems(); // Refresh cart
      }
    } catch (error) {
      console.error('Error cleaning up cart:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay-backdrop" onClick={onClose}>
      <div className="cart-overlay-content" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 Shopping Cart</h2>
          <div className="cart-header-actions">
            {cartItems.length > 0 && (
              <button 
                onClick={cleanupCart} 
                className="cleanup-btn"
                title="Clean up invalid items"
              >
                🧹
              </button>
            )}
            <button onClick={onClose} className="cart-close-btn">×</button>
          </div>
        </div>

        <div className="cart-body">
          {loading && <div className="cart-loading">Loading cart items...</div>}
          
          {error && <div className="cart-error">{error}</div>}
          
          {!loading && !error && cartItems.length === 0 && (
            <div className="cart-empty">
              <p>Your cart is empty</p>
              <button onClick={onClose} className="continue-shopping-btn">
                Continue Shopping
              </button>
            </div>
          )}

          {!loading && cartItems.length > 0 && (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-image">
                      {item.product?.image ? (
                        <img 
                          src={item.product?.image?.startsWith('http') 
                            ? item.product?.image 
                            : `http://localhost:3001/uploads/${item.product?.image}`
                          }
                          alt={item.product?.name || 'Product'}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="cart-item-placeholder" style={{ display: 'none' }}>
                        📦
                      </div>
                    </div>
                    
                    <div className="cart-item-details">
                      <h4>{item.product?.name || 'Unknown Product'}</h4>
                      <p className="cart-item-price">₹{item.product?.price || 0}</p>
                      <div className="cart-item-quantity">
                        <button 
                          onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="cart-item-total">
                      <p>₹{(item.product?.price || 0) * item.quantity}</p>
                      <button 
                        onClick={() => removeItem(item.product?._id)}
                        className="remove-item-btn"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="cart-total">
                  <h3>Total: ₹{total}</h3>
                </div>
                <button onClick={handleCheckout} className="checkout-btn">
                  Proceed to Checkout ({cartItems.length} items)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
