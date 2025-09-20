import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { InventoryProvider } from './contexts/InventoryContext.jsx';

// Components
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

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Role-based background wrapper
const RoleBasedWrapper = ({ children }) => {
  const { user } = useAuth();
  
  const getBackgroundClass = () => {
    if (user?.role === 'staff') return 'bg-blue-50';
    if (user?.role === 'school') return 'bg-green-50';
    return 'bg-gray-50';
  };
  
  return (
    <div className={getBackgroundClass()}>
      {children}
    </div>
  );
};

// Main App Routes
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <RoleBasedWrapper>
              <Dashboard />
            </RoleBasedWrapper>
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/books" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BookRecords />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/approval" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminApproval />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/add-school" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">Add School</h1>
                  <p className="text-gray-600 mt-2">This feature is under development.</p>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/parental-collect" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ParentCollection />
          </ProtectedRoute>
        } 
      />
      
      {/* Staff Routes */}
      <Route 
        path="/staff/delivery" 
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <DeliveryEntry />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff/parental-collect" 
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <ParentCollection />
          </ProtectedRoute>
        } 
      />
      
      {/* School Routes */}
      <Route 
        path="/school/submission" 
        element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolSubmission />
          </ProtectedRoute>
        } 
      />
      
      {/* Shared Routes */}
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <Reports />
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
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </InventoryProvider>
    </AuthProvider>
  );
};

export default App;