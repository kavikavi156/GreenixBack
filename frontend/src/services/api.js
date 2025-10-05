// API Configuration for Greenix Frontend
// This file centralizes all API endpoints and configuration

// Base URLs for different environments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://greenix-3.onrender.com';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('All env vars:', import.meta.env);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  
  // Admin Endpoints
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
    ORDERS: `${API_BASE_URL}/api/admin/orders`,
    REVENUE_MONTHLY: (year) => `${API_BASE_URL}/api/admin/revenue/monthly?year=${year}`,
    DOWNLOAD_REPORT: `${API_BASE_URL}/api/admin/download-report`,
  },
  
  // Products
  PRODUCTS: {
    GET_ALL: `${API_BASE_URL}/api/products`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,
    CREATE: `${API_BASE_URL}/api/products`,
    UPDATE: (id) => `${API_BASE_URL}/api/products/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/products/${id}`,
  },
  
  // Categories
  CATEGORIES: {
    GET_ALL: `${API_BASE_URL}/api/categories`,
  },
  
  // Customer Cart
  CART: {
    GET: (userId) => `${API_BASE_URL}/api/customer/cart/${userId}`,
    ADD_ITEM: (userId, productId) => `${API_BASE_URL}/api/customer/cart/${userId}/${productId}`,
    UPDATE_ITEM: (userId, productId) => `${API_BASE_URL}/api/customer/cart/${userId}/${productId}`,
    REMOVE_ITEM: (userId, productId) => `${API_BASE_URL}/api/customer/cart/${userId}/${productId}`,
    CLEAR: (userId) => `${API_BASE_URL}/api/customer/cart/${userId}/clear`,
  },
  
  // Customer Orders
  ORDERS: {
    CREATE: `${API_BASE_URL}/api/customer/orders`,
    GET_USER_ORDERS: (userId) => `${API_BASE_URL}/api/customer/orders/${userId}`,
  },
  
  // Razorpay Payments
  RAZORPAY: {
    CREATE_ORDER: `${API_BASE_URL}/razorpay/create-order`,
    VERIFY_PAYMENT: `${API_BASE_URL}/razorpay/verify-payment`,
  },
  
  // Health Check
  HEALTH: `${API_BASE_URL}/api/health`,
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...DEFAULT_HEADERS,
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// API utility functions
export const apiUtils = {
  // GET request
  get: async (url, headers = {}) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...DEFAULT_HEADERS, ...headers },
    });
    return response;
  },
  
  // POST request
  post: async (url, data, headers = {}) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...DEFAULT_HEADERS, ...headers },
      body: JSON.stringify(data),
    });
    return response;
  },
  
  // PUT request
  put: async (url, data, headers = {}) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { ...DEFAULT_HEADERS, ...headers },
      body: JSON.stringify(data),
    });
    return response;
  },
  
  // DELETE request
  delete: async (url, headers = {}) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { ...DEFAULT_HEADERS, ...headers },
    });
    return response;
  },
};

export default API_BASE_URL;
