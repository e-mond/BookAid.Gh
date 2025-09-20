import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import Login from '../components/Login.jsx';

// Mock the API
jest.mock('../services/api.jsx', () => ({
  login: jest.fn()
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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/username input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password input/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    renderWithProviders(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/role is required/i)).toBeInTheDocument();
    });
  });

  test('allows user to input credentials', () => {
    renderWithProviders(<Login />);
    
    const usernameInput = screen.getByLabelText(/username input/i);
    const passwordInput = screen.getByLabelText(/password input/i);
    const roleSelect = screen.getByRole('combobox');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.change(roleSelect, { target: { value: 'admin' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
    expect(roleSelect.value).toBe('admin');
  });

  test('shows demo credentials', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/admin1 \/ password/i)).toBeInTheDocument();
    expect(screen.getByText(/staff1 \/ password/i)).toBeInTheDocument();
    expect(screen.getByText(/school1 \/ password/i)).toBeInTheDocument();
  });

  test('has link to signup page', () => {
    renderWithProviders(<Login />);
    
    const signupLink = screen.getByText(/sign up for schools/i);
    expect(signupLink).toBeInTheDocument();
  });
});