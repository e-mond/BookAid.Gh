import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { InventoryProvider } from './contexts/InventoryContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Dashboard from './components/Dashboard.jsx';
import UserManagement from './components/UserManagement.jsx';
import BookRecords from './components/BookRecords.jsx';
import SchoolSubmission from './components/SchoolSubmission.jsx';
import AdminApproval from './components/AdminApproval.jsx';
import DeliveryEntry from './components/DeliveryEntry.jsx';
import ParentCollection from './components/ParentCollection.jsx';
import Reports from './components/Reports.jsx';
import Details from './components/Details.jsx';
import { ToastContainer } from './components/common/Toast.jsx';

// Lazy load heavy components for better performance
const LazyReports = React.lazy(() => import('./components/Reports.jsx'));
const LazyAdminApproval = React.lazy(() => import('./components/AdminApproval.jsx'));
const LazyUserManagement = React.lazy(() => import('./components/UserManagement.jsx'));
const LazyBookRecords = React.lazy(() => import('./components/BookRecords.jsx'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, hasAnyRole } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Layout
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated() && <Navbar />}
      <main className={isAuthenticated() ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
};

// App Routes
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
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <LazyUserManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/books"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <LazyBookRecords />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Suspense fallback={<LoadingSpinner />}>
              <LazyAdminApproval />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/staff/delivery"
        element={
          <ProtectedRoute requiredRoles={['staff']}>
            <DeliveryEntry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/collection"
        element={
          <ProtectedRoute requiredRoles={['staff']}>
            <ParentCollection />
          </ProtectedRoute>
        }
      />

      {/* School Routes */}
      <Route
        path="/school/submit"
        element={
          <ProtectedRoute requiredRoles={['school']}>
            <SchoolSubmission />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/submissions"
        element={
          <ProtectedRoute requiredRoles={['school']}>
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">My Submissions</h1>
              <p className="text-gray-600">Your submission history will be displayed here.</p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredRoles={['admin', 'staff']}>
            <Suspense fallback={<LoadingSpinner />}>
              <LazyReports />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/details/:type"
        element={
          <ProtectedRoute>
            <Details />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <InventoryProvider>
        <Router>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
          <ToastContainer />
        </Router>
      </InventoryProvider>
    </AuthProvider>
  );
};

export default App;