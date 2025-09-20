import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      const { user: userData, token: userToken } = response.data;
      
      setUser(userData);
      setToken(userToken);
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await api.changePassword(passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.signup(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    changePassword,
    signup,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isSchool: user?.role === 'school'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Import api here to avoid circular dependency
import api from '../services/api.jsx';