import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Lazy load components for better performance
const SchoolSubmission = lazy(() => import('./components/SchoolSubmission'));
const AdminApproval = lazy(() => import('./components/AdminApproval'));
const ParentCollection = lazy(() => import('./components/ParentCollection'));
const Reports = lazy(() => import('./components/Reports'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="pt-16 min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <Skeleton height={40} width={300} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton height={200} />
          <Skeleton height={200} />
          <Skeleton height={200} />
        </div>
        <Skeleton height={400} />
      </div>
    </div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, hasAnyRole, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingFallback />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check role permissions if required
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App component
const AppContent = () => {
  const { loading } = useAuth();

  // Show loading screen while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FreeBooks Sekondi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Dashboard />
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/submit"
          element={
            <ProtectedRoute requiredRoles={['school']}>
              <>
                <Navbar />
                <Suspense fallback={<LoadingFallback />}>
                  <SchoolSubmission />
                </Suspense>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/approve"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <>
                <Navbar />
                <Suspense fallback={<LoadingFallback />}>
                  <AdminApproval />
                </Suspense>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/collect"
          element={
            <ProtectedRoute requiredRoles={['staff', 'admin']}>
              <>
                <Navbar />
                <Suspense fallback={<LoadingFallback />}>
                  <ParentCollection />
                </Suspense>
              </>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRoles={['admin', 'staff']}>
              <>
                <Navbar />
                <Suspense fallback={<LoadingFallback />}>
                  <Reports />
                </Suspense>
              </>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl text-gray-300 mb-4">📚</div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <p className="text-gray-600 mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Go Back
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

// Root App component with providers
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <InventoryProvider>
          <AppContent />
        </InventoryProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;