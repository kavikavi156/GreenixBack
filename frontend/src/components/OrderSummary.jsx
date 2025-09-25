import { useState } from 'react';
import './OrderSummary.css';

export default function OrderSummary({ 
  token, 
  user, 
  cartItems, 
  totalAmount, 
  orderData, 
  onNext, 
  onBack, 
  onOrderComplete 
}) {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  async function placeOrder() {
    setIsPlacingOrder(true);
    setError('');

    try {
      console.log('Placing order with data:', {
        user,
        orderData,
        cartItems,
        totalAmount
      });

      const orderPayload = {
        paymentMethod: orderData.paymentMethod || 'cod',
        deliveryAddress: orderData.address,
        status: 'ordered', // Use valid enum value
        cartItems: cartItems // Add cart items to the payload
      };

      console.log('Sending order payload:', orderPayload);

      const response = await fetch(`https://greenix-3.onrender.com/api/customer/order/${user.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      console.log('Order response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Order placed successfully:', result);
        
        // Add a small delay to ensure proper state update
        setTimeout(() => {
          console.log('Calling onNext with orderId:', result._id);
          onNext({ orderId: result._id || Date.now().toString() });
        }, 100);
      } else {
        const errorData = await response.json();
        console.error('Order failed with error:', errorData);
        setError(errorData.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  }

  // Add safety checks
  const safeCartItems = cartItems || [];
  const safeOrderData = orderData || {};
  const safeUser = user || {};

  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Delivery Address */}
      <div className="delivery-info">
        <h4>Delivery Address</h4>
        <div>
          <p><strong>{safeOrderData.address?.fullName || 'N/A'}</strong></p>
          <p>{safeOrderData.address?.phone || 'N/A'}</p>
          <p>{safeOrderData.address?.street || 'N/A'}</p>
          <p>{safeOrderData.address?.city || 'N/A'}, {safeOrderData.address?.state || 'N/A'} {safeOrderData.address?.pincode || 'N/A'}</p>
          {safeOrderData.address?.landmark && <p>Landmark: {safeOrderData.address.landmark}</p>}
        </div>
      </div>

      {/* Order Items */}
      <div className="order-items">
        <h4>Order Items</h4>
        {safeCartItems.length > 0 ? (
          safeCartItems.map((item, index) => {
            // Safely access product data
            const product = item?.product || {};
            const productName = product?.name || `Product ${index + 1}`;
            const productPrice = product?.price || 0;
            const quantity = item?.quantity || 1;
            const itemTotal = productPrice * quantity;

            return (
              <div key={item?._id || index} className="order-item">
                <div className="item-details">
                  <span className="item-name">{productName}</span>
                  <span className="item-quantity">Qty: {quantity}</span>
                  <span className="item-price">₹{itemTotal}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p>No items in cart</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="payment-info">
        <h4>Payment Method</h4>
        <p>{safeOrderData.paymentMethod === 'cod' ? 'Cash on Delivery' : safeOrderData.paymentMethod?.toUpperCase() || 'COD'}</p>
      </div>

      {/* Total */}
      <div className="order-total">
        <h4>Total: ₹{totalAmount || 0}</h4>
      </div>

      {/* Action Buttons */}
      <div className="order-actions">
        <button 
          type="button" 
          onClick={onBack}
          disabled={isPlacingOrder}
          className="btn-secondary"
        >
          Back
        </button>
        <button 
          type="button" 
          onClick={placeOrder}
          disabled={isPlacingOrder || safeCartItems.length === 0}
          className="btn-primary place-order-btn"
        >
          {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>


    </div>
  );
}
