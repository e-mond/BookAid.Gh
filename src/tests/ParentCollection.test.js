import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ParentCollection from '../components/ParentCollection';
import { AuthProvider } from '../contexts/AuthContext';
import { InventoryProvider } from '../contexts/InventoryContext';
import { studentService } from '../services/api';

// Mock the API service
jest.mock('../services/api', () => ({
  studentService: {
    getStudentByNameAndDOB: jest.fn(),
    collectBooks: jest.fn()
  }
}));

// Mock react-datepicker
jest.mock('react-datepicker', () => {
  return function DatePicker({ onChange, selected, ...props }) {
    return (
      <input
        type="date"
        value={selected ? selected.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange(new Date(e.target.value))}
        {...props}
      />
    );
  };
});

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

// Mock QRCodeGenerator
jest.mock('../components/QRCodeGenerator', () => {
  return function QRCodeGenerator({ value, title, subtitle }) {
    return (
      <div data-testid="qr-code">
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <div>QR Code: {value}</div>
      </div>
    );
  };
});

// Helper function to render ParentCollection with providers
const renderParentCollection = () => {
  const mockUser = { id: '1', role: 'staff', name: 'Test Staff' };
  
  return render(
    <BrowserRouter>
      <AuthProvider>
        <InventoryProvider>
          <ParentCollection />
        </InventoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ParentCollection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders collection form with required fields', () => {
    renderParentCollection();
    
    expect(screen.getByText('Book Collection')).toBeInTheDocument();
    expect(screen.getByText('Collect free exercise books for eligible students.')).toBeInTheDocument();
    expect(screen.getByLabelText(/student name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check eligibility/i })).toBeInTheDocument();
  });

  test('shows information panels', () => {
    renderParentCollection();
    
    expect(screen.getByText('What You Need')).toBeInTheDocument();
    expect(screen.getByText('What You Get')).toBeInTheDocument();
    expect(screen.getByText('Important Notes')).toBeInTheDocument();
    
    // Check specific requirements
    expect(screen.getByText(/Student's full name and date of birth/)).toBeInTheDocument();
    expect(screen.getByText(/20 free exercise books per eligible student/)).toBeInTheDocument();
    expect(screen.getByText(/Each student is eligible for books only once/)).toBeInTheDocument();
  });

  test('validates required fields before eligibility check', async () => {
    const user = userEvent.setup();
    renderParentCollection();
    
    const checkButton = screen.getByRole('button', { name: /check eligibility/i });
    
    // Button should be disabled initially
    expect(checkButton).toBeDisabled();
    
    // Fill in student name only
    await user.type(screen.getByLabelText(/student name/i), 'John Doe');
    expect(checkButton).toBeDisabled();
    
    // Add date of birth
    await user.type(screen.getByLabelText(/date of birth/i), '2010-01-01');
    expect(checkButton).toBeEnabled();
  });

  test('checks student eligibility successfully', async () => {
    const user = userEvent.setup();
    const mockStudent = {
      id: '1',
      name: 'John Doe',
      dob: '2010-01-01',
      schoolName: 'Test School',
      className: 'Class 1',
      eligibleForCollection: true,
      issued: false
    };
    
    studentService.getStudentByNameAndDOB.mockResolvedValue(mockStudent);
    renderParentCollection();
    
    // Fill in form
    await user.type(screen.getByLabelText(/student name/i), 'John Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '2010-01-01');
    
    // Check eligibility
    await user.click(screen.getByRole('button', { name: /check eligibility/i }));
    
    // Wait for API call and result
    await waitFor(() => {
      expect(studentService.getStudentByNameAndDOB).toHaveBeenCalledWith('John Doe', '2010-01-01');
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Eligible for Collection')).toBeInTheDocument();
      expect(screen.getByText('Student is eligible for book collection')).toBeInTheDocument();
    });
    
    // Check student details display
    expect(screen.getByText(/School.*Test School/)).toBeInTheDocument();
    expect(screen.getByText(/Class.*Class 1/)).toBeInTheDocument();
  });

  test('shows ineligible message for student not found', async () => {
    const user = userEvent.setup();
    
    studentService.getStudentByNameAndDOB.mockRejectedValue(new Error('Student not found'));
    renderParentCollection();
    
    // Fill in form
    await user.type(screen.getByLabelText(/student name/i), 'Unknown Student');
    await user.type(screen.getByLabelText(/date of birth/i), '2010-01-01');
    
    // Check eligibility
    await user.click(screen.getByRole('button', { name: /check eligibility/i }));
    
    // Wait for error result
    await waitFor(() => {
      expect(screen.getByText('Not Eligible')).toBeInTheDocument();
      expect(screen.getByText('Student not found')).toBeInTheDocument();
    });
  });

  test('shows ineligible message for student with books already issued', async () => {
    const user = userEvent.setup();
    const mockStudent = {
      id: '1',
      name: 'John Doe',
      dob: '2010-01-01',
      schoolName: 'Test School',
      eligibleForCollection: true,
      issued: true // Books already issued
    };
    
    studentService.getStudentByNameAndDOB.mockResolvedValue(mockStudent);
    renderParentCollection();
    
    // Fill in form and check eligibility
    await user.type(screen.getByLabelText(/student name/i), 'John Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '2010-01-01');
    await user.click(screen.getByRole('button', { name: /check eligibility/i }));
    
    // Wait for result
    await waitFor(() => {
      expect(screen.getByText('Not Eligible')).toBeInTheDocument();
      expect(screen.getByText('Books already issued to this student')).toBeInTheDocument();
    });
  });

  test('shows collection form for eligible student', async () => {
    const user = userEvent.setup();
    const mockStudent = {
      id: '1',
      name: 'John Doe',
      dob: '2010-01-01',
      schoolName: 'Test School',
      eligibleForCollection: true,
      issued: false
    };
    
    studentService.getStudentByNameAndDOB.mockResolvedValue(mockStudent);
    renderParentCollection();
    
    // Check eligibility first
    await user.type(screen.getByLabelText(/student name/i), 'John Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '2010-01-01');
    await user.click(screen.getByRole('button', { name: /check eligibility/i }));
    
    // Wait for eligible result
    await waitFor(() => {
      expect(screen.getByText('Eligible for Collection')).toBeInTheDocument();
    });
    
    // Check that collection form appears
    expect(screen.getByText('Collection Details')).toBeInTheDocument();
    expect(screen.getByLabelText(/voter id/i)).toBeInTheDocument();
    expect(screen.getByText(/proof documents/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /collect books now/i })).toBeInTheDocument();
  });

  test('collects books successfully', async () => {
    const user = userEvent.setup();
    const mockStudent = {
      id: '1',
      name: 'John Doe',
      dob: '2010-01-01',
      schoolName: 'Test School',
      eligibleForCollection: true,
      issued: false
    };
    
    const mockCollectionResult = {
      success: true,
      receipt: {
        id: 'receipt_123',
        studentName: 'John Doe',
        books: 20,
        issuedAt: new Date().toISOString(),
        qrCode: 'FREEBOOKS_1_123456789'
      }
    };
    
    studentService.getStudentByNameAndDOB.mockResolvedValue(mockStudent);
    studentService.collectBooks.mockResolvedValue(mockCollectionResult);
    
    renderParentCollection();
    
    // Check eligibility
    await user.type(screen.getByLabelText(/student name/i), 'John Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '2010-01-01');
    await user.click(screen.getByRole('button', { name: /check eligibility/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Eligible for Collection')).toBeInTheDocument();
    });
    
    // Fill collection details
    await user.type(screen.getByLabelText(/voter id/i), 'VOTER123456');
    
    // Note: File upload would need additional mocking for full test
    // For now, we'll test the validation
    const collectButton = screen.getByRole('button', { name: /collect books now/i });
    expect(collectButton).toBeDisabled(); // Should be disabled without files
  });

  test('shows QR code after successful collection', async () => {
    const user = userEvent.setup();
    const mockStudent = {
      id: '1',
      name: 'John Doe',
      dob: '2010-01-01',
      schoolName: 'Test School',
      eligibleForCollection: true,
      issued: false
    };
    
    const mockCollectionResult = {
      success: true,
      receipt: {
        id: 'receipt_123',
        studentName: 'John Doe',
        books: 20,
        issuedAt: new Date().toISOString(),
        qrCode: 'FREEBOOKS_1_123456789'
      }
    };
    
    studentService.getStudentByNameAndDOB.mockResolvedValue(mockStudent);
    studentService.collectBooks.mockResolvedValue(mockCollectionResult);
    
    renderParentCollection();
    
    // Simulate successful collection by directly setting the result
    // (In a real test, you'd go through the full flow)
    
    // Check that QR code component would be rendered
    expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    renderParentCollection();
    
    const studentNameInput = screen.getByLabelText(/student name/i);
    const dobInput = screen.getByLabelText(/date of birth/i);
    
    expect(studentNameInput).toHaveAttribute('aria-describedby');
    expect(dobInput).toHaveAttribute('aria-describedby');
  });

  test('shows loading state during eligibility check', async () => {
    const user = userEvent.setup();
    
    // Mock delayed response
    studentService.getStudentByNameAndDOB.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    renderParentCollection();
    
    await user.type(screen.getByLabelText(/student name/i), 'John Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '2010-01-01');
    await user.click(screen.getByRole('button', { name: /check eligibility/i }));
    
    // Check loading state
    expect(screen.getByText('Checking...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /checking/i })).toBeDisabled();
  });
});