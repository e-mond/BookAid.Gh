import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useInventory } from '../contexts/InventoryContext.jsx';
import api from '../services/api.jsx';
import Navbar from './Navbar.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { SkeletonWrapper } from './common/SkeletonWrapper.jsx';
import DatePicker from 'react-datepicker';
import { useDropzone } from 'react-dropzone';
import QRCode from 'qrcode.react';
import 'react-datepicker/dist/react-datepicker.css';

const ParentCollection = () => {
  const { user, isStaff, isAdmin } = useAuth();
  const { deductBooks } = useInventory();
  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    voterId: '',
    collectionDate: new Date(),
    proofFiles: []
  });
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      collectionDate: date
    }));
  };

  const onDrop = (acceptedFiles) => {
    setFormData(prev => ({
      ...prev,
      proofFiles: [...prev.proofFiles, ...acceptedFiles]
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 5
  });

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      proofFiles: prev.proofFiles.filter((_, i) => i !== index)
    }));
  };

  const validateSearchForm = () => {
    const errors = {};
    
    if (!formData.studentName.trim()) {
      errors.studentName = 'Student name is required';
    }
    
    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCollectionForm = () => {
    const errors = {};
    
    if (!formData.voterId.trim()) {
      errors.voterId = 'Voter ID is required';
    }
    
    if (formData.proofFiles.length === 0) {
      errors.proofFiles = 'At least one proof document is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSearchStudent = async (e) => {
    e.preventDefault();
    
    if (!validateSearchForm()) {
      return;
    }
    
    setSearching(true);
    try {
      const response = await api.searchStudent({
        name: formData.studentName,
        dob: formData.dob
      });
      
      setSearchResult(response.data);
      
      if (response.data.found) {
        showToast('Student found and eligible for collection');
      } else {
        showToast('Student not found or not eligible', 'error');
      }
    } catch (error) {
      console.error('Failed to search student:', error);
      showToast('Failed to search student', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleCollectBooks = async (e) => {
    e.preventDefault();
    
    if (!validateCollectionForm()) {
      return;
    }
    
    if (!searchResult?.student) {
      showToast('Please search for student first', 'error');
      return;
    }
    
    setCollecting(true);
    try {
      const collectionData = {
        studentId: searchResult.student.id,
        voterId: formData.voterId,
        collectionDate: formData.collectionDate.toISOString(),
        proofUrls: formData.proofFiles.map(file => file.name) // In real app, upload files first
      };
      
      const response = await api.collectBooks(collectionData);
      deductBooks(20); // 20 books per student
      
      setReceiptData({
        studentName: searchResult.student.name,
        voterId: formData.voterId,
        booksCollected: 20,
        collectionDate: formData.collectionDate,
        receiptNumber: response.data.receipt
      });
      
      setShowQRModal(true);
      showToast('Books collected successfully');
      
      // Reset form
      setFormData({
        studentName: '',
        dob: '',
        voterId: '',
        collectionDate: new Date(),
        proofFiles: []
      });
      setSearchResult(null);
    } catch (error) {
      console.error('Failed to collect books:', error);
      showToast('Failed to collect books', 'error');
    } finally {
      setCollecting(false);
    }
  };

  const canAccess = isStaff || isAdmin;

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parental Collection</h1>
          <p className="text-gray-600 mt-2">Process book collections for external students</p>
        </div>

        <div className="space-y-6">
          {/* Search Student Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Student</h2>
            
            <form onSubmit={handleSearchStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Student Name"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  error={formErrors.studentName}
                  placeholder="Enter student's full name"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <DatePicker
                    selected={formData.dob ? new Date(formData.dob) : null}
                    onChange={(date) => setFormData(prev => ({ ...prev, dob: date }))}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success"
                    placeholderText="Select date of birth"
                  />
                  {formErrors.dob && (
                    <p className="mt-1 text-sm text-error">{formErrors.dob}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={searching}
                className="w-full md:w-auto"
              >
                Check Eligibility
              </Button>
            </form>

            {/* Search Result */}
            {searchResult && (
              <div className={`mt-4 p-4 rounded-md ${
                searchResult.found 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`} role="alert">
                <p className={`text-sm font-medium ${
                  searchResult.found ? 'text-green-800' : 'text-red-800'
                }`}>
                  {searchResult.found 
                    ? `Student found: ${searchResult.student.name} - Eligible for collection`
                    : 'Student not found or not eligible for collection'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Collection Form */}
          {searchResult?.found && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Collect Books</h2>
              
              <form onSubmit={handleCollectBooks} className="space-y-4">
                <Input
                  label="Voter ID"
                  name="voterId"
                  value={formData.voterId}
                  onChange={handleInputChange}
                  error={formErrors.voterId}
                  placeholder="Enter voter ID"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collection Date
                  </label>
                  <DatePicker
                    selected={formData.collectionDate}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof Documents
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <p className="text-gray-600">
                      {isDragActive
                        ? 'Drop the files here...'
                        : 'Drag & drop files here, or click to select files'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Accepted: Images (JPEG, PNG) and PDF files (max 5 files)
                    </p>
                  </div>
                  {formErrors.proofFiles && (
                    <p className="mt-1 text-sm text-error">{formErrors.proofFiles}</p>
                  )}
                  
                  {formData.proofFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.proofFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="success"
                  loading={collecting}
                  className="w-full"
                >
                  Collect Now
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* QR Receipt Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Collection Receipt"
        size="md"
      >
        {receiptData && (
          <div className="space-y-4">
            <div className="text-center">
              <QRCode
                value={`Receipt: ${receiptData.receiptNumber}\nStudent: ${receiptData.studentName}\nBooks: ${receiptData.booksCollected}\nDate: ${receiptData.collectionDate.toLocaleDateString()}`}
                size={200}
                className="mx-auto"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Receipt Number:</span>
                <span>{receiptData.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Student Name:</span>
                <span>{receiptData.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Books Collected:</span>
                <span>{receiptData.booksCollected}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Collection Date:</span>
                <span>{receiptData.collectionDate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Voter ID:</span>
                <span>{receiptData.voterId}</span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowQRModal(false)}
              variant="primary"
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </div>
  );
};

export default ParentCollection;