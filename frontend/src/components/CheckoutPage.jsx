import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Checkout from './Checkout.jsx';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Get checkout data from navigation state or localStorage
    if (location.state) {
      setCartItems(location.state.cartItems || []);
      setTotalAmount(location.state.totalAmount || 0);
      setToken(location.state.token || '');
    } else {
      // Fallback: try to get data from localStorage and redirect if no cart
      const storedToken = localStorage.getItem('customerToken');
      if (!storedToken) {
        alert('Please login to access checkout');
        navigate('/login');
        return;
      }
      
      // If no state, redirect back to home (cart was probably empty)
      alert('No items in cart. Redirecting to home page.');
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  const handleOrderComplete = (orderData) => {
    console.log('Order completed:', orderData);
    // Don't navigate away immediately - let the user see the bill
    // The bill component will handle the completion flow
  };

  if (!cartItems.length) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Checkout
        token={token}
        cartItems={cartItems}
        totalAmount={totalAmount}
        onClose={handleClose}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}
