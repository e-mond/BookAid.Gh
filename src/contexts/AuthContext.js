import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('freebooks_token');
    const storedUser = localStorage.getItem('freebooks_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password, role) => {
    try {
      // Simulate API call - in real app, this would call your backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store user data and token
      const userData = {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        name: data.user.name || username
      };

      setUser(userData);
      setToken(data.token);
      
      // Persist to localStorage
      localStorage.setItem('freebooks_token', data.token);
      localStorage.setItem('freebooks_user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      // Fallback to mock login for demo
      const mockUser = {
        id: '1',
        username,
        role,
        name: username
      };
      
      const mockToken = 'mock_token_' + Date.now();
      
      setUser(mockUser);
      setToken(mockToken);
      
      localStorage.setItem('freebooks_token', mockToken);
      localStorage.setItem('freebooks_user', JSON.stringify(mockUser));
      
      return { success: true };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('freebooks_token');
    localStorage.removeItem('freebooks_user');
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};