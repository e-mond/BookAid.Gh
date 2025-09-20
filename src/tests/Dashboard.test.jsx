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

const MockedDashboard = () => (
  <BrowserRouter>
    <AuthProvider>
      <InventoryProvider>
        <Dashboard />
      </InventoryProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with welcome message', () => {
    render(<MockedDashboard />);
    
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test('shows recent activities section', () => {
    render(<MockedDashboard />);
    
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
  });

  test('displays search functionality', () => {
    render(<MockedDashboard />);
    
    expect(screen.getByPlaceholderText(/search activities/i)).toBeInTheDocument();
  });

  test('shows role-based background', () => {
    render(<MockedDashboard />);
    
    // The background class should be applied to the main container
    const mainContainer = screen.getByText(/welcome back/i).closest('div');
    expect(mainContainer).toHaveClass('min-h-screen');
  });
});