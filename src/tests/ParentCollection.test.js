import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { InventoryProvider } from '../contexts/InventoryContext';
import ParentCollection from '../components/ParentCollection';

// Mock the API service
jest.mock('../services/api', () => ({
  apiService: {
    checkEligibility: jest.fn(),
    collectBooks: jest.fn().mockResolvedValue({ success: true, collectionId: 'test-123' })
  }
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

describe('ParentCollection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders parent collection form with all required fields', () => {
    render(
      <TestWrapper>
        <ParentCollection />
      </TestWrapper>
    );

    // Check if all form elements are present
    expect(screen.getByText(/student information/i)).toBeInTheDocument();
    expect(screen.getByText(/search for student by name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/voter id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check eligibility/i })).toBeInTheDocument();
  });

  test('form validation works correctly', () => {
    render(
      <TestWrapper>
        <ParentCollection />
      </TestWrapper>
    );

    const checkButton = screen.getByRole('button', { name: /check eligibility/i });
    
    // Button should be disabled initially
    expect(checkButton).toBeDisabled();
  });

  test('student name selection works correctly', () => {
    render(
      <TestWrapper>
        <ParentCollection />
      </TestWrapper>
    );

    // Check if autocomplete search is present
    const searchInput = screen.getByPlaceholderText(/search for student by name/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('date of birth input works correctly', () => {
    render(
      <TestWrapper>
        <ParentCollection />
      </TestWrapper>
    );

    const dobInput = screen.getByLabelText(/date of birth/i);
    expect(dobInput).toBeInTheDocument();
    expect(dobInput).toHaveAttribute('aria-describedby');
  });

  test('voter ID input works correctly', () => {
    render(
      <TestWrapper>
        <ParentWrapper>
          <ParentCollection />
        </ParentWrapper>
      </TestWrapper>
    );

    const voterIdInput = screen.getByLabelText(/voter id/i);
    expect(voterIdInput).toBeInTheDocument();
    expect(voterIdInput).toHaveAttribute('aria-describedby');
  });

  test('eligibility check works with valid data', async () => {
    const mockCheckEligibility = require('../services/api').apiService.checkEligibility;
    mockCheckEligibility.mockResolvedValue({
      eligible: true,
      student: {
        id: '1',
        name: 'John Doe',
        dob: '2010-01-01'
      },
      message: 'Student is eligible for book collection'
    });

    render(
      <TestWrapper>
        <ParentCollection />
      </TestWrapper>
    );

    // Fill in form data
    const voterIdInput = screen.getByLabelText(/voter id/i);
    fireEvent.change(voterIdInput, { target: { value: '12345' } });

    // Mock student selection
    const searchInput = screen.getByPlaceholderText(/search for student by name/i);
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });

    // Mock date selection
    const dobInput = screen.getByLabelText(/date of birth/i);
    fireEvent.change(dobInput, { target: { value: '2010-01-01' } });

    // Click check eligibility button
    const checkButton = screen.getByRole('button', { name: /check eligibility/i });
    fireEvent.click(checkButton);

    // Wait for eligibility result
    await waitFor(() => {
      expect(screen.getByText(/eligible for collection/i)).toBeInTheDocument();
    });
  });

  test('eligibility check shows error for invalid data', async () => {
    const mockCheckEligibility = require('../services/api').apiService.checkEligibility;
    mockCheckEligibility.mockResolvedValue({
      eligible: false,
      message: 'Student not found or already collected books'
    });

    render(
      <TestWrapper>
        <ParentCollection />
      </TestWrapper>
    );

    // Fill in form data
    const voterIdInput = screen.getByLabelText(/voter id/i);
    fireEvent.change(voterIdInput, { target: { value: '12345' } });

    const searchInput = screen.getByPlaceholderText(/search for student by name/i);
    fireEvent.change(searchInput, { target: { value: 'Invalid Student' } });

    const dobInput = screen.getByLabelText(/date of birth/i);
    fireEvent.change(dobInput, { target: { value: '2010-01-01' } });

    // Click check eligibility button
    const checkButton = screen.getByRole('button', { name: /check eligibility/i });
    fireEvent.click(checkButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/not eligible/i)).toBeInTheDocument();
    });
  });

  test('book collection works for eligible students', async () => {
    const mockCheckEligibility = require('../services/api').apiService.checkEligibility;
    const mockCollectBooks = require('../services/api').apiService.collectBooks;
    
    mockCheckEligibility.mockResolvedValue({
      eligible: true,
      student: {
        id: '1',
        name: 'John Doe',
        dob: '2010-01-01'
      },
      message: 'Student is eligible for book collection'
    });

    mockCollectBooks.mockResolvedValue({
      success: true,
      collectionId: 'test-123'
    });

    render(
      <TestWrapper>
        <ParentCollection />
      </TestWrapper>
    );

    // Fill in form data
    const voterIdInput = screen.getByLabelText(/voter id/i);
    fireEvent.change(voterIdInput, { target: { value: '12345' } });

    const searchInput = screen.getByPlaceholderText(/search for student by name/i);
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });

    const dobInput = screen.getByLabelText(/date of birth/i);
    fireEvent.change(dobInput, { target: { value: '2010-01-01' } });

    // Check eligibility
    const checkButton = screen.getByRole('button', { name: /check eligibility/i });
    fireEvent.click(checkButton);

    // Wait for eligibility result
    await waitFor(() => {
      expect(screen.getByText(/eligible for collection/i)).toBeInTheDocument();
    });

    // Click collect now button
    const collectButton = screen.getByRole('button', { name: /collect now/i });
    fireEvent.click(collectButton);

    // Wait for success modal
    await waitFor(() => {
      expect(screen.getByText(/collection successful/i)).toBeInTheDocument();
    });
  });

  test('loading states are displayed correctly', async () => {
    const mockCheckEligibility = require('../services/api').apiService.checkEligibility;
    mockCheckEligibility.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        eligible: false,
        message: 'Test message'
      }), 100))
    );

    render(
      <TestWrapper>
        <ParentCollection />
      </TestWrapper>
    );

    // Fill in form data
    const voterIdInput = screen.getByLabelText(/voter id/i);
    fireEvent.change(voterIdInput, { target: { value: '12345' } });

    const searchInput = screen.getByPlaceholderText(/search for student by name/i);
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });

    const dobInput = screen.getByLabelText(/date of birth/i);
    fireEvent.change(dobInput, { target: { value: '2010-01-01' } });

    // Click check eligibility button
    const checkButton = screen.getByRole('button', { name: /check eligibility/i });
    fireEvent.click(checkButton);

    // Check if loading state is shown
    expect(screen.getByText(/checking/i)).toBeInTheDocument();
  });

  test('accessibility features work correctly', () => {
    render(
      <TestWrapper>
        <ParentCollection />
      </TestWrapper>
    );

    // Check ARIA attributes
    const dobInput = screen.getByLabelText(/date of birth/i);
    expect(dobInput).toHaveAttribute('aria-describedby');

    const voterIdInput = screen.getByLabelText(/voter id/i);
    expect(voterIdInput).toHaveAttribute('aria-describedby');
  });
});