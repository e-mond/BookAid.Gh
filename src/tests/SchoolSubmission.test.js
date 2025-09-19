import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { InventoryProvider } from '../contexts/InventoryContext';
import SchoolSubmission from '../components/SchoolSubmission';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the API service
jest.mock('../services/api', () => ({
  apiService: {
    submitSchool: jest.fn().mockResolvedValue({ success: true, schoolId: 'test-123' })
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

describe('SchoolSubmission Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders school submission form with progress steps', () => {
    render(
      <TestWrapper>
        <SchoolSubmission />
      </TestWrapper>
    );

    // Check if progress steps are displayed
    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    expect(screen.getByText(/step 2/i)).toBeInTheDocument();
    expect(screen.getByText(/step 3/i)).toBeInTheDocument();
    
    // Check if step 1 content is shown
    expect(screen.getByText(/school information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/school name/i)).toBeInTheDocument();
  });

  test('step navigation works correctly', () => {
    render(
      <TestWrapper>
        <SchoolSubmission />
      </TestWrapper>
    );

    const schoolNameInput = screen.getByLabelText(/school name/i);
    const nextButton = screen.getByText(/next: classes/i);

    // Fill school name
    fireEvent.change(schoolNameInput, { target: { value: 'Test School' } });
    
    // Click next button
    fireEvent.click(nextButton);

    // Check if step 2 is shown
    expect(screen.getByText(/class information/i)).toBeInTheDocument();
    expect(screen.getByText(/add class/i)).toBeInTheDocument();
  });

  test('class management works correctly', () => {
    render(
      <TestWrapper>
        <SchoolSubmission />
      </TestWrapper>
    );

    // Navigate to step 2
    const schoolNameInput = screen.getByLabelText(/school name/i);
    fireEvent.change(schoolNameInput, { target: { value: 'Test School' } });
    fireEvent.click(screen.getByText(/next: classes/i));

    // Check if default class row is present
    expect(screen.getByPlaceholderText(/class name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/count/i)).toBeInTheDocument();

    // Add a new class
    fireEvent.click(screen.getByText(/add class/i));
    
    // Should have two class rows now
    const classInputs = screen.getAllByPlaceholderText(/class name/i);
    expect(classInputs).toHaveLength(2);
  });

  test('class validation works correctly', () => {
    render(
      <TestWrapper>
        <SchoolSubmission />
      </TestWrapper>
    );

    // Navigate to step 2
    const schoolNameInput = screen.getByLabelText(/school name/i);
    fireEvent.change(schoolNameInput, { target: { value: 'Test School' } });
    fireEvent.click(screen.getByText(/next: classes/i));

    // Try to proceed without filling class information
    const nextButton = screen.getByText(/next: students/i);
    expect(nextButton).toBeDisabled();
  });

  test('total calculation works correctly', () => {
    render(
      <TestWrapper>
        <SchoolSubmission />
      </TestWrapper>
    );

    // Navigate to step 2
    const schoolNameInput = screen.getByLabelText(/school name/i);
    fireEvent.change(schoolNameInput, { target: { value: 'Test School' } });
    fireEvent.click(screen.getByText(/next: classes/i));

    // Fill class information
    const classNameInput = screen.getByPlaceholderText(/class name/i);
    const countInput = screen.getByPlaceholderText(/count/i);
    
    fireEvent.change(classNameInput, { target: { value: 'Class 5' } });
    fireEvent.change(countInput, { target: { value: '25' } });

    // Check if total is calculated correctly
    expect(screen.getByText(/total students declared: 25/i)).toBeInTheDocument();
    expect(screen.getByText(/total books required: 500/i)).toBeInTheDocument();
  });

  test('student list validation works correctly', async () => {
    render(
      <TestWrapper>
        <SchoolSubmission />
      </TestWrapper>
    );

    // Navigate through steps
    const schoolNameInput = screen.getByLabelText(/school name/i);
    fireEvent.change(schoolNameInput, { target: { value: 'Test School' } });
    fireEvent.click(screen.getByText(/next: classes/i));

    // Fill class information
    const classNameInput = screen.getByPlaceholderText(/class name/i);
    const countInput = screen.getByPlaceholderText(/count/i);
    fireEvent.change(classNameInput, { target: { value: 'Class 5' } });
    fireEvent.change(countInput, { target: { value: '2' } });
    fireEvent.click(screen.getByText(/next: students/i));

    // Check if step 3 is shown
    expect(screen.getByText(/student information/i)).toBeInTheDocument();
    expect(screen.getByText(/add student/i)).toBeInTheDocument();

    // Add students
    fireEvent.click(screen.getByText(/add student/i));
    fireEvent.click(screen.getByText(/add student/i));

    // Fill student information
    const studentNameInputs = screen.getAllByPlaceholderText(/student name/i);
    const dobInputs = screen.getAllByDisplayValue(''); // Date inputs
    
    fireEvent.change(studentNameInputs[0], { target: { value: 'John Doe' } });
    fireEvent.change(studentNameInputs[1], { target: { value: 'Jane Smith' } });
    
    // Check validation message
    await waitFor(() => {
      expect(screen.getByText(/number of students \(2\) must match declared total \(2\)/i)).toBeInTheDocument();
    });
  });

  test('form submission works correctly', async () => {
    render(
      <TestWrapper>
        <SchoolSubmission />
      </TestWrapper>
    );

    // Complete the form
    const schoolNameInput = screen.getByLabelText(/school name/i);
    fireEvent.change(schoolNameInput, { target: { value: 'Test School' } });
    fireEvent.click(screen.getByText(/next: classes/i));

    // Fill class information
    const classNameInput = screen.getByPlaceholderText(/class name/i);
    const countInput = screen.getByPlaceholderText(/count/i);
    fireEvent.change(classNameInput, { target: { value: 'Class 5' } });
    fireEvent.change(countInput, { target: { value: '1' } });
    fireEvent.click(screen.getByText(/next: students/i));

    // Add and fill student
    fireEvent.click(screen.getByText(/add student/i));
    const studentNameInput = screen.getByPlaceholderText(/student name/i);
    fireEvent.change(studentNameInput, { target: { value: 'John Doe' } });

    // Submit form
    const submitButton = screen.getByText(/submit list/i);
    fireEvent.click(submitButton);

    // Check if success modal appears
    await waitFor(() => {
      expect(screen.getByText(/submission successful/i)).toBeInTheDocument();
    });
  });

  test('accessibility features work correctly', () => {
    render(
      <TestWrapper>
        <SchoolSubmission />
      </TestWrapper>
    );

    // Check ARIA attributes
    const schoolNameInput = screen.getByLabelText(/school name/i);
    expect(schoolNameInput).toHaveAttribute('aria-describedby');
  });
});