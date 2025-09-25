import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './DebugPanel.css';

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState({
    token: null,
    decodedToken: null,
    userId: null,
    userExists: null,
    allUsers: null,
    isLoggedIn: false
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      const isLoggedIn = !!token;
      
      let decodedToken = null;
      let userId = null;
      let userExists = null;
      
      if (token) {
        try {
          decodedToken = jwtDecode(token);
          userId = decodedToken.userId;
          
          // Check if user exists
          const userResponse = await fetch(`https://greenix-3.onrender.com/api/customer/debug/user/${userId}`);
          userExists = await userResponse.json();
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      
      // Get all users
      const usersResponse = await fetch('https://greenix-3.onrender.com/api/customer/debug/users');
      const allUsers = await usersResponse.json();
      
      setDebugInfo({
        token,
        decodedToken,
        userId,
        userExists,
        allUsers,
        isLoggedIn
      });
    } catch (error) {
      console.error('Error fetching debug info:', error);
    }
  };

  const testCartAdd = async (productId = "66d63ba4123456789abcdef0") => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        alert('No token found - please login first');
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      console.log('Testing cart add with:', { userId, productId });

      const response = await fetch(`https://greenix-3.onrender.com/api/customer/cart/${userId}/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: 1 })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('SUCCESS: Product added to cart!');
        console.log('Cart add success:', result);
      } else {
        alert(`FAILED: ${result.error || 'Unknown error'}`);
        console.error('Cart add failed:', result);
      }
      
      // Refresh debug info after test
      fetchDebugInfo();
    } catch (error) {
      console.error('Cart test error:', error);
      alert(`ERROR: ${error.message}`);
    }
  };

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        background: '#007bff',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontFamily: 'monospace'
      }} onClick={() => setIsOpen(true)}>
        🐛 Debug
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80vh',
      background: '#1e1e1e',
      color: '#fff',
      border: '1px solid #444',
      borderRadius: '8px',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px',
      overflow: 'auto'
    }}>
      <div style={{
        background: '#007bff',
        padding: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🐛 Debug Panel</span>
        <button onClick={() => setIsOpen(false)} style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px'
        }}>×</button>
      </div>
      
      <div style={{ padding: '15px' }}>
        <div style={{ marginBottom: '15px' }}>
          <button onClick={fetchDebugInfo} style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            marginRight: '10px'
          }}>Refresh</button>
          <button onClick={() => testCartAdd()} style={{
            background: '#ffc107',
            color: 'black',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}>Test Cart Add</button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <strong>Login Status:</strong> {debugInfo.isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}
        </div>

        {debugInfo.token && (
          <div style={{ marginBottom: '10px' }}>
            <strong>Token:</strong>
            <div style={{ 
              background: '#333', 
              padding: '5px', 
              borderRadius: '3px', 
              wordBreak: 'break-all',
              fontSize: '10px'
            }}>
              {debugInfo.token.substring(0, 50)}...
            </div>
          </div>
        )}

        {debugInfo.decodedToken && (
          <div style={{ marginBottom: '10px' }}>
            <strong>Decoded Token:</strong>
            <pre style={{ 
              background: '#333', 
              padding: '5px', 
              borderRadius: '3px',
              fontSize: '10px',
              overflow: 'auto'
            }}>
              {JSON.stringify(debugInfo.decodedToken, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo.userId && (
          <div style={{ marginBottom: '10px' }}>
            <strong>User ID:</strong> {debugInfo.userId}
          </div>
        )}

        {debugInfo.userExists && (
          <div style={{ marginBottom: '10px' }}>
            <strong>User Exists Check:</strong>
            <pre style={{ 
              background: debugInfo.userExists.exists ? '#2d5a2d' : '#5a2d2d', 
              padding: '5px', 
              borderRadius: '3px',
              fontSize: '10px'
            }}>
              {JSON.stringify(debugInfo.userExists, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo.allUsers && (
          <div style={{ marginBottom: '10px' }}>
            <strong>All Users ({debugInfo.allUsers.count}):</strong>
            <pre style={{ 
              background: '#333', 
              padding: '5px', 
              borderRadius: '3px',
              fontSize: '10px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {JSON.stringify(debugInfo.allUsers, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
