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

  // Admin Management state
  const [adminList, setAdminList] = useState([]);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin'
  });
  
  // Sales Report state
  const [salesReport, setSalesReport] = useState({
    monthly: [],
    yearly: [],
    selectedPeriod: 'monthly',
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1
  });

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentView === 'admin-management') {
      fetchAdminList();
    }
  }, [currentView]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch orders
      const ordersRes = await fetch('https://greenix-3.onrender.com/api/admin/orders', {
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
      const productsRes = await fetch('https://greenix-3.onrender.com/api/products');
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
      const response = await fetch('https://greenix-3.onrender.com/api/categories');
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
      const response = await fetch(`https://greenix-3.onrender.com/api/admin/revenue/monthly?year=${year}`, {
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

      const response = await fetch('https://greenix-3.onrender.com/api/admin/products', {
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
      const response = await fetch('https://greenix-3.onrender.com/api/admin/categories', {
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
        const response = await fetch(`https://greenix-3.onrender.com/api/admin/categories/${categoryId}`, {
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
        const response = await fetch(`https://greenix-3.onrender.com/api/admin/products/${productId}`, {
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

      const response = await fetch(`https://greenix-3.onrender.com/api/admin/products/${editingProduct._id}`, {
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

      const response = await fetch(`https://greenix-3.onrender.com/api/admin/orders/${orderId}/status`, {
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
                        src={`https://greenix-3.onrender.com/uploads/${product.image}`} 
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

  // Admin Management Functions
  async function handleAddAdmin(e) {
    e.preventDefault();
    try {
      const response = await fetch('https://greenix-3.onrender.com/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminForm)
      });

      if (response.ok) {
        showNotification('Administrator added successfully!', 'success');
        setAdminForm({ name: '', email: '', password: '', phone: '', role: 'admin' });
        fetchAdminList();
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to add administrator', 'error');
      }
    } catch (error) {
      showNotification('Error adding administrator: ' + error.message, 'error');
    }
  }

  async function fetchAdminList() {
    try {
      const response = await fetch('https://greenix-3.onrender.com/api/admin/admin-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminList(data);
      }
    } catch (error) {
      console.error('Error fetching admin list:', error);
    }
  }

  async function handleDeleteAdmin(adminId) {
    if (window.confirm('Are you sure you want to delete this administrator?')) {
      try {
        const response = await fetch(`https://greenix-3.onrender.com/api/admin/delete-admin/${adminId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          showNotification('Administrator deleted successfully!', 'success');
          fetchAdminList();
        } else {
          showNotification('Failed to delete administrator', 'error');
        }
      } catch (error) {
        showNotification('Error deleting administrator: ' + error.message, 'error');
      }
    }
  }

  async function handleToggleAdminStatus(adminId) {
    try {
      const response = await fetch(`https://greenix-3.onrender.com/api/admin/toggle-admin-status/${adminId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Administrator status updated!', 'success');
        fetchAdminList();
      } else {
        showNotification('Failed to update administrator status', 'error');
      }
    } catch (error) {
      showNotification('Error updating administrator status: ' + error.message, 'error');
    }
  }

  // Sales Report Functions
  async function handleGenerateReport() {
    try {
      const params = new URLSearchParams({
        period: salesReport.selectedPeriod,
        year: salesReport.selectedYear,
        ...(salesReport.selectedPeriod === 'monthly' && { month: salesReport.selectedMonth })
      });

      const response = await fetch(`https://greenix-3.onrender.com/api/admin/sales-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSalesReport({...salesReport, ...data});
        showNotification('Sales report generated successfully!', 'success');
      } else {
        showNotification('Failed to generate sales report', 'error');
      }
    } catch (error) {
      showNotification('Error generating sales report: ' + error.message, 'error');
    }
  }

  async function handleDownloadReport(format) {
    try {
      const params = new URLSearchParams({
        period: salesReport.selectedPeriod,
        year: salesReport.selectedYear,
        format: format,
        ...(salesReport.selectedPeriod === 'monthly' && { month: salesReport.selectedMonth })
      });

      const response = await fetch(`https://greenix-3.onrender.com/api/admin/download-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${salesReport.selectedPeriod}-${salesReport.selectedYear}${salesReport.selectedPeriod === 'monthly' ? '-' + salesReport.selectedMonth : ''}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification(`${format.toUpperCase()} report downloaded successfully!`, 'success');
      } else {
        showNotification('Failed to download report', 'error');
      }
    } catch (error) {
      showNotification('Error downloading report: ' + error.message, 'error');
    }
  }

  async function handleDownloadMonthlyReport() {
    try {
      const params = new URLSearchParams({
        period: 'monthly',
        year: salesReport.selectedYear,
        format: 'pdf'
      });

      const response = await fetch(`https://greenix-3.onrender.com/api/admin/download-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monthly-sales-report-${salesReport.selectedYear}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification('Monthly report downloaded successfully!', 'success');
      } else {
        showNotification('Failed to download monthly report', 'error');
      }
    } catch (error) {
      showNotification('Error downloading monthly report: ' + error.message, 'error');
    }
  }

  async function handleDownloadYearlyReport() {
    try {
      const params = new URLSearchParams({
        period: 'yearly',
        year: salesReport.selectedYear,
        format: 'pdf'
      });

      const response = await fetch(`https://greenix-3.onrender.com/api/admin/download-report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yearly-sales-report-${salesReport.selectedYear}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification('Yearly report downloaded successfully!', 'success');
      } else {
        showNotification('Failed to download yearly report', 'error');
      }
    } catch (error) {
      showNotification('Error downloading yearly report: ' + error.message, 'error');
    }
  }

  function renderAdminManagement() {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>👥 Admin Management</h2>
          <p>Manage administrator accounts and permissions</p>
        </div>

        <div className="admin-management-container">
          {/* Add New Admin Form */}
          <div className="add-admin-form">
            <h3>Add New Administrator</h3>
            <form onSubmit={handleAddAdmin} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                    required
                    placeholder="Enter admin name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    required
                    placeholder="Enter password"
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">
                ➕ Add Administrator
              </button>
            </form>
          </div>

          {/* Current Admins List */}
          <div className="admin-list">
            <h3>Current Administrators</h3>
            <div className="admin-grid">
              {/* Default Admin Card */}
              <div className="admin-card default-admin">
                <div className="admin-info">
                  <div className="admin-avatar">👑</div>
                  <div className="admin-details">
                    <h4>Default Administrator</h4>
                    <p>admin@pavithratraders.com</p>
                    <span className="admin-role">Super Admin</span>
                  </div>
                </div>
                <div className="admin-status">
                  <span className="status-badge active">Active</span>
                </div>
              </div>

              {/* Dynamic Admin Cards */}
              {adminList.map(admin => (
                <div key={admin._id} className="admin-card">
                  <div className="admin-info">
                    <div className="admin-avatar">👤</div>
                    <div className="admin-details">
                      <h4>{admin.name}</h4>
                      <p>{admin.email}</p>
                      <span className="admin-role">{admin.role}</span>
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => handleToggleAdminStatus(admin._id)}
                    >
                      {admin.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => handleDeleteAdmin(admin._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSalesReport() {
    // Calculate monthly revenue from orders
    const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        return orderDate.getMonth() === index && orderDate.getFullYear() === salesReport.selectedYear;
      });
      
      const revenue = monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const orderCount = monthOrders.length;
      
      return {
        month: new Date(2024, index).toLocaleString('default', { month: 'short' }).toUpperCase(),
        revenue,
        orderCount
      };
    });

    const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
    const totalOrders = monthlyRevenue.reduce((sum, month) => sum + month.orderCount, 0);
    const bestMonth = monthlyRevenue.reduce((max, month) => month.revenue > max.revenue ? month : max, monthlyRevenue[0]);
    const peakRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
    const averageMonthly = totalRevenue / 12;

    return (
      <div className="content-section">
        <div className="section-header">
          <h2>📈 Sales Report</h2>
          <p>Download and analyze sales performance reports</p>
        </div>

        <div className="sales-report-container">
          {/* Download Buttons */}
          <div className="report-download-header">
            <button 
              className="download-btn monthly"
              onClick={() => handleDownloadMonthlyReport()}
            >
              � Download Monthly Report
            </button>
            <button 
              className="download-btn yearly"
              onClick={() => handleDownloadYearlyReport()}
            >
              � Download Yearly Report
            </button>
          </div>

          {/* Monthly Revenue Breakdown */}
          <div className="revenue-breakdown-section">
            <h3>📊 Monthly Revenue Breakdown</h3>
            <div className="revenue-grid">
              {monthlyRevenue.map((month, index) => (
                <div 
                  key={month.month} 
                  className={`revenue-month-card ${month.revenue > 0 ? 'has-revenue' : ''} ${index === 7 || index === 8 ? 'highlighted' : ''}`}
                >
                  <div className="month-name">{month.month}</div>
                  <div className="month-revenue">₹{month.revenue.toLocaleString('en-IN')}</div>
                  <div className="month-orders">
                    {month.orderCount} {month.orderCount === 1 ? 'order' : 'orders'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="chart-section">
            <div className="chart-header">
              <h3>📈 Revenue Trend Analysis</h3>
              <div className="chart-controls">
                <button className="chart-btn active">Monthly View</button>
                <button className="chart-btn">Quarterly</button>
              </div>
            </div>
            <div className="professional-chart-container">
              <div className="chart-info-panel">
                <div className="info-item">
                  <span className="info-label">Peak Month</span>
                  <span className="info-value">{bestMonth.month}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Growth Rate</span>
                  <span className="info-value positive">+12.5%</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Trend</span>
                  <span className="info-value trending">↗️ Positive</span>
                </div>
              </div>
              
              <div className="advanced-chart-wrapper">
                <div className="chart-grid-background">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="grid-line" style={{bottom: `${i * 25}%`}}>
                      <span className="grid-label">₹{Math.round((peakRevenue * i) / 4).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                
                <div className="chart-data-area">
                  <svg className="trend-line" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 0.3}} />
                        <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0.05}} />
                      </linearGradient>
                    </defs>
                    <path
                      d={monthlyRevenue && monthlyRevenue.length > 0 
                        ? `M 0 200 ${monthlyRevenue.map((month, index) => {
                            const x = (index / Math.max(11, monthlyRevenue.length - 1)) * 400;
                            const y = 200 - (peakRevenue > 0 ? ((month?.revenue || 0) / peakRevenue) * 180 : 0);
                            return `L ${Math.round(x)} ${Math.round(y)}`;
                          }).join(' ')} L 400 200 Z`
                        : 'M 0 200 L 400 200 Z'
                      }
                      fill="url(#areaGradient)"
                    />
                    <path
                      d={monthlyRevenue && monthlyRevenue.length > 0
                        ? monthlyRevenue.map((month, index) => {
                            const x = (index / Math.max(11, monthlyRevenue.length - 1)) * 400;
                            const y = 200 - (peakRevenue > 0 ? ((month?.revenue || 0) / peakRevenue) * 180 : 0);
                            return `${index === 0 ? 'M' : 'L'} ${Math.round(x)} ${Math.round(y)}`;
                          }).join(' ')
                        : 'M 0 200 L 400 200'
                      }
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {monthlyRevenue.map((month, index) => {
                      const x = (index / 11) * 400;
                      const y = 200 - (peakRevenue > 0 ? (month.revenue / peakRevenue) * 180 : 0);
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r={month.revenue > 0 ? "6" : "3"}
                          fill={month.revenue > 0 ? "#3b82f6" : "#e5e7eb"}
                          stroke="white"
                          strokeWidth="2"
                          className="data-point"
                        />
                      );
                    })}
                  </svg>
                </div>
                
                <div className="chart-bars-modern">
                  {monthlyRevenue.map((month, index) => {
                    const height = peakRevenue > 0 ? (month.revenue / peakRevenue) * 100 : 0;
                    const isActive = month.revenue > 0;
                    return (
                      <div key={month.month} className="modern-bar-container">
                        <div className="bar-tooltip" data-tooltip={`${month.month} 2025\n₹${month.revenue.toLocaleString('en-IN')}\n${month.orderCount} orders`}>
                          <div 
                            className={`modern-chart-bar ${isActive ? 'active' : 'inactive'} ${index === 7 || index === 8 ? 'highlighted' : ''}`}
                            style={{ height: `${Math.max(height, 2)}%` }}
                          >
                            <div className="bar-glow"></div>
                            <div className="bar-cap"></div>
                          </div>
                        </div>
                        <div className="modern-x-label">{month.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color active"></div>
                  <span>Revenue Generated</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color inactive"></div>
                  <span>No Revenue</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color highlighted"></div>
                  <span>Peak Months</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Statistics */}
          <div className="quick-stats-section">
            <h3>⚡ Quick Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card best-month">
                <div className="stat-label">BEST MONTH</div>
                <div className="stat-value">{bestMonth.month}</div>
              </div>
              <div className="stat-card peak-revenue">
                <div className="stat-label">PEAK REVENUE</div>
                <div className="stat-value">₹{peakRevenue.toLocaleString('en-IN')}</div>
              </div>
              <div className="stat-card average-monthly">
                <div className="stat-label">AVERAGE MONTHLY</div>
                <div className="stat-value">₹{Math.round(averageMonthly).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
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
          <button 
            className={currentView === 'admin-management' ? 'active' : ''}
            onClick={() => setCurrentView('admin-management')}
          >
            👥 Admin Management
          </button>
          <button 
            className={currentView === 'sales-report' ? 'active' : ''}
            onClick={() => setCurrentView('sales-report')}
          >
            📈 Sales Report
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
        {currentView === 'admin-management' && renderAdminManagement()}
        {currentView === 'sales-report' && renderSalesReport()}
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
