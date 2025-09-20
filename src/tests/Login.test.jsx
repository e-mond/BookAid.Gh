import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import Login from '../components/Login.jsx';

// Mock the API
jest.mock('../services/api.jsx', () => ({
  login: jest.fn()
}));

const MockedLogin = () => (
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with all required fields', () => {
    render(<MockedLogin />);
    
    expect(screen.getByLabelText(/username input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password input/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('allows user to change role selection', () => {
    render(<MockedLogin />);
    
    const roleSelect = screen.getByLabelText(/role selection/i);
    fireEvent.change(roleSelect, { target: { value: 'staff' } });
    
    expect(roleSelect.value).toBe('staff');
  });

  test('shows signup link for new users', () => {
    render(<MockedLogin />);
    
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up as a school/i)).toBeInTheDocument();
  });

  test('displays FreeBooks Sekondi branding', () => {
    render(<MockedLogin />);
    
    expect(screen.getByText('FreeBooks Sekondi')).toBeInTheDocument();
    expect(screen.getByText(/300,000 exercise books/i)).toBeInTheDocument();
  });
});