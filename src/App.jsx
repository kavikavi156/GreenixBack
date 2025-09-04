import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CustomerPage from './components/CustomerPage.jsx';
import EnhancedAdminPageNew from './components/EnhancedAdminPageNew.jsx';
import CategoryTest from './components/CategoryTest.jsx';
import ProductShowcase from './components/ProductShowcase.jsx';
import LoginPage from './components/LoginPage.jsx';
import EnhancedHomePageNew from './components/EnhancedHomePageNew.jsx';
import Checkout from './components/Checkout.jsx';

function AdminLogin() {
  return <EnhancedAdminPageNew />;
}

function CheckoutWrapper() {
  const location = useLocation();
  const { cartItems, totalAmount, token, isBuyNow } = location.state || {};
  
  if (!cartItems || !token) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Checkout 
      token={token}
      cartItems={cartItems}
      totalAmount={totalAmount}
      onClose={() => window.history.back()}
      onOrderComplete={() => {
        alert('Order completed successfully!');
        // Navigate back to home page after order completion
        window.location.href = '/';
      }}
    />
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<EnhancedHomePageNew />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkout" element={<CheckoutWrapper />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/customer" element={<Navigate to="/" replace />} />
        <Route path="/category-test" element={<CategoryTest />} />
        <Route path="/showcase" element={<ProductShowcase />} />
        <Route path="*" element={<EnhancedHomePageNew />} />
      </Routes>
    </>
  );
}

export default App;
