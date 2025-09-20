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

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('UserManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user management page', () => {
    renderWithProviders(<UserManagement />);
    
    expect(screen.getByText(/user management/i)).toBeInTheDocument();
    expect(screen.getByText(/all users/i)).toBeInTheDocument();
  });

  test('shows create user button', () => {
    renderWithProviders(<UserManagement />);
    
    const createButton = screen.getByRole('button', { name: /create new user/i });
    expect(createButton).toBeInTheDocument();
  });

  test('opens create user modal', () => {
    renderWithProviders(<UserManagement />);
    
    const createButton = screen.getByRole('button', { name: /create new user/i });
    fireEvent.click(createButton);
    
    expect(screen.getByText(/create new user/i)).toBeInTheDocument();
  });

  test('validates create user form', async () => {
    renderWithProviders(<UserManagement />);
    
    const createButton = screen.getByRole('button', { name: /create new user/i });
    fireEvent.click(createButton);
    
    const submitButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/role is required/i)).toBeInTheDocument();
    });
  });

  test('validates email format in create user form', async () => {
    renderWithProviders(<UserManagement />);
    
    const createButton = screen.getByRole('button', { name: /create new user/i });
    fireEvent.click(createButton);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  test('shows role options in create user form', () => {
    renderWithProviders(<UserManagement />);
    
    const createButton = screen.getByRole('button', { name: /create new user/i });
    fireEvent.click(createButton);
    
    const roleSelect = screen.getByRole('combobox');
    expect(roleSelect).toBeInTheDocument();
    
    // Check if role options are present
    expect(screen.getByText(/system administrator/i)).toBeInTheDocument();
    expect(screen.getByText(/staff/i)).toBeInTheDocument();
    expect(screen.getByText(/school administrator/i)).toBeInTheDocument();
  });

  test('shows school ID field for school role', () => {
    renderWithProviders(<UserManagement />);
    
    const createButton = screen.getByRole('button', { name: /create new user/i });
    fireEvent.click(createButton);
    
    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'school' } });
    
    expect(screen.getByLabelText(/school id/i)).toBeInTheDocument();
  });

  test('has cancel button in create user modal', () => {
    renderWithProviders(<UserManagement />);
    
    const createButton = screen.getByRole('button', { name: /create new user/i });
    fireEvent.click(createButton);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });
});