import { useState, useEffect } from 'react';
import '../css/ProfessionalAdminDashboard.css';

export default function ProfessionalAdminDashboard({ token, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Revenue analysis state
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  
  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    basePrice: '',
    category: '',
    stock: '',
    unit: '',
    brand: '',
    weight: '',
    features: '',
    tags: '',
    image: null
  });
  
  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: ''
  });

  // Notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
    
    // Auto-refresh dashboard every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch orders
      const ordersRes = await fetch('http://localhost:3001/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      console.log('Orders received from backend:', ordersData);
      if (ordersData.length > 0) {
        console.log('Sample order:', ordersData[0]);
        console.log('Sample order items:', ordersData[0].items);
        console.log('Sample order products:', ordersData[0].products);
      }
      setOrders(ordersData || []);

      // Fetch products
      const productsRes = await fetch('http://localhost:3001/api/products');
      const productsData = await productsRes.json();
      setProducts(productsData.products || productsData || []);

      // Calculate stats (include all orders in revenue and count)
      const totalRevenue = (ordersData || []).reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const lowStockProducts = (productsData.products || productsData || []).filter(p => p.stock < 10).length;
      const pendingOrders = (ordersData || []).filter(order => 
        order.status === 'pending' || order.status === 'ordered'
      ).length;
      
      console.log('Dashboard stats calculated:', {
        totalOrders: (ordersData || []).length,
        totalRevenue,
        pendingOrders,
        ordersStatuses: (ordersData || []).map(o => o.status)
      });
      
      setStats({
        totalOrders: (ordersData || []).length,
        totalProducts: (productsData.products || productsData || []).length,
        totalRevenue,
        lowStockProducts,
        pendingOrders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Error fetching dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  function showNotification(message, type = 'success') {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }

  async function fetchMonthlyRevenue(year = selectedYear) {
    setRevenueLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/admin/revenue/monthly?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMonthlyRevenue(data.monthlyRevenue || []);
      } else {
        showNotification('Failed to fetch monthly revenue', 'error');
      }
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      showNotification('Error fetching monthly revenue', 'error');
    } finally {
      setRevenueLoading(false);
    }
  }

  function handleRevenueCardClick() {
    setShowRevenueModal(true);
    fetchMonthlyRevenue();
  }

  function handleMonthChange(month) {
    setSelectedMonth(month);
  }

  function handleYearChange(year) {
    setSelectedYear(year);
    fetchMonthlyRevenue(year);
  }

  function getMonthName(monthNum) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('basePrice', productForm.basePrice || productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);
      formData.append('unit', productForm.unit);
      formData.append('brand', productForm.brand);
      formData.append('weight', productForm.weight);
      formData.append('features', productForm.features);
      formData.append('tags', productForm.tags);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      const response = await fetch('http://localhost:3001/api/admin/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        showNotification('Product added successfully!');
        setProductForm({ 
          name: '', 
          description: '', 
          price: '', 
          basePrice: '',
          category: '', 
          stock: '', 
          unit: '',
          brand: '',
          weight: '',
          features: '',
          tags: '',
          image: null 
        });
        fetchDashboardData(); // Refresh products
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showNotification('Error adding product', 'error');
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        showNotification('Category added successfully!');
        setCategoryForm({ name: '', description: '', icon: '' });
        fetchCategories(); // Refresh categories
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      showNotification('Error adding category', 'error');
    }
  }

  async function handleDeleteCategory(categoryId, categoryName) {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          showNotification('Category deleted successfully!');
          fetchCategories(); // Refresh categories
        } else {
          const errorData = await response.json();
          showNotification(`Error: ${errorData.message || 'Failed to delete category'}`, 'error');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        showNotification('Error deleting category', 'error');
      }
    }
  }

  async function handleDeleteProduct(productId) {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          showNotification('Product deleted successfully!');
          fetchDashboardData(); // Refresh products
        } else {
          showNotification('Error deleting product', 'error');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
      }
    }
  }

  function handleEditProduct(product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      basePrice: (product.basePrice || product.price).toString(),
      category: product.category,
      stock: product.stock.toString(),
      unit: product.unit || '',
      brand: product.brand || '',
      weight: product.weight || '',
      features: (product.features || []).join(', '),
      tags: (product.tags || []).join(', '),
      image: null // Don't pre-fill image as it's a file input
    });
    setIsEditModalOpen(true);
  }

  async function handleUpdateProduct(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('basePrice', productForm.basePrice || productForm.price);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);
      formData.append('unit', productForm.unit);
      formData.append('brand', productForm.brand);
      formData.append('weight', productForm.weight);
      formData.append('features', productForm.features);
      formData.append('tags', productForm.tags);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      const response = await fetch(`http://localhost:3001/api/admin/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        showNotification('Product updated successfully!');
        setIsEditModalOpen(false);
        setEditingProduct(null);
        setProductForm({ 
          name: '', 
          description: '', 
          price: '', 
          basePrice: '',
          category: '', 
          stock: '', 
          unit: '',
          brand: '',
          weight: '',
          features: '',
          tags: '',
          image: null 
        });
        fetchDashboardData(); // Refresh products
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showNotification('Error updating product', 'error');
    }
  }

  async function handleUpdateOrderStatus(orderId, newStatus) {
    try {
      // Optimistically update the UI immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showNotification('Order status updated successfully!');
        // No need to refresh since we already updated optimistically
      } else {
        // If failed, revert the optimistic update
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: order.originalStatus || order.status }
              : order
          )
        );
        showNotification('Error updating order status', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Revert the optimistic update on error
      fetchDashboardData();
      showNotification('Error updating order status', 'error');
    }
  }

  function renderDashboard() {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <button onClick={fetchDashboardData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card orders">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p className="stat-number">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="stat-card products">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Total Products</h3>
              <p className="stat-number">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="stat-card revenue clickable" onClick={handleRevenueCardClick}>
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="stat-number">₹{stats.totalRevenue.toLocaleString()}</p>
              <small className="click-hint">Click to view monthly breakdown</small>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>Low Stock</h3>
              <p className="stat-number">{stats.lowStockProducts}</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending Orders</h3>
              <p className="stat-number">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-section">
          <h2>Recent Orders</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6)}</td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">
                          {order.customerName || order.user?.username || order.deliveryAddress?.fullName || 'Unknown Customer'}
                        </div>
                        {order.deliveryAddress?.phone && (
                          <div className="customer-phone">📞 {order.deliveryAddress.phone}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="products-info">
                        {order.items && order.items.length > 0 ? (
                          <div className="products-list">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="product-item">
                                {item.product?.name || 'Unknown Product'} 
                                {item.quantity > 1 && <span className="quantity"> (×{item.quantity})</span>}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="more-products">
                                +{order.items.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : order.products && order.products.length > 0 ? (
                          <div className="products-list">
                            {order.products.slice(0, 2).map((product, index) => (
                              <div key={index} className="product-item">
                                {product?.name || 'Unknown Product'}
                              </div>
                            ))}
                            {order.products.length > 2 && (
                              <div className="more-products">
                                +{order.products.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="no-products">No products</span>
                        )}
                      </div>
                    </td>
                    <td>₹{order.totalAmount}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="date-info">
                        <div className="order-date">
                          {order.formattedDate || new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div className="order-time">
                          {order.formattedTime || new Date(order.orderDate || order.createdAt).toLocaleTimeString('en-IN')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Modal */}
        {showRevenueModal && (
          <div className="modal-overlay" onClick={() => setShowRevenueModal(false)}>
            <div className="revenue-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Monthly Revenue Analysis</h2>
                <button 
                  className="close-btn" 
                  onClick={() => setShowRevenueModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="revenue-controls">
                  <div className="year-selector">
                    <label>Year:</label>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => handleYearChange(Number(e.target.value))}
                    >
                      {[2023, 2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="month-selector">
                    <label>Month:</label>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => handleMonthChange(Number(e.target.value))}
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {revenueLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading revenue data...</p>
                  </div>
                ) : (
                  <div className="revenue-content">
                    <div className="revenue-summary">
                      <h3>Revenue for {getMonthName(selectedMonth)} {selectedYear}</h3>
                      <div className="selected-month-revenue">
                        ₹{(monthlyRevenue.find(m => m.month === selectedMonth)?.revenue || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="monthly-breakdown">
                      <h4>Year Overview</h4>
                      <div className="revenue-grid">
                        {monthlyRevenue.map((data, index) => (
                          <div 
                            key={index} 
                            className={`month-card ${data.month === selectedMonth ? 'selected' : ''}`}
                            onClick={() => handleMonthChange(data.month)}
                          >
                            <div className="month-name">{getMonthName(data.month)}</div>
                            <div className="month-revenue">₹{data.revenue.toLocaleString()}</div>
                            <div className="month-orders">{data.orders} orders</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderProducts() {
    return (
      <div className="products-content">
        <div className="section-header">
          <h1>Product Management</h1>
        </div>

        {/* Add Product Form */}
        <div className="form-section">
          <h2>Add New Product</h2>
          <form onSubmit={handleAddProduct} className="product-form">
            <div className="form-grid">
              <input
                type="text"
                placeholder="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Current Price (₹)"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Base Price per Unit (₹)"
                value={productForm.basePrice}
                onChange={(e) => setProductForm({...productForm, basePrice: e.target.value})}
                required
              />
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Stock Quantity"
                value={productForm.stock}
                onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Unit (e.g., pieces, kg, liters)"
                value={productForm.unit}
                onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
              />
              <input
                type="text"
                placeholder="Brand"
                value={productForm.brand}
                onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
              />
              <input
                type="text"
                placeholder="Weight/Size (e.g., 500g, 1kg)"
                value={productForm.weight}
                onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
              />
            </div>
            <textarea
              placeholder="Product Description"
              value={productForm.description}
              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Features (comma-separated)"
              value={productForm.features}
              onChange={(e) => setProductForm({...productForm, features: e.target.value})}
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={productForm.tags}
              onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})}
              required
            />
            <button type="submit" className="submit-btn">Add Product</button>
          </form>
        </div>

        {/* Products List */}
        <div className="products-list">
          <h2>All Products</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Current Price</th>
                  <th>Base Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <img 
                        src={`http://localhost:3001/uploads/${product.image}`} 
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em">No Image</text></svg>';
                        }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price}</td>
                    <td>₹{product.basePrice || product.price}</td>
                    <td>
                      <span className={`stock-badge ${
                        product.stock === 0 ? 'out' : 
                        product.stock < 10 ? 'low' : 
                        'normal'
                      }`}>
                        {product.stock} {product.unit || 'units'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderCategories() {
    return (
      <div className="categories-content">
        <div className="section-header">
          <h1>Category Management</h1>
        </div>

        {/* Add Category Form */}
        <div className="form-section">
          <h2>Add New Category</h2>
          <form onSubmit={handleAddCategory} className="category-form">
            <div className="form-grid">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                required
              />
            </div>
            <textarea
              placeholder="Category Description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
              required
            />
            <button type="submit" className="submit-btn">Add Category</button>
          </form>
        </div>

        {/* Categories List */}
        <div className="categories-list">
          <h2>All Categories</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category._id} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div className="category-actions">
                  <button 
                    onClick={() => handleDeleteCategory(category._id, category.name)}
                    className="delete-btn category-delete-btn"
                    title="Delete Category"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderOrders() {
    return (
      <div className="orders-content">
        <div className="section-header">
          <h1>Order Management</h1>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customerName}</div>
                      {order.deliveryAddress?.phone && (
                        <div className="customer-phone">📞 {order.deliveryAddress.phone}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="products-info">
                      {order.items && order.items.length > 0 ? (
                        <div className="products-list">
                          {order.items.map((item, index) => (
                            <div key={index} className="product-item">
                              {item.product?.name || 'Unknown Product'} 
                              {item.quantity > 1 && <span className="quantity"> (×{item.quantity})</span>}
                            </div>
                          ))}
                        </div>
                      ) : order.products && order.products.length > 0 ? (
                        <div className="products-list">
                          {order.products.map((product, index) => (
                            <div key={index} className="product-item">
                              {product?.name || 'Unknown Product'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="no-products">No products</span>
                      )}
                    </div>
                  </td>
                  <td>₹{order.totalAmount}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="date-info">
                      <div className="order-date">
                        {order.formattedDate || new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN')}
                      </div>
                      <div className="order-time">
                        {order.formattedTime || new Date(order.orderDate || order.createdAt).toLocaleTimeString('en-IN')}
                      </div>
                    </div>
                  </td>
                  <td>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="professional-admin">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>🌾 Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={currentView === 'products' ? 'active' : ''}
            onClick={() => setCurrentView('products')}
          >
            📦 Products
          </button>
          <button 
            className={currentView === 'categories' ? 'active' : ''}
            onClick={() => setCurrentView('categories')}
          >
            🏷️ Categories
          </button>
          <button 
            className={currentView === 'orders' ? 'active' : ''}
            onClick={() => setCurrentView('orders')}
          >
            📋 Orders
          </button>
          <button onClick={onLogout} className="logout-btn">
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'products' && renderProducts()}
        {currentView === 'categories' && renderCategories()}
        {currentView === 'orders' && renderOrders()}
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button 
                className="close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Herbicides">Herbicides</option>
                    <option value="Insecticides">Insecticides</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Fungicides">Fungicides</option>
                    <option value="Tools">Tools</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Organic Products">Organic Products</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Current Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Base Price per Unit (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm({...productForm, basePrice: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                    placeholder="e.g., pieces, kg, liters"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                    placeholder="Brand name"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows="3"
                  placeholder="Product description"
                />
              </div>
              
              <div className="form-group">
                <label>Weight/Size</label>
                <input
                  type="text"
                  value={productForm.weight}
                  onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
                  placeholder="e.g., 500g, 1kg, 5L"
                />
              </div>
              
              <div className="form-group">
                <label>Features (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.features}
                  onChange={(e) => setProductForm({...productForm, features: e.target.value})}
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>
              
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={productForm.tags}
                  onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              
              <div className="form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})}
                />
                {editingProduct?.image && (
                  <div className="current-image">
                    <small>Current image: {editingProduct.image}</small>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
