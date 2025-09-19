import React, { useState } from 'react';
import { studentService } from '../services/api';
import { useInventory } from '../contexts/InventoryContext';
import AutocompleteSearch from './AutocompleteSearch';
import FileUpload from './FileUpload';
import QRCodeGenerator from './QRCodeGenerator';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  UserIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ParentCollection = () => {
  const { updateInventory, canDistribute } = useInventory();
  
  // Form state
  const [formData, setFormData] = useState({
    studentName: '',
    dateOfBirth: null,
    voterId: '',
    proofFiles: []
  });
  
  // UI state
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collectionResult, setCollectionResult] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear eligibility when form changes
    if (eligibilityResult) {
      setEligibilityResult(null);
      setSelectedStudent(null);
    }
  };

  // Handle student selection from autocomplete
  const handleStudentSelect = (student) => {
    setFormData(prev => ({
      ...prev,
      studentName: student.name,
      dateOfBirth: new Date(student.dob)
    }));
    setSelectedStudent(student);
  };

  // Handle file uploads
  const handleFileUpload = (files) => {
    setFormData(prev => ({
      ...prev,
      proofFiles: files
    }));
  };

  // Check eligibility
  const checkEligibility = async () => {
    if (!formData.studentName || !formData.dateOfBirth) {
      alert('Please provide student name and date of birth');
      return;
    }

    setLoading(true);
    setEligibilityResult(null);
    setSelectedStudent(null);

    try {
      const dobString = formData.dateOfBirth.toISOString().split('T')[0];
      const student = await studentService.getStudentByNameAndDOB(
        formData.studentName,
        dobString
      );
      
      setSelectedStudent(student);
      
      // Check eligibility
      const isEligible = student.eligibleForCollection && !student.issued;
      const booksAvailable = canDistribute(20);
      
      setEligibilityResult({
        eligible: isEligible && booksAvailable,
        student,
        reason: !isEligible 
          ? student.issued 
            ? 'Books already issued to this student'
            : 'Student not eligible for collection'
          : !booksAvailable
          ? 'Insufficient books remaining'
          : 'Student is eligible for book collection'
      });
      
    } catch (error) {
      setEligibilityResult({
        eligible: false,
        student: null,
        reason: error.message || 'Student not found in our records'
      });
    } finally {
      setLoading(false);
    }
  };

  // Collect books
  const collectBooks = async () => {
    if (!selectedStudent || !eligibilityResult?.eligible) {
      return;
    }

    if (!formData.voterId.trim()) {
      alert('Please provide voter ID');
      return;
    }

    if (formData.proofFiles.length === 0) {
      alert('Please upload proof documents');
      return;
    }

    setLoading(true);

    try {
      const collectionData = {
        voterId: formData.voterId,
        proofFiles: formData.proofFiles.map(file => file.name),
        collectedAt: new Date().toISOString(),
        collectedBy: 'parent' // This would come from auth context
      };

      const result = await studentService.collectBooks(selectedStudent.id, collectionData);
      
      // Update inventory
      updateInventory(20);
      
      setCollectionResult(result);
      setShowQRCode(true);
      
      // Reset form
      setFormData({
        studentName: '',
        dateOfBirth: null,
        voterId: '',
        proofFiles: []
      });
      setEligibilityResult(null);
      setSelectedStudent(null);
      
    } catch (error) {
      alert(error.message || 'Failed to collect books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      studentName: '',
      dateOfBirth: null,
      voterId: '',
      proofFiles: []
    });
    setEligibilityResult(null);
    setSelectedStudent(null);
    setCollectionResult(null);
    setShowQRCode(false);
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Collection</h1>
          <p className="mt-2 text-gray-600">
            Collect free exercise books for eligible students.
          </p>
        </div>

        {!showQRCode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Collection form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Information</h2>
              
              <div className="space-y-6">
                {/* Student name with autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteSearch
                    placeholder="Search for student..."
                    value={formData.studentName}
                    onChange={(value) => handleInputChange('studentName', value)}
                    onSelect={handleStudentSelect}
                    searchKeys={['name']}
                    displayKey="name"
                    className="w-full"
                    aria-describedby="student-name-help"
                  />
                  <p id="student-name-help" className="mt-1 text-sm text-gray-500">
                    Start typing to search for the student
                  </p>
                </div>

                {/* Date of birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={formData.dateOfBirth}
                    onChange={(date) => handleInputChange('dateOfBirth', date)}
                    dateFormat="yyyy-MM-dd"
                    maxDate={new Date()}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholderText="Select date of birth"
                    aria-describedby="dob-help"
                  />
                  <p id="dob-help" className="mt-1 text-sm text-gray-500">
                    Enter the student's date of birth for verification
                  </p>
                </div>

                {/* Check eligibility button */}
                <button
                  onClick={checkEligibility}
                  disabled={loading || !formData.studentName || !formData.dateOfBirth}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    'Check Eligibility'
                  )}
                </button>

                {/* Eligibility result */}
                {loading && !eligibilityResult && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <Skeleton height={50} />
                  </div>
                )}

                {eligibilityResult && (
                  <div className={`p-4 border rounded-lg ${
                    eligibilityResult.eligible 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start">
                      {eligibilityResult.eligible ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          eligibilityResult.eligible ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {eligibilityResult.eligible ? 'Eligible for Collection' : 'Not Eligible'}
                        </h3>
                        <p className={`mt-1 text-sm ${
                          eligibilityResult.eligible ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {eligibilityResult.reason}
                        </p>
                        {eligibilityResult.student && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p><strong>School:</strong> {eligibilityResult.student.schoolName}</p>
                            {eligibilityResult.student.className && (
                              <p><strong>Class:</strong> {eligibilityResult.student.className}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional information for eligible students */}
                {eligibilityResult?.eligible && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Collection Details</h3>
                    
                    {/* Voter ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <IdentificationIcon className="h-4 w-4 inline mr-1" />
                        Voter ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.voterId}
                        onChange={(e) => handleInputChange('voterId', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Enter voter ID"
                        aria-describedby="voter-id-help"
                      />
                      <p id="voter-id-help" className="mt-1 text-sm text-gray-500">
                        Parent/guardian voter ID for verification
                      </p>
                    </div>

                    {/* Proof documents */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DocumentArrowUpIcon className="h-4 w-4 inline mr-1" />
                        Proof Documents <span className="text-red-500">*</span>
                      </label>
                      <FileUpload
                        onFilesAccepted={handleFileUpload}
                        acceptedFileTypes={{
                          'image/*': ['.png', '.jpg', '.jpeg'],
                          'application/pdf': ['.pdf']
                        }}
                        maxFiles={3}
                        multiple={true}
                        label="Upload proof documents"
                        description="Upload birth certificate, school ID, or other identification"
                        existingFiles={formData.proofFiles}
                      />
                    </div>

                    {/* Collect button */}
                    <button
                      onClick={collectBooks}
                      disabled={loading || !formData.voterId || formData.proofFiles.length === 0}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-success hover:bg-success-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Collect Books Now'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Information panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Collection Information</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">What You Need</h3>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Student's full name and date of birth</li>
                    <li>Valid voter ID (parent/guardian)</li>
                    <li>Proof documents (birth certificate, school ID, etc.)</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-2">What You Get</h3>
                  <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>20 free exercise books per eligible student</li>
                    <li>Digital receipt with QR code</li>
                    <li>Proof of collection for records</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Notes</h3>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Each student is eligible for books only once</li>
                    <li>Books are distributed on a first-come, first-served basis</li>
                    <li>Valid identification is required for all collections</li>
                  </ul>
                </div>

                {eligibilityResult?.student && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-800 mb-2">Student Details</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Name:</strong> {eligibilityResult.student.name}</p>
                      <p><strong>DOB:</strong> {eligibilityResult.student.dob}</p>
                      <p><strong>School:</strong> {eligibilityResult.student.schoolName}</p>
                      {eligibilityResult.student.className && (
                        <p><strong>Class:</strong> {eligibilityResult.student.className}</p>
                      )}
                      <p><strong>Status:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                          eligibilityResult.student.issued 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {eligibilityResult.student.issued ? 'Books Issued' : 'Eligible'}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* QR Code Receipt */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <CheckCircleIcon className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Collection Successful!</h2>
              <p className="text-gray-600 mt-2">
                Books have been successfully collected. Please save this receipt for your records.
              </p>
            </div>

            {collectionResult && (
              <QRCodeGenerator
                value={collectionResult.receipt.qrCode}
                title="Book Collection Receipt"
                subtitle={`${collectionResult.receipt.studentName} - ${collectionResult.receipt.books} Books`}
                size={200}
                className="mx-auto"
              />
            )}

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Collect for Another Student
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentCollection;