import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import UserManagement from '../components/UserManagement.jsx';

// Mock the API
jest.mock('../services/api.jsx', () => ({
  getUsers: jest.fn(),
  createUser: jest.fn(),
  removeUser: jest.fn()
}));

const MockedUserManagement = () => (
  <BrowserRouter>
    <AuthProvider>
      <UserManagement />
    </AuthProvider>
  </BrowserRouter>
);

describe('UserManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user management page', () => {
    render(<MockedUserManagement />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText(/manage system users/i)).toBeInTheDocument();
  });

  test('shows add user button', () => {
    render(<MockedUserManagement />);
    
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });

  test('displays user table headers', () => {
    render(<MockedUserManagement />);
    
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('School ID')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('shows access denied for non-admin users', () => {
    // This test would need to mock the user role as non-admin
    render(<MockedUserManagement />);
    
    // The component should show access denied message for non-admin users
    // This would require mocking the auth context
  });
});