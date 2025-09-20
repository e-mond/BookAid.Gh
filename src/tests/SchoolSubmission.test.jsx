import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import SchoolSubmission from '../components/SchoolSubmission.jsx';

// Mock the API
jest.mock('../services/api.jsx', () => ({
  submitSchool: jest.fn()
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

describe('SchoolSubmission Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders school submission form', () => {
    renderWithProviders(<SchoolSubmission />);
    
    expect(screen.getByText(/school submission/i)).toBeInTheDocument();
    expect(screen.getByText(/school info/i)).toBeInTheDocument();
  });

  test('shows step navigation', () => {
    renderWithProviders(<SchoolSubmission />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('validates school name', async () => {
    renderWithProviders(<SchoolSubmission />);
    
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText(/school name is required/i)).toBeInTheDocument();
    });
  });

  test('allows adding classes', () => {
    renderWithProviders(<SchoolSubmission />);
    
    const addClassButton = screen.getByText(/add class/i);
    fireEvent.click(addClassButton);
    
    expect(screen.getByText(/class name/i)).toBeInTheDocument();
    expect(screen.getByText(/declared count/i)).toBeInTheDocument();
  });

  test('allows adding students', () => {
    renderWithProviders(<SchoolSubmission />);
    
    // Navigate to step 3
    const schoolNameInput = screen.getByLabelText(/school name/i);
    fireEvent.change(schoolNameInput, { target: { value: 'Test School' } });
    
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);
    
    // Add a class
    const addClassButton = screen.getByText(/add class/i);
    fireEvent.click(addClassButton);
    
    const classNameInput = screen.getByDisplayValue('');
    fireEvent.change(classNameInput, { target: { value: 'Class 5' } });
    
    const countInput = screen.getAllByDisplayValue('')[1];
    fireEvent.change(countInput, { target: { value: '25' } });
    
    fireEvent.click(nextButton);
    
    // Now we should be on step 3
    const addStudentButton = screen.getByText(/add student/i);
    fireEvent.click(addStudentButton);
    
    expect(screen.getByText(/student name/i)).toBeInTheDocument();
  });

  test('shows notes field with character limit', () => {
    renderWithProviders(<SchoolSubmission />);
    
    const notesTextarea = screen.getByLabelText(/optional notes/i);
    expect(notesTextarea).toBeInTheDocument();
    expect(notesTextarea).toHaveAttribute('maxLength', '500');
  });
});