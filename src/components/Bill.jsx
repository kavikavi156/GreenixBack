import { useEffect } from 'react';

export default function Bill({ 
  user, 
  cartItems, 
  totalAmount, 
  orderData, 
  onOrderComplete,
  token
}) {
  console.log('Bill component rendered with props:', { user, cartItems, totalAmount, orderData });
  
  const currentDate = new Date();
  const orderDate = currentDate.toLocaleDateString('en-IN');
  const orderTime = currentDate.toLocaleTimeString('en-IN');

  useEffect(() => {
    console.log('Bill component mounted');
    
    // Clear the cart after successful order
    clearCartAfterOrder();
    
    // Don't call onOrderComplete here as it causes the popup
    // The bill should be the final step where user can download/print
  }, []);

  const clearCartAfterOrder = async () => {
    try {
      if (token && user) {
        // Clear cart on server
        const response = await fetch(`http://localhost:3001/api/customer/cart/${user.userId}/clear`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error('Failed to clear cart on server');
        } else {
          console.log('Cart cleared successfully on server');
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Add validation for required props
  if (!user || !cartItems || !orderData) {
    return (
      <div className="bill-container">
        <div className="error-message">
          <h3>⚠️ Bill Generation Error</h3>
          <p>Missing required information to generate the bill.</p>
          <p>Please contact support if this issue persists.</p>
        </div>
      </div>
    );
  }

  function printBill() {
    window.print();
  }

  function downloadBill() {
    // Create a printable version
    const printContent = document.getElementById('bill-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Bill - ${orderData.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .bill-container { max-width: 600px; margin: 0 auto; }
            .bill-header { text-align: center; border-bottom: 2px solid #4caf50; padding-bottom: 10px; }
            .bill-section { margin: 20px 0; }
            .bill-items table { width: 100%; border-collapse: collapse; }
            .bill-items th, .bill-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .bill-items th { background-color: #f2f2f2; }
            .bill-total { font-size: 1.2em; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div className="bill-container">
      <div id="bill-content">
        {/* Bill Header */}
        <div className="bill-header">
          <h2>🌾 Pavithra Traders</h2>
          <p>Agricultural Products & Supplies</p>
          <p>Contact: info@pavithratraders.com | Phone: +91-9876543210</p>
        </div>

        {/* Order Information */}
        <div className="bill-section">
          <h3>Order Details</h3>
          <div className="order-info">
            <p><strong>Order ID:</strong> #{orderData.orderId}</p>
            <p><strong>Date:</strong> {orderDate}</p>
            <p><strong>Time:</strong> {orderTime}</p>
            <p><strong>Status:</strong> {orderData.paymentMethod === 'cod' ? 'Confirmed - COD' : 'Paid'}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bill-section">
          <h3>Customer Details</h3>
          <div className="customer-info">
            <p><strong>Name:</strong> {orderData.address.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {orderData.address.phone}</p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bill-section">
          <h3>Delivery Address</h3>
          <div className="delivery-address">
            <p>{orderData.address.street}</p>
            {orderData.address.landmark && <p>Near {orderData.address.landmark}</p>}
            <p>{orderData.address.city}, {orderData.address.state} - {orderData.address.pincode}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bill-section">
          <h3>Items Ordered</h3>
          <div className="bill-items">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price per Unit</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => {
                  // Add null safety checks
                  const product = item?.product || {};
                  const productName = product?.name || `Product ${index + 1}`;
                  const productCategory = product?.category || 'N/A';
                  const productPrice = product?.price || 0;
                  const productUnit = product?.unit || 'unit';
                  const quantity = item?.quantity || 1;
                  const itemTotal = productPrice * quantity;
                  
                  return (
                    <tr key={item?._id || product?._id || index}>
                      <td>{productName}</td>
                      <td>{productCategory}</td>
                      <td>₹{productPrice} per {productUnit}</td>
                      <td>{quantity}</td>
                      <td>₹{itemTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bill-section">
          <h3>Payment Information</h3>
          <div className="payment-info">
            <p><strong>Payment Method:</strong> {
              orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
              orderData.paymentMethod.toUpperCase() + ' Payment'
            }</p>
            {orderData.paymentDetails?.transactionId && (
              <p><strong>Transaction ID:</strong> {orderData.paymentDetails.transactionId}</p>
            )}
            {orderData.paymentDetails?.upiApp && (
              <p><strong>Paid via:</strong> {orderData.paymentDetails.upiApp}</p>
            )}
          </div>
        </div>

        {/* Total Amount */}
        <div className="bill-section">
          <div className="bill-total">
            <p>Subtotal: ₹{totalAmount}</p>
            <p>Delivery Charges: Free</p>
            <hr />
            <p><strong>Total Amount: ₹{totalAmount}</strong></p>
          </div>
        </div>

        {/* Footer */}
        <div className="bill-footer">
          <p style={{ textAlign: 'center', fontSize: '0.9em', color: '#666' }}>
            Thank you for choosing Pavithra Traders!<br />
            For any queries, contact us at info@pavithratraders.com
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bill-actions">
        <button className="btn-secondary" onClick={printBill}>
          🖨️ Print Bill
        </button>
        <button className="btn-secondary" onClick={downloadBill}>
          📥 Download PDF
        </button>
        <button className="btn-primary" onClick={() => {
          // Navigate to home page
          window.location.href = '/';
        }}>
          🛒 Continue Shopping
        </button>
        <button className="btn-outline" onClick={() => {
          // Navigate to orders page
          window.location.href = '/orders';
        }}>
          📋 My Orders
        </button>
      </div>
      
      {/* Success Message */}
      <div className="order-success-message">
        <div className="success-icon">✅</div>
        <h3>Order Placed Successfully!</h3>
        <p>Your order #{orderData.orderId} has been confirmed and will be processed shortly.</p>
        <p>You will receive SMS updates on your registered mobile number.</p>
      </div>
    </div>
  );
}
