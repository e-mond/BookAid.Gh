import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/Login';
import { AuthProvider } from '../contexts/AuthContext';
import { authService } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  authService: {
    login: jest.fn()
  }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Helper function to render Login with providers
const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('renders login form with all required fields', () => {
    renderLogin();
    
    expect(screen.getByText('Welcome to FreeBooks Sekondi')).toBeInTheDocument();
    expect(screen.getByText('Empowering Education!')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('shows validation error for empty fields', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
  });

  test('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByLabelText(/show password/i);
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      user: { id: '1', username: 'admin', role: 'admin', name: 'Administrator' },
      token: 'mock-token'
    };
    
    authService.login.mockResolvedValue(mockResponse);
    renderLogin();
    
    // Fill in form
    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'admin123');
    await user.selectOptions(screen.getByLabelText(/role/i), 'admin');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify API call
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
    });
    
    // Verify navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('shows error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    
    authService.login.mockRejectedValue(new Error(errorMessage));
    renderLogin();
    
    // Fill in form
    await user.type(screen.getByLabelText(/username/i), 'invalid');
    await user.type(screen.getByLabelText(/password/i), 'invalid');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Mock delayed response
    authService.login.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    renderLogin();
    
    // Fill in form
    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'admin123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  test('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    // Trigger validation error
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    
    // Start typing in username field
    await user.type(screen.getByLabelText(/username/i), 'a');
    
    // Error should be cleared
    expect(screen.queryByText('Please fill in all fields')).not.toBeInTheDocument();
  });

  test('displays demo credentials help text', () => {
    renderLogin();
    
    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
    expect(screen.getByText(/Admin.*admin.*admin123/)).toBeInTheDocument();
    expect(screen.getByText(/School.*school1.*school123/)).toBeInTheDocument();
    expect(screen.getByText(/Staff.*staff1.*staff123/)).toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    renderLogin();
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const roleSelect = screen.getByLabelText(/role/i);
    
    expect(usernameInput).toHaveAttribute('aria-label', 'Username input');
    expect(passwordInput).toHaveAttribute('aria-label', 'Password input');
    expect(roleSelect).toHaveAttribute('aria-label', 'Select your role');
  });
});