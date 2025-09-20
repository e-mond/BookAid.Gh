import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import Signup from '../components/Signup.jsx';

// Mock the API
jest.mock('../services/api.jsx', () => ({
  signup: jest.fn()
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

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signup form', () => {
    renderWithProviders(<Signup />);
    
    expect(screen.getByLabelText(/username input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/school name input/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    renderWithProviders(<Signup />);
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/school name is required/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    renderWithProviders(<Signup />);
    
    const emailInput = screen.getByLabelText(/email input/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  test('validates username length', async () => {
    renderWithProviders(<Signup />);
    
    const usernameInput = screen.getByLabelText(/username input/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  test('validates school name length', async () => {
    renderWithProviders(<Signup />);
    
    const schoolNameInput = screen.getByLabelText(/school name input/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    fireEvent.change(schoolNameInput, { target: { value: 'a' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/school name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  test('has link to login page', () => {
    renderWithProviders(<Signup />);
    
    const loginLink = screen.getByText(/sign in/i);
    expect(loginLink).toBeInTheDocument();
  });
});