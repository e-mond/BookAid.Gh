import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDropzone } from 'react-dropzone';
import QRCode from 'qrcode.react';
import api from '../services/api.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Toast from './common/Toast.jsx';
import { SkeletonWrapper } from './common/SkeletonWrapper.jsx';

const ParentCollection = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentDob: '',
    voterId: '',
    collectionDate: new Date(),
    proofFiles: []
  });
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showQRCode, setShowQRCode] = useState(false);
  const [collectionReceipt, setCollectionReceipt] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 3,
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({
        ...prev,
        proofFiles: [...prev.proofFiles, ...acceptedFiles]
      }));
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      studentDob: date
    }));
  };

  const validateSearchForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.studentDob) {
      newErrors.studentDob = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCollectionForm = () => {
    const newErrors = {};

    if (!formData.voterId.trim()) {
      newErrors.voterId = 'Voter ID is required';
    }

    if (!formData.collectionDate) {
      newErrors.collectionDate = 'Collection date is required';
    }

    if (formData.proofFiles.length === 0) {
      newErrors.proofFiles = 'At least one proof document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearchStudent = async (e) => {
    e.preventDefault();
    
    if (!validateSearchForm()) {
      return;
    }

    try {
      setSearchLoading(true);
      const searchData = {
        name: formData.studentName.trim(),
        dob: formData.studentDob.toISOString().split('T')[0]
      };

      const response = await api.searchStudent(searchData);
      setSearchResult(response.data);
      showToastMessage('Student found successfully', 'success');
    } catch (error) {
      console.error('Error searching student:', error);
      setSearchResult(null);
      showToastMessage(error.message || 'Student not found', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCollectBooks = async (e) => {
    e.preventDefault();
    
    if (!validateCollectionForm()) {
      return;
    }

    if (!searchResult) {
      showToastMessage('Please search for a student first', 'error');
      return;
    }

    try {
      setCollectionLoading(true);
      const collectionData = {
        voterId: formData.voterId.trim(),
        collectionDate: formData.collectionDate.toISOString(),
        proofFiles: formData.proofFiles.map(file => file.name) // In real app, upload files
      };

      const response = await api.collectStudent(searchResult.id, collectionData);
      
      setCollectionReceipt({
        student: searchResult,
        collection: response.data,
        timestamp: new Date().toISOString()
      });
      setShowQRCode(true);
      showToastMessage('Books collected successfully!', 'success');
    } catch (error) {
      console.error('Error collecting books:', error);
      showToastMessage(error.message || 'Failed to collect books', 'error');
    } finally {
      setCollectionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      studentDob: '',
      voterId: '',
      collectionDate: new Date(),
      proofFiles: []
    });
    setSearchResult(null);
    setCollectionReceipt(null);
    setShowQRCode(false);
    setErrors({});
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      proofFiles: prev.proofFiles.filter((_, i) => i !== index)
    }));
  };

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Parent Collection</h1>
      </div>

      {/* Search Student Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Search Student</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearchStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Student Name"
                name="studentName"
                type="text"
                value={formData.studentName}
                onChange={handleInputChange}
                error={errors.studentName}
                required
                placeholder="Enter student's full name"
              />

              <div>
                <label htmlFor="studentDob" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-error">*</span>
                </label>
                <DatePicker
                  selected={formData.studentDob}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  maxDate={new Date()}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success transition-colors duration-200 ${
                    errors.studentDob ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholderText="Select date of birth"
                />
                {errors.studentDob && (
                  <p className="mt-1 text-sm text-error" role="alert">
                    {errors.studentDob}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={searchLoading}
              disabled={searchLoading}
            >
              Check Eligibility
            </Button>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {searchResult && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Student Information</h2>
          </div>
          <div className="p-6">
            <div className={`p-4 rounded-lg border ${
              searchResult.issued 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  searchResult.issued ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <h3 className={`font-medium ${
                    searchResult.issued ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {searchResult.issued ? 'Already Collected' : 'Eligible for Collection'}
                  </h3>
                  <p className={`text-sm ${
                    searchResult.issued ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {searchResult.name} - {searchResult.dob}
                  </p>
                  {searchResult.issued && (
                    <p className="text-sm text-red-600 mt-1">
                      Books were already collected on {new Date(searchResult.issuedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collection Form */}
      {searchResult && !searchResult.issued && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Collect Books</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleCollectBooks} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Voter ID"
                  name="voterId"
                  type="text"
                  value={formData.voterId}
                  onChange={handleInputChange}
                  error={errors.voterId}
                  required
                  placeholder="Enter voter ID number"
                />

                <div>
                  <label htmlFor="collectionDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Collection Date <span className="text-error">*</span>
                  </label>
                  <DatePicker
                    selected={formData.collectionDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, collectionDate: date }))}
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success transition-colors duration-200 ${
                      errors.collectionDate ? 'border-error' : 'border-gray-300'
                    }`}
                    placeholderText="Select collection date"
                  />
                  {errors.collectionDate && (
                    <p className="mt-1 text-sm text-error" role="alert">
                      {errors.collectionDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof Documents <span className="text-error">*</span>
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-gray-300 hover:border-primary'
                  } ${errors.proofFiles ? 'border-error' : ''}`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {isDragActive
                        ? 'Drop the files here...'
                        : 'Drag & drop files here, or click to select files'
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 3 files
                    </p>
                  </div>
                </div>
                {errors.proofFiles && (
                  <p className="mt-1 text-sm text-error" role="alert">
                    {errors.proofFiles}
                  </p>
                )}

                {/* File List */}
                {formData.proofFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.proofFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Remove ${file.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  disabled={collectionLoading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={collectionLoading}
                  disabled={collectionLoading}
                >
                  Collect Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Receipt */}
      {showQRCode && collectionReceipt && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Collection Receipt</h2>
          </div>
          <div className="p-6">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Books Collected Successfully!
                </h3>
                <p className="text-green-600">
                  {collectionReceipt.student.name} has collected 20 exercise books
                </p>
                <p className="text-sm text-green-600">
                  Collection ID: {collectionReceipt.collection.report.id}
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-4 border rounded-lg">
                  <QRCode
                    value={JSON.stringify({
                      studentId: collectionReceipt.student.id,
                      collectionId: collectionReceipt.collection.report.id,
                      timestamp: collectionReceipt.timestamp,
                      books: 20
                    })}
                    size={200}
                    level="M"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>Collection Date: {new Date(collectionReceipt.timestamp).toLocaleString()}</p>
                <p>Student: {collectionReceipt.student.name}</p>
                <p>Books: 20 exercise books</p>
              </div>

              <Button
                variant="primary"
                onClick={() => {
                  // In a real app, this would print or save the receipt
                  window.print();
                }}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleToastClose}
          duration={3000}
        />
      )}
    </div>
  );
};

export default ParentCollection;