import React, { useState, useEffect } from 'react';
import '../css/OrderManagement.css';

export default function OrderManagement({ token }) {
  const [orders, setOrders] = useState([]);
  const [prebookings, setPrebookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProductPrebookings, setSelectedProductPrebookings] = useState([]);
  const [prebookingCount, setPrebookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (token) {
      fetchOrderData();
      fetchProducts();
    } else {
      setError('No authentication token provided');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedProduct && prebookings.length > 0) {
      filterPrebookingsByProduct();
    }
  }, [selectedProduct, prebookings]);

  async function fetchProducts() {
    try {
      const res = await fetch('http://localhost:3001/api/products');
      if (res.ok) {
        const productsData = await res.json();
        // Filter to only show products with prebooking enabled
        const prebookingEnabledProducts = productsData.filter(product => 
          product.prebookingEnabled !== false
        );
        setProducts(prebookingEnabledProducts || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }

  function filterPrebookingsByProduct() {
    if (!selectedProduct) {
      setSelectedProductPrebookings([]);
      setPrebookingCount(0);
      return;
    }

    const filtered = prebookings.filter(order => {
      // Check new items format
      if (order.items && order.items.length > 0) {
        return order.items.some(item => 
          item.product?._id === selectedProduct || item.product === selectedProduct
        );
      }
      // Check old products format for backward compatibility
      if (order.products && order.products.length > 0) {
        return order.products.some(productId => 
          productId === selectedProduct || productId._id === selectedProduct
        );
      }
      return false;
    });
    
    setSelectedProductPrebookings(filtered);
    
    // Calculate total quantity for selected product
    let totalQuantity = 0;
    filtered.forEach(order => {
      if (order.items && order.items.length > 0) {
        // New format with quantities
        order.items.forEach(item => {
          if (item.product?._id === selectedProduct || item.product === selectedProduct) {
            totalQuantity += item.quantity || 1;
          }
        });
      } else if (order.products && order.products.length > 0) {
        // Old format - count as 1 each
        order.products.forEach(productId => {
          if (productId === selectedProduct || productId._id === selectedProduct) {
            totalQuantity += 1;
          }
        });
      }
    });
    
    setPrebookingCount(totalQuantity);
  }

  async function fetchOrderData() {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching order data with token:', token);
      
      // Fetch regular orders (not prebooked)
      const ordersRes = await fetch('http://localhost:3001/api/admin/orders/ordered', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch prebookings
      const prebookingsRes = await fetch('http://localhost:3001/api/admin/orders/prebooked', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        console.log('Orders data:', ordersData);
        setOrders(ordersData || []);
      } else {
        console.error('Failed to fetch orders:', ordersRes.status);
      }
      
      if (prebookingsRes.ok) {
        const prebookingsData = await prebookingsRes.json();
        console.log('Prebookings data:', prebookingsData);
        setPrebookings(prebookingsData || []);
      } else {
        console.error('Failed to fetch prebookings:', prebookingsRes.status);
      }
      
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Failed to load order data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        const updatedOrder = await res.json();
        
        // Update the appropriate list based on new status
        if (newStatus === 'prebooked') {
          setPrebookings(prev => prev.map(order => 
            order._id === orderId ? updatedOrder : order
          ));
          setOrders(prev => prev.filter(order => order._id !== orderId));
        } else {
          setOrders(prev => prev.map(order => 
            order._id === orderId ? updatedOrder : order
          ));
          setPrebookings(prev => prev.filter(order => order._id !== orderId));
        }
        
        // Refresh data if needed
        fetchOrderData();
      } else {
        setError('Failed to update order status');
      }
    } catch (err) {
      setError('Failed to update order status');
      console.error('Update status error:', err);
    }
  }

  // Toggle prebooking enabled status for a product
  async function togglePrebooking(productId, currentStatus) {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/products/${productId}/prebooking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prebookingEnabled: currentStatus === false // If currently false, enable it; if true, disable it
        })
      });

      if (response.ok) {
        // Update the products list
        setProducts(prev => prev.map(product => 
          product._id === productId 
            ? { ...product, prebookingEnabled: currentStatus === false }
            : product
        ));
      } else {
        setError('Failed to update prebooking status');
      }
    } catch (err) {
      setError('Failed to update prebooking status');
      console.error('Toggle prebooking error:', err);
    }
  }

  // Update product stock and automatically process prebookings
  async function updateStock(productId, newStock) {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: parseInt(newStock) })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the products list
        setProducts(prev => prev.map(product => 
          product._id === productId 
            ? { ...product, stock: parseInt(newStock) }
            : product
        ));

        // Show success message with prebooking processing info
        if (result.prebookingsProcessed > 0) {
          alert(`Stock updated successfully! ${result.prebookingsProcessed} prebookings were automatically converted to orders.`);
          // Refresh data to show updated counts
          fetchOrderData();
          fetchProducts();
        } else {
          alert('Stock updated successfully!');
        }
      } else {
        setError('Failed to update stock');
      }
    } catch (err) {
      setError('Failed to update stock');
      console.error('Update stock error:', err);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'prebooked': return '#ff9800';
      case 'ordered': return '#2196f3';
      case 'confirmed': return '#4caf50';
      case 'shipped': return '#9c27b0';
      case 'delivered': return '#8bc34a';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  if (loading) return (
    <div className="order-management">
      <div className="loading">Loading orders...</div>
    </div>
  );

  if (error) return (
    <div className="order-management">
      <div className="error-message">Error: {error}</div>
      <button onClick={fetchOrderData} className="retry-button">Retry</button>
    </div>
  );

  return (
    <div className="order-management">
      <h2>Order Management</h2>
      
      <div className="order-tabs">
        <button
          className={`tab-button ${activeTab === 'prebookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('prebookings')}
        >
          Prebookings
          <span className="tab-badge">{prebookings ? prebookings.length : 0}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
          <span className="tab-badge">{orders ? orders.length : 0}</span>
        </button>
      </div>

      {activeTab === 'prebookings' && (
        <div className="tab-content">
          <h3>Prebooking Management</h3>
          
          {/* Overall Statistics */}
          <div className="prebooking-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>📦 Total Products</h4>
                <span className="stat-number">{products.length}</span>
              </div>
              <div className="stat-card">
                <h4>🎯 Total Prebookings</h4>
                <span className="stat-number">{prebookings.length}</span>
              </div>
              <div className="stat-card">
                <h4>📊 Products with Prebookings</h4>
                <span className="stat-number">
                  {products.filter(p => (p.prebooked || 0) > 0).length}
                </span>
              </div>
              <div className="stat-card">
                <h4>💰 Total Prebooking Value</h4>
                <span className="stat-number">
                  ₹{products.reduce((total, product) => total + ((product.prebooked || 0) * (product.price || 0)), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* All Products with Prebooking Information */}
          <div className="products-prebooking-grid">
            <h4>All Products - Prebooking Status</h4>
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="products-grid">
                {products.map(product => {
                  const productPrebookings = prebookings.filter(order => {
                    if (order.items && order.items.length > 0) {
                      return order.items.some(item => 
                        item.product?._id === product._id || item.product === product._id
                      );
                    }
                    if (order.products && order.products.length > 0) {
                      return order.products.some(productId => 
                        productId === product._id || productId._id === product._id
                      );
                    }
                    return false;
                  });

                  const totalPrebookingQuantity = productPrebookings.reduce((total, order) => {
                    if (order.items && order.items.length > 0) {
                      return total + order.items.reduce((itemTotal, item) => {
                        if (item.product?._id === product._id || item.product === product._id) {
                          return itemTotal + (item.quantity || 1);
                        }
                        return itemTotal;
                      }, 0);
                    }
                    return total + 1; // Old format
                  }, 0);

                  return (
                    <div key={product._id} className="product-prebooking-card">
                      <div className="product-image-section">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={`http://localhost:3001/uploads/product.images[0]`} 
                            alt={product.name}
                            className="product-thumbnail"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150x100/f0f0f0/666?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            <span>📷</span>
                          </div>
                        )}
                        {(product.prebooked || 0) > 0 && (
                          <div className="prebooking-badge">
                            🔥 {product.prebooked} prebookings
                          </div>
                        )}
                      </div>

                      <div className="product-info-section">
                        <h5 className="product-name">{product.name}</h5>
                        <p className="product-category">{product.category}</p>
                        <p className="product-price">₹{product.price?.toLocaleString()}</p>
                        
                        <div className="product-stats">
                          <div className="stat">
                            <span className="label">Stock:</span>
                            <span className="value">{product.stock || 0}</span>
                          </div>
                          <div className="stat highlight">
                            <span className="label">🎯 Prebookings:</span>
                            <span className="value">{product.prebooked || 0}</span>
                          </div>
                          <div className="stat">
                            <span className="label">Sold:</span>
                            <span className="value">{product.sold || 0}</span>
                          </div>
                        </div>

                        {/* Stock Update Section */}
                        <div className="stock-update-section">
                          <label className="stock-label">Update Stock:</label>
                          <div className="stock-input-group">
                            <input
                              type="number"
                              min="0"
                              className="stock-input"
                              placeholder="New stock"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updateStock(product._id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            />
                            <button
                              className="btn btn-success stock-btn"
                              onClick={(e) => {
                                const input = e.target.previousElementSibling;
                                if (input.value) {
                                  updateStock(product._id, input.value);
                                  input.value = '';
                                }
                              }}
                            >
                              Update
                            </button>
                          </div>
                          {(product.stock === 0 || product.stock === undefined) && (product.prebooked || 0) > 0 && (
                            <div className="stock-warning">
                              ⚠️ Out of stock! {product.prebooked} customers waiting
                            </div>
                          )}
                        </div>

                        <div className="prebooking-actions">
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setSelectedProduct(product._id)}
                          >
                            View Details ({productPrebookings.length} orders)
                          </button>
                          <button 
                            className="btn btn-primary"
                            onClick={() => togglePrebooking(product._id, product.prebookingEnabled)}
                          >
                            {product.prebookingEnabled !== false ? 'Disable Prebooking' : 'Enable Prebooking'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed View for Selected Product */}
          {selectedProduct && (
            <div className="selected-product-details">
              <div className="detail-header">
                <h4>Detailed Prebooking Information</h4>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedProduct('')}
                >
                  ✕ Close Details
                </button>
              </div>
              
              <div className="prebooking-summary">
                <div className="summary-card">
                  <p><strong>Product:</strong> {products.find(p => p._id === selectedProduct)?.name}</p>
                  <p><strong>Total Prebookings:</strong> {selectedProductPrebookings.length}</p>
                  <p><strong>Total Quantity:</strong> {prebookingCount}</p>
                </div>
              </div>

              <div className="prebooking-details">
                <h5>Prebooking Orders</h5>
                {selectedProductPrebookings.length === 0 ? (
                  <p>No prebookings found for this product.</p>
                ) : (
                  <div className="orders-list">
                    {selectedProductPrebookings.map(order => (
                      <div key={order._id} className="order-card">
                        <div className="order-header">
                          <div className="order-info">
                            <h6>Prebooking #{order._id.slice(-6)}</h6>
                            <p>Customer: {order.user?.username || 'Unknown'}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="order-status">
                            <span 
                              className="status-badge" 
                              style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="order-items">
                          <h6>Items:</h6>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => {
                              if (item.product?._id === selectedProduct || item.product === selectedProduct) {
                                return (
                                  <div key={index} className="order-item">
                                    <span className="item-name">{item.product?.name || item.productName}</span>
                                    <span className="item-quantity">Qty: {item.quantity || 1}</span>
                                    <span className="item-price">₹{item.price}</span>
                                  </div>
                                );
                              }
                              return null;
                            }).filter(Boolean)
                          ) : (
                            /* Handle old products format */
                            order.products && order.products.length > 0 ? (
                              order.products.map((product, index) => {
                                if (product._id === selectedProduct || product === selectedProduct) {
                                  return (
                                    <div key={index} className="order-item">
                                      <span className="item-name">{product.name || 'Product'}</span>
                                      <span className="item-quantity">Qty: 1</span>
                                      <span className="item-price">₹{product.price || 0}</span>
                                    </div>
                                  );
                                }
                                return null;
                              }).filter(Boolean)
                            ) : (
                              <p>No items found</p>
                            )
                          )}
                        </div>
                        <div className="order-actions">
                          <button
                            onClick={() => updateOrderStatus(order._id, 'confirmed')}
                            className="action-btn confirm-btn"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                            className="action-btn cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="tab-content">
          <h3>Regular Orders</h3>
          {!orders || orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h4>Order #{order._id.slice(-6)}</h4>
                      <p>Customer: {order.user?.username || 'Unknown'}</p>
                      <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="order-items">
                    <h5>Items:</h5>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.product?.name || item.productName}</span>
                          <span className="item-quantity">Qty: {item.quantity || 1}</span>
                          <span className="item-price">₹{item.price}</span>
                        </div>
                      ))
                    ) : (
                      <p>No items found</p>
                    )}
                    <div className="order-total">
                      <strong>
                        Total: ₹{order.totalAmount || 0}
                      </strong>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      onClick={() => updateOrderStatus(order._id, 'confirmed')}
                      className="action-btn confirm-btn"
                      disabled={order.status === 'confirmed' || order.status === 'delivered'}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'shipped')}
                      className="action-btn ship-btn"
                      disabled={order.status !== 'confirmed'}
                    >
                      Ship
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                      className="action-btn deliver-btn"
                      disabled={order.status !== 'shipped'}
                    >
                      Delivered
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'cancelled')}
                      className="action-btn cancel-btn"
                      disabled={order.status === 'delivered' || order.status === 'cancelled'}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
