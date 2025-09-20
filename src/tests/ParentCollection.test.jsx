import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import ParentCollection from '../components/ParentCollection.jsx';

// Mock the API
jest.mock('../services/api.jsx', () => ({
  searchStudent: jest.fn(),
  collectStudent: jest.fn()
}));

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false
  })
}));

// Mock qrcode.react
jest.mock('qrcode.react', () => {
  return function QRCode() {
    return <div data-testid="qr-code">QR Code</div>;
  };
});

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ParentCollection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders parent collection form', () => {
    renderWithProviders(<ParentCollection />);
    
    expect(screen.getByText(/parent collection/i)).toBeInTheDocument();
    expect(screen.getByText(/search student/i)).toBeInTheDocument();
  });

  test('shows student search form', () => {
    renderWithProviders(<ParentCollection />);
    
    expect(screen.getByLabelText(/student name/i)).toBeInTheDocument();
    expect(screen.getByText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check eligibility/i })).toBeInTheDocument();
  });

  test('validates student search fields', async () => {
    renderWithProviders(<ParentCollection />);
    
    const searchButton = screen.getByRole('button', { name: /check eligibility/i });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText(/student name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
    });
  });

  test('shows file upload area', () => {
    renderWithProviders(<ParentCollection />);
    
    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/png, jpg, pdf up to 3 files/i)).toBeInTheDocument();
  });

  test('allows input of student information', () => {
    renderWithProviders(<ParentCollection />);
    
    const studentNameInput = screen.getByLabelText(/student name/i);
    const voterIdInput = screen.getByLabelText(/voter id/i);
    
    fireEvent.change(studentNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(voterIdInput, { target: { value: '12345' } });
    
    expect(studentNameInput.value).toBe('John Doe');
    expect(voterIdInput.value).toBe('12345');
  });

  test('shows reset button', () => {
    renderWithProviders(<ParentCollection />);
    
    const resetButton = screen.getByRole('button', { name: /reset/i });
    expect(resetButton).toBeInTheDocument();
  });
});