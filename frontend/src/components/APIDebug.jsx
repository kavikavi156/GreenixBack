// Debug component to verify API configuration
import { useEffect } from 'react';

const APIDebug = () => {
  useEffect(() => {
    console.log('=== API DEBUG INFO ===');
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('Mode:', import.meta.env.MODE);
    console.log('All env vars:', import.meta.env);
    console.log('Expected API URL: http://localhost:3001');
    console.log('=== END DEBUG ===');
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'red', 
      color: 'white', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      API: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}
    </div>
  );
};

export default APIDebug;
