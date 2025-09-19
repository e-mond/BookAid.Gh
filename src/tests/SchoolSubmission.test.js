import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SchoolSubmission from '../components/SchoolSubmission';
import { AuthProvider } from '../contexts/AuthContext';
import { schoolService } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  schoolService: {
    submitSchool: jest.fn()
  }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: ({ onDrop }) => ({
    getRootProps: () => ({
      onClick: () => {},
      onDrop: () => {}
    }),
    getInputProps: () => ({}),
    isDragActive: false
  })
}));

// Helper function to render SchoolSubmission with providers
const renderSchoolSubmission = () => {
  const mockUser = { id: '1', role: 'school', name: 'Test School' };
  
  return render(
    <BrowserRouter>
      <AuthProvider>
        <SchoolSubmission />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('SchoolSubmission Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders school submission form with tabs', () => {
    renderSchoolSubmission();
    
    expect(screen.getByText('Submit Student List')).toBeInTheDocument();
    expect(screen.getByText('School Info')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
  });

  test('validates school name in step 1', async () => {
    const user = userEvent.setup();
    renderSchoolSubmission();
    
    const schoolNameInput = screen.getByLabelText(/school name/i);
    const nextButton = screen.getByRole('button', { name: /next: classes/i });
    
    // Initially next button should be disabled
    expect(nextButton).toBeDisabled();
    
    // Enter short name (should show error)
    await user.type(schoolNameInput, 'AB');
    expect(screen.getByText('School name must be at least 3 characters')).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
    
    // Enter valid name
    await user.clear(schoolNameInput);
    await user.type(schoolNameInput, 'Test Primary School');
    expect(screen.getByText('School name is valid')).toBeInTheDocument();
    expect(nextButton).toBeEnabled();
  });

  test('allows adding and removing class rows in step 2', async () => {
    const user = userEvent.setup();
    renderSchoolSubmission();
    
    // Go to step 2
    await user.type(screen.getByLabelText(/school name/i), 'Test School');
    await user.click(screen.getByRole('button', { name: /next: classes/i }));
    
    // Initially should have one class row
    expect(screen.getAllByPlaceholderText(/class name/i)).toHaveLength(1);
    
    // Add another class row
    await user.click(screen.getByRole('button', { name: /add class/i }));
    expect(screen.getAllByPlaceholderText(/class name/i)).toHaveLength(2);
    
    // Fill in class information
    const classNameInputs = screen.getAllByPlaceholderText(/class name/i);
    const countInputs = screen.getAllByPlaceholderText(/count/i);
    
    await user.type(classNameInputs[0], 'Class 1');
    await user.type(countInputs[0], '25');
    await user.type(classNameInputs[1], 'Class 2');
    await user.type(countInputs[1], '30');
    
    // Check total declared
    expect(screen.getByText('Total Declared Students: 55')).toBeInTheDocument();
  });

  test('validates class information', async () => {
    const user = userEvent.setup();
    renderSchoolSubmission();
    
    // Go to step 2
    await user.type(screen.getByLabelText(/school name/i), 'Test School');
    await user.click(screen.getByRole('button', { name: /next: classes/i }));
    
    // Try to proceed without filling class info
    const nextButton = screen.getByRole('button', { name: /next: students/i });
    expect(nextButton).toBeDisabled();
    
    // Fill in invalid class info (duplicate names)
    await user.click(screen.getByRole('button', { name: /add class/i }));
    
    const classNameInputs = screen.getAllByPlaceholderText(/class name/i);
    await user.type(classNameInputs[0], 'Class 1');
    await user.type(classNameInputs[1], 'Class 1'); // Duplicate
    
    expect(screen.getByText('Duplicate class names are not allowed')).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });

  test('validates student count matches declared total', async () => {
    const user = userEvent.setup();
    renderSchoolSubmission();
    
    // Complete steps 1 and 2
    await user.type(screen.getByLabelText(/school name/i), 'Test School');
    await user.click(screen.getByRole('button', { name: /next: classes/i }));
    
    const classNameInput = screen.getByPlaceholderText(/class name/i);
    const countInput = screen.getByPlaceholderText(/count/i);
    
    await user.type(classNameInput, 'Class 1');
    await user.type(countInput, '25');
    await user.click(screen.getByRole('button', { name: /next: students/i }));
    
    // Should show validation error for mismatched count
    expect(screen.getByText(/Student count \(0\) must match total declared \(25\)/)).toBeInTheDocument();
    
    // Add students manually
    for (let i = 0; i < 25; i++) {
      await user.click(screen.getByRole('button', { name: /add student/i }));
    }
    
    // Should now show match
    expect(screen.getByText('Student count matches declared total')).toBeInTheDocument();
  });

  test('submits form successfully', async () => {
    const user = userEvent.setup();
    const mockResponse = { success: true, school: { id: '1', name: 'Test School' } };
    schoolService.submitSchool.mockResolvedValue(mockResponse);
    
    renderSchoolSubmission();
    
    // Complete step 1
    await user.type(screen.getByLabelText(/school name/i), 'Test School');
    await user.click(screen.getByRole('button', { name: /next: classes/i }));
    
    // Complete step 2
    const classNameInput = screen.getByPlaceholderText(/class name/i);
    const countInput = screen.getByPlaceholderText(/count/i);
    
    await user.type(classNameInput, 'Class 1');
    await user.type(countInput, '2');
    await user.click(screen.getByRole('button', { name: /next: students/i }));
    
    // Complete step 3 - add 2 students
    await user.click(screen.getByRole('button', { name: /add student/i }));
    await user.click(screen.getByRole('button', { name: /add student/i }));
    
    // Fill student information
    const nameInputs = screen.getAllByPlaceholderText(/student name/i);
    const dobInputs = screen.getAllByDisplayValue('');
    
    await user.type(nameInputs[0], 'John Doe');
    await user.type(nameInputs[1], 'Jane Smith');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit list/i });
    await user.click(submitButton);
    
    // Verify API call
    await waitFor(() => {
      expect(schoolService.submitSchool).toHaveBeenCalledWith(
        expect.objectContaining({
          schoolName: 'Test School',
          totalDeclared: 2,
          classes: [{ className: 'Class 1', declaredCount: 2 }],
          students: expect.arrayContaining([
            expect.objectContaining({ name: 'John Doe' }),
            expect.objectContaining({ name: 'Jane Smith' })
          ])
        })
      );
    });
  });

  test('shows success modal after submission', async () => {
    const user = userEvent.setup();
    const mockResponse = { success: true, school: { id: '1', name: 'Test School' } };
    schoolService.submitSchool.mockResolvedValue(mockResponse);
    
    renderSchoolSubmission();
    
    // Complete form quickly (minimal steps for testing modal)
    await user.type(screen.getByLabelText(/school name/i), 'Test School');
    await user.click(screen.getByRole('button', { name: /next: classes/i }));
    
    await user.type(screen.getByPlaceholderText(/class name/i), 'Class 1');
    await user.type(screen.getByPlaceholderText(/count/i), '1');
    await user.click(screen.getByRole('button', { name: /next: students/i }));
    
    await user.click(screen.getByRole('button', { name: /add student/i }));
    await user.type(screen.getByPlaceholderText(/student name/i), 'John Doe');
    
    await user.click(screen.getByRole('button', { name: /submit list/i }));
    
    // Check for success modal
    await waitFor(() => {
      expect(screen.getByText('Submission Successful!')).toBeInTheDocument();
      expect(screen.getByText('Your student list has been submitted for review.')).toBeInTheDocument();
    });
  });

  test('has proper accessibility attributes', () => {
    renderSchoolSubmission();
    
    // Check tab accessibility
    const tabs = screen.getAllByRole('button', { name: /School Info|Classes|Students/ });
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected');
    });
    
    // Check form accessibility
    const schoolNameInput = screen.getByLabelText(/school name/i);
    expect(schoolNameInput).toHaveAttribute('aria-describedby');
  });
});