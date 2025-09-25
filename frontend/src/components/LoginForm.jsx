import { useState } from 'react';

export default function LoginForm({ role, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { username, role });
      
      const res = await fetch('https://greenix-3.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('Login response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Login response data:', data);
      
      if (data.role === role) {
        onLogin(data.token);
      } else {
        setError(`Invalid role. Expected: ${role}, Got: ${data.role}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="enhanced-login-form">
      <h2 className="form-title-hidden">{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>
      
      <div className="input-group">
        <input
          type="text"
          placeholder={`${role === 'admin' ? 'Admin Username' : 'Username'}`}
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          disabled={isLoading}
          className="enhanced-input"
        />
      </div>
      
      <div className="input-group">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="enhanced-input"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="enhanced-submit-btn"
      >
        {isLoading ? (
          <span className="loading-content">
            <span className="spinner"></span>
            Signing in...
          </span>
        ) : (
          `Sign in as ${role === 'admin' ? 'Administrator' : 'Customer'}`
        )}
      </button>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}
    </form>
  );
}
