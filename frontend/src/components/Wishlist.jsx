import { useState, useEffect } from 'react';

export default function Wishlist({ token, onClose }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract userId from JWT
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
    if (!token || !userId) return;
    fetchWishlist();
  }, [token, userId]);

  async function fetchWishlist() {
    try {
      setLoading(true);
      const res = await fetch(`https://greenix-3.onrender.com/api/customer/wishlist/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data.items || []);
      } else {
        throw new Error('Failed to fetch wishlist');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(productId) {
    try {
      const res = await fetch(`https://greenix-3.onrender.com/api/customer/wishlist/${userId}/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  async function addToCart(productId) {
    try {
      const res = await fetch(`https://greenix-3.onrender.com/api/customer/cart/${userId}/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      });
      
      if (res.ok) {
        alert('Added to cart!');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to add to cart'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        minWidth: '400px',
        maxWidth: '80%',
        maxHeight: '80%',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>My Wishlist</h2>
          <button onClick={onClose} style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '24px', 
            cursor: 'pointer',
            padding: '0 5px'
          }}>
            ×
          </button>
        </div>

        {loading ? (
          <p>Loading wishlist...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : wishlistItems.length === 0 ? (
          <p>Your wishlist is empty</p>
        ) : (
          <div>
            {wishlistItems.map((item) => (
              <div key={item.productId} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                marginBottom: '10px',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{item.productName}</h4>
                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>{item.description}</p>
                    <p style={{ margin: '0', fontWeight: 'bold' }}>₹{item.price}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => addToCart(item.productId)}
                      className="flipkart-btn flipkart-btn-primary"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => removeFromWishlist(item.productId)}
                      className="flipkart-btn flipkart-btn-secondary"
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
