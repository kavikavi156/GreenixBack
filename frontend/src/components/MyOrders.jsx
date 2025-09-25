import React, { useState, useEffect } from 'react';
import '../css/MyOrders.css';

export default function MyOrders({ token, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('MyOrders mounted with token:', !!token);

  // Emergency fallback to prevent white screen
  try {
    console.log('MyOrders component rendering...', { token: !!token });

    // Quick fallback for missing token
    if (!token) {
      console.log('No token found, showing login message');
      return (
        <div className="my-orders-overlay">
          <div className="my-orders-container">
            <div className="my-orders-header">
              <h2>My Orders</h2>
              <button onClick={onClose} className="close-btn">&times;</button>
            </div>
            <div className="error">Please login to view your orders</div>
          </div>
        </div>
      );
    }

    // Extract userId from JWT
    function getUserIdFromToken(token) {
      if (!token) {
        console.log('No token provided');
        return null;
      }
      try {
        console.log('Token received:', token);
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded payload:', payload);
        return payload.userId;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }

  const userId = getUserIdFromToken(token);
  console.log('User ID:', userId);

  useEffect(() => {
    console.log('MyOrders useEffect triggered', { token: !!token, userId });
    if (token && userId) {
      fetchMyOrders();
    } else {
      setError('Please login to view your orders');
      setLoading(false);
    }
  }, [token, userId]);

  async function fetchMyOrders() {
    try {
      console.log('Fetching orders for userId:', userId);
      setLoading(true);
      const res = await fetch(`https://greenix-3.onrender.com/api/customer/orders/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Orders data received:', data);
        setOrders(data.orders || []);
      } else {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        setError(errorData.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#ff9800';
      case 'confirmed':
        return '#2196f3';
      case 'shipped':
        return '#9c27b0';
      case 'delivered':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatAddress(addressObj) {
    if (!addressObj) return '';
    if (typeof addressObj === 'string') return addressObj;
    
    // Handle address object with proper formatting
    const { fullName, address, city, state, pincode, landmark } = addressObj;
    let formattedAddress = '';
    
    if (fullName) formattedAddress += fullName + ', ';
    if (address) formattedAddress += address + ', ';
    if (landmark) formattedAddress += landmark + ', ';
    if (city) formattedAddress += city + ', ';
    if (state) formattedAddress += state + ' ';
    if (pincode) formattedAddress += pincode;
    
    return formattedAddress.replace(/,\s*$/, ''); // Remove trailing comma
  }

  function calculateTotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  if (loading) {
    return (
      <div className="my-orders-overlay">
        <div className="my-orders-container">
          <div className="my-orders-header">
            <h2>My Orders</h2>
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>
          <div className="loading">Loading your orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-overlay">
        <div className="my-orders-container">
          <div className="my-orders-header">
            <h2>My Orders</h2>
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>
          <div className="error">{error}</div>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-overlay">
      <div className="my-orders-container">
        <div className="my-orders-header">
          <div className="header-left">
            <button onClick={onClose} className="back-btn">← Back</button>
            <h2>📦 My Orders</h2>
          </div>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="my-orders-content">
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>You haven't placed any orders yet.</p>
              <p>Start shopping to see your orders here!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order._id.slice(-8)}</h3>
                      <p className="order-date">{formatDate(order.createdAt)}</p>
                    </div>
                    <div 
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status || 'Pending'}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          <img 
                            src={
                              item.product?.image 
                                ? (item.product.image.startsWith('http') 
                                    ? item.product.image 
                                    : `https://greenix-3.onrender.com/uploads/${item.product.image}`)
                                : item.product?.images?.[0]
                                  ? (item.product.images[0].startsWith('http')
                                      ? item.product.images[0]
                                      : `https://greenix-3.onrender.com/uploads/${item.product.images[0]}`)
                                  : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K'
                            }
                            alt={item.name || item.product?.name || 'Product'} 
                            onError={(e) => {
                              console.log('Image load failed for:', item.product?.name, 'URL:', e.target.src);
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K';
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully for:', item.product?.name, 'URL:', e.target.src);
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <h4>{item.name || item.product?.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ₹{item.price}</p>
                        </div>
                        <div className="item-total">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="delivery-info">
                      {order.deliveryAddress && (
                        <p><strong>Delivery:</strong> {formatAddress(order.deliveryAddress)}</p>
                      )}
                      {(order.phoneNumber || order.deliveryAddress?.phone) && (
                        <p><strong>Phone:</strong> {order.phoneNumber || order.deliveryAddress?.phone}</p>
                      )}
                    </div>
                    <div className="order-total">
                      <strong>Total: ₹{calculateTotal(order.items || []).toFixed(2)}</strong>
                    </div>
                  </div>

                  {order.paymentMethod && (
                    <div className="payment-info">
                      <p><strong>Payment:</strong> {order.paymentMethod}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  } catch (componentError) {
    console.error('MyOrders component error:', componentError);
    return (
      <div className="my-orders-overlay">
        <div className="my-orders-container">
          <div className="my-orders-header">
            <h2>My Orders</h2>
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>
          <div className="error">
            <p>Something went wrong loading orders.</p>
            <p>Error: {componentError.message}</p>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }
}
