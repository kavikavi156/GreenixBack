import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ProfessionalAdminDashboard from './ProfessionalAdminDashboard.jsx';
import LoginForm from './LoginForm.jsx';
import '../css/EnhancedAdmin.css';

export default function EnhancedAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  function checkAuthStatus() {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      try {
        const decodedToken = jwtDecode(adminToken);
        if (decodedToken.role === 'admin' && decodedToken.exp > Date.now() / 1000) {
          setIsLoggedIn(true);
          setToken(adminToken);
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        localStorage.removeItem('adminToken');
      }
    }
    setLoading(false);
  }

  function handleLogin(adminToken) {
    localStorage.setItem('adminToken', adminToken);
    setToken(adminToken);
    setIsLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setToken(null);
    navigate('/');
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <div className="admin-login-header">
            <h1>🌾 Admin Login</h1>
            <p>Access the administrative dashboard</p>
          </div>
          <LoginForm role="admin" onLogin={handleLogin} />
          <div className="back-to-home">
            <button onClick={() => navigate('/')} className="back-btn">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ProfessionalAdminDashboard token={token} onLogout={handleLogout} />;
}
