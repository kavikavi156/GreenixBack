import React from 'react';

export default function MyOrders({ token, onClose }) {
  console.log('MyOrders component rendered', { token: !!token });
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '400px',
        maxWidth: '600px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2>📦 My Orders</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
        
        <div>
          <p>My Orders component is working!</p>
          <p>Token: {token ? 'Available' : 'Not available'}</p>
          <button onClick={() => console.log('Test button clicked')}>
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}
