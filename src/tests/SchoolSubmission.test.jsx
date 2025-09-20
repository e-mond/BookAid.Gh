import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import SchoolSubmission from '../components/SchoolSubmission.jsx';

// Mock the API
jest.mock('../services/api.jsx', () => ({
  submitSchool: jest.fn()
}));

const MockedSchoolSubmission = () => (
  <BrowserRouter>
    <AuthProvider>
      <SchoolSubmission />
    </AuthProvider>
  </BrowserRouter>
);

describe('SchoolSubmission Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders school submission form', () => {
    render(<MockedSchoolSubmission />);
    
    expect(screen.getByText('Submit Student List')).toBeInTheDocument();
    expect(screen.getByText('School Info')).toBeInTheDocument();
  });

  test('shows progress steps', () => {
    render(<MockedSchoolSubmission />);
    
    expect(screen.getByText('School Info')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
  });

  test('allows school name input', () => {
    render(<MockedSchoolSubmission />);
    
    const schoolNameInput = screen.getByLabelText(/school name/i);
    fireEvent.change(schoolNameInput, { target: { value: 'Test School' } });
    
    expect(schoolNameInput.value).toBe('Test School');
  });

  test('allows optional notes input', () => {
    render(<MockedSchoolSubmission />);
    
    const notesTextarea = screen.getByLabelText(/additional notes/i);
    fireEvent.change(notesTextarea, { target: { value: 'Special request for Class 5' } });
    
    expect(notesTextarea.value).toBe('Special request for Class 5');
  });

  test('shows character count for notes', () => {
    render(<MockedSchoolSubmission />);
    
    const notesTextarea = screen.getByLabelText(/additional notes/i);
    fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });
    
    expect(screen.getByText(/9 \/ 500 characters/)).toBeInTheDocument();
  });
});