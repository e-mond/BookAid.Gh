import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { InventoryProvider } from '../contexts/InventoryContext';
import Login from '../components/Login';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <InventoryProvider>
        {children}
      </InventoryProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders login form with all required fields', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Check if all form elements are present
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('displays welcome message and branding', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByText(/welcome to freebooks sekondi/i)).toBeInTheDocument();
    expect(screen.getByText(/empowering education/i)).toBeInTheDocument();
  });

  test('shows demo credentials', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/school1 \/ password123/i)).toBeInTheDocument();
    expect(screen.getByText(/admin1 \/ password123/i)).toBeInTheDocument();
    expect(screen.getByText(/staff1 \/ password123/i)).toBeInTheDocument();
  });

  test('form validation works correctly', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    // Try to submit empty form
    fireEvent.click(submitButton);
    
    // Check if form validation prevents submission
    expect(screen.getByLabelText(/username/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  test('form submission with valid data', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const roleSelect = screen.getByLabelText(/role/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill in form data
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.change(roleSelect, { target: { value: 'school' } });

    // Submit form
    fireEvent.click(submitButton);

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('role selection works correctly', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const roleSelect = screen.getByLabelText(/role/i);
    
    // Check default value
    expect(roleSelect).toHaveValue('school');
    
    // Change role
    fireEvent.change(roleSelect, { target: { value: 'admin' } });
    expect(roleSelect).toHaveValue('admin');
    
    fireEvent.change(roleSelect, { target: { value: 'staff' } });
    expect(roleSelect).toHaveValue('staff');
  });

  test('loading state is displayed during submission', async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill in form data
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    // Submit form
    fireEvent.click(submitButton);

    // Check if loading state is shown
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  });

  test('form fields are accessible', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Check ARIA labels
    expect(screen.getByLabelText(/username input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select your role/i)).toBeInTheDocument();
  });
});