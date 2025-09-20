import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import { InventoryProvider } from '../contexts/InventoryContext.jsx';
import Dashboard from '../components/Dashboard.jsx';

// Mock the API
jest.mock('../services/api.jsx', () => ({
  getLogs: jest.fn()
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <InventoryProvider>
          {component}
        </InventoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard for admin user', () => {
    // Mock localStorage for admin user
    const mockUser = {
      id: '1',
      username: 'admin1',
      email: 'admin@example.com',
      role: 'admin',
      token: 'mock-token'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token');
    
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText(/welcome back, admin1/i)).toBeInTheDocument();
    expect(screen.getByText(/system administrator dashboard/i)).toBeInTheDocument();
  });

  test('renders dashboard for staff user', () => {
    // Mock localStorage for staff user
    const mockUser = {
      id: '3',
      username: 'staff1',
      email: 'staff@example.com',
      role: 'staff',
      token: 'mock-token'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token');
    
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText(/welcome back, staff1/i)).toBeInTheDocument();
    expect(screen.getByText(/staff dashboard/i)).toBeInTheDocument();
  });

  test('renders dashboard for school user', () => {
    // Mock localStorage for school user
    const mockUser = {
      id: '2',
      username: 'school1',
      email: 'school@example.com',
      role: 'school',
      schoolId: '1',
      token: 'mock-token'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token');
    
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText(/welcome back, school1/i)).toBeInTheDocument();
    expect(screen.getByText(/school administrator dashboard/i)).toBeInTheDocument();
  });

  test('shows recent activities section', () => {
    const mockUser = {
      id: '1',
      username: 'admin1',
      email: 'admin@example.com',
      role: 'admin',
      token: 'mock-token'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token');
    
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText(/recent activities/i)).toBeInTheDocument();
  });

  test('shows search functionality', () => {
    const mockUser = {
      id: '1',
      username: 'admin1',
      email: 'admin@example.com',
      role: 'admin',
      token: 'mock-token'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token');
    
    renderWithProviders(<Dashboard />);
    
    const searchInput = screen.getByPlaceholderText(/search activities/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('allows searching activities', () => {
    const mockUser = {
      id: '1',
      username: 'admin1',
      email: 'admin@example.com',
      role: 'admin',
      token: 'mock-token'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-token');
    
    renderWithProviders(<Dashboard />);
    
    const searchInput = screen.getByPlaceholderText(/search activities/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(searchInput.value).toBe('test search');
  });
});