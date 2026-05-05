import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults. 
  // Use VITE_API_URL if defined (e.g. production), otherwise fall back to '/api/' (local proxy).
  let apiBaseURL = import.meta.env.VITE_API_URL || '/api';
  if (!apiBaseURL.endsWith('/')) {
    apiBaseURL += '/';
  }
  axios.defaults.baseURL = apiBaseURL;
  
  if (import.meta.env.DEV) {
    console.log('API Base URL:', apiBaseURL);
  }

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('auth/profile');
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching profile', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      console.error('Login Error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message: `Login failed: ${message} (Status: ${error.response?.status || 'Network Error'})` };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('auth/register', userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      console.error('Registration Error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, message: `Registration failed: ${message} (Status: ${error.response?.status || 'Network Error'})` };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get('auth/profile');
      setUser(res.data);
    } catch (error) {
      console.error('Error refreshing profile', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
