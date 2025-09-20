import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import Signup from '../components/Signup.jsx';

// Mock the API
jest.mock('../services/api.jsx', () => ({
  signup: jest.fn()
}));

const MockedSignup = () => (
  <BrowserRouter>
    <AuthProvider>
      <Signup />
    </AuthProvider>
  </BrowserRouter>
);

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signup form with all required fields', () => {
    render(<MockedSignup />);
    
    expect(screen.getByLabelText(/username input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/school name input/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('shows login link for existing users', () => {
    render(<MockedSignup />);
    
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  test('displays school registration branding', () => {
    render(<MockedSignup />);
    
    expect(screen.getByText('Join FreeBooks Sekondi')).toBeInTheDocument();
    expect(screen.getByText(/register your school/i)).toBeInTheDocument();
  });

  test('allows user to input school information', () => {
    render(<MockedSignup />);
    
    const usernameInput = screen.getByLabelText(/username input/i);
    const emailInput = screen.getByLabelText(/email input/i);
    const schoolNameInput = screen.getByLabelText(/school name input/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testschool' } });
    fireEvent.change(emailInput, { target: { value: 'test@school.com' } });
    fireEvent.change(schoolNameInput, { target: { value: 'Test School' } });
    
    expect(usernameInput.value).toBe('testschool');
    expect(emailInput.value).toBe('test@school.com');
    expect(schoolNameInput.value).toBe('Test School');
  });
});