import { useState, useEffect } from 'react';
import '../css/EnhancedAdminDashboard.css';

export default function EnhancedAdminDashboard({ token, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lowStockProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch orders
      const ordersRes = await fetch('https://greenix-3.onrender.com/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      // Fetch products
      const productsRes = await fetch('https://greenix-3.onrender.com/api/products');
      const productsData = await productsRes.json();
      setProducts(productsData.products || productsData);

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const lowStockProducts = (productsData.products || productsData).filter(p => p.stock < 10).length;
      
      setStats({
        totalOrders: ordersData.length,
        totalProducts: (productsData.products || productsData).length,
        totalRevenue,
        lowStockProducts
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function renderDashboard() {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2>📊 Admin Dashboard</h2>
          <button onClick={fetchDashboardData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card orders">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          
          <div className="stat-card products">
            <div className="stat-icon">🏪</div>
            <div className="stat-content">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
          </div>
          
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          
          <div className="stat-card low-stock">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{stats.lowStockProducts}</h3>
              <p>Low Stock Items</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <h3>🚚 Recent Orders</h3>
          <div className="recent-orders">
            {orders.slice(0, 5).map(order => (
              <div key={order._id} className="order-card">
                <div className="order-info">
                  <span className="order-id">#{order._id.slice(-6)}</span>
                  <span className="order-user">{order.user?.username}</span>
                  <span className="order-amount">₹{order.totalAmount}</span>
                  <span className={`order-status ${order.status}`}>{order.status}</span>
                </div>
                <div className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="dashboard-section">
          <h3>📉 Low Stock Products</h3>
          <div className="low-stock-products">
            {products.filter(p => p.stock < 10).slice(0, 5).map(product => (
              <div key={product._id} className="product-card low-stock">
                <div className="product-image">
                  {product.images?.length > 0 || product.image ? (
                    <img 
                      src={
                        product.images?.length > 0 
                          ? (product.images[0].startsWith('http') ? product.images[0] : `https://greenix-3.onrender.com/uploads/${product.images[0].replace(/^\/uploads\//, '')}`)
                          : (product.image.startsWith('http') ? product.image : `https://greenix-3.onrender.com/uploads/${product.image.replace(/^\/uploads\//, '')}`)
                      }
                      alt={product.name}
                    />
                  ) : (
                    <div className="no-image">📦</div>
                  )}
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p className="stock-warning">Only {product.stock} left!</p>
                  <div className="stock-actions">
                    {product.stock === 0 ? (
                      <span className="out-of-stock">Out of Stock - Enable Preorder</span>
                    ) : (
                      <span className="low-stock">Low Stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderOrderManagement() {
    return (
      <div className="order-management">
        <div className="section-header">
          <h2>📦 Order Management</h2>
          <div className="order-filters">
            <button className="filter-btn active">All Orders</button>
            <button className="filter-btn">Pending</button>
            <button className="filter-btn">Confirmed</button>
            <button className="filter-btn">Shipped</button>
            <button className="filter-btn">Delivered</button>
          </div>
        </div>

        <div className="orders-table">
          <div className="table-header">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Products</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Date</div>
            <div>Actions</div>
          </div>
          
          {orders.map(order => (
            <div key={order._id} className="table-row">
              <div className="order-id">#{order._id.slice(-8)}</div>
              <div className="customer-info">
                <strong>{order.user?.username || 'Guest'}</strong>
              </div>
              <div className="products-count">{order.products?.length || 0} items</div>
              <div className="amount">₹{order.totalAmount?.toLocaleString()}</div>
              <div className={`status ${order.status}`}>
                <span className="status-badge">{order.status}</span>
              </div>
              <div className="date">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className="actions">
                <button className="btn-view">👁️ View</button>
                <button className="btn-edit">✏️ Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderStockManagement() {
    return (
      <div className="stock-management">
        <div className="section-header">
          <h2>📊 Stock Management</h2>
          <div className="stock-filters">
            <button className="filter-btn active">All Products</button>
            <button className="filter-btn">In Stock</button>
            <button className="filter-btn">Low Stock</button>
            <button className="filter-btn">Out of Stock</button>
          </div>
        </div>

        <div className="products-grid">
          {products.map(product => (
            <div key={product._id} className={`product-stock-card ${getStockStatus(product.stock)}`}>
              <div className="product-image">
                {product.images?.length > 0 || product.image ? (
                  <img 
                    src={
                      product.images?.length > 0 
                        ? (product.images[0].startsWith('http') ? product.images[0] : `https://greenix-3.onrender.com/uploads/${product.images[0].replace(/^\/uploads\//, '')}`)
                        : (product.image.startsWith('http') ? product.image : `https://greenix-3.onrender.com/uploads/${product.image.replace(/^\/uploads\//, '')}`)
                    }
                    alt={product.name}
                  />
                ) : (
                  <div className="no-image">📦</div>
                )}
              </div>
              
              <div className="product-details">
                <h4>{product.name}</h4>
                <p className="category">{product.category}</p>
                <div className="stock-info">
                  <span className="stock-count">Stock: {product.stock}</span>
                  <span className={`stock-status ${getStockStatus(product.stock)}`}>
                    {getStockStatusText(product.stock)}
                  </span>
                </div>
                
                <div className="stock-actions">
                  {product.stock === 0 ? (
                    <button className="btn-enable-preorder">
                      🔔 Enable Preorder
                    </button>
                  ) : (
                    <button className="btn-update-stock">
                      📦 Update Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function getStockStatus(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  function getStockStatusText(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-admin-dashboard">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🛠️ Admin Panel</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={currentView === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </button>
          
          <button 
            className={currentView === 'orders' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('orders')}
          >
            📦 Orders
          </button>
          
          <button 
            className={currentView === 'stock' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('stock')}
          >
            📊 Stock Management
          </button>
          
          <button 
            className={currentView === 'products' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('products')}
          >
            🏪 Products
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'orders' && renderOrderManagement()}
        {currentView === 'stock' && renderStockManagement()}
        {currentView === 'products' && <div>Products management coming soon...</div>}
      </div>
    </div>
  );
}
