import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SchoolSubmission from './components/SchoolSubmission';
import AdminApproval from './components/AdminApproval';
import ParentCollection from './components/ParentCollection';
import Reports from './components/Reports';

// Lazy load components for better performance
const LazyReports = React.lazy(() => import('./components/Reports'));

/**
 * Protected Route component to handle authentication
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * Public Route component for login page
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * Main App Routes component
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/school-submission" 
        element={
          <ProtectedRoute allowedRoles={['school']}>
            <Navbar />
            <SchoolSubmission />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin-approval" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Navbar />
            <AdminApproval />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/parent-collection" 
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <Navbar />
            <ParentCollection />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/reports" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Navbar />
            <Suspense fallback={
              <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }>
              <LazyReports />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 fallback */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute>
            <Navbar />
            <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <a 
                  href="/dashboard" 
                  className="bg-primary text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

/**
 * Main App component with providers
 */
const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InventoryProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </InventoryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;