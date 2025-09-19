import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { apiService } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import AutocompleteSearch from './AutocompleteSearch';
import FileUpload from './FileUpload';
import QRCodeGenerator from './QRCodeGenerator';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * ParentCollection component for staff to help parents collect books
 * Includes eligibility checking and QR code generation for receipts
 */
const ParentCollection = () => {
  const { updateInventory, hasEnoughBooks } = useInventory();
  const [formData, setFormData] = useState({
    studentName: '',
    dob: null,
    voterId: '',
    proofs: []
  });
  
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [collectionData, setCollectionData] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Handle student name selection from autocomplete
  const handleStudentSelect = (student) => {
    setFormData(prev => ({
      ...prev,
      studentName: student.name,
      dob: new Date(student.dob)
    }));
    setEligibilityResult(null);
  };

  // Handle date of birth change
  const handleDOBChange = (date) => {
    setFormData(prev => ({ ...prev, dob: date }));
    setEligibilityResult(null);
  };

  // Handle voter ID change
  const handleVoterIdChange = (e) => {
    setFormData(prev => ({ ...prev, voterId: e.target.value }));
    setEligibilityResult(null);
  };

  // Handle proof file upload
  const handleProofUpload = (files) => {
    setFormData(prev => ({ ...prev, proofs: files }));
  };

  // Check eligibility
  const checkEligibility = async () => {
    if (!formData.studentName || !formData.dob || !formData.voterId) {
      setEligibilityResult({
        eligible: false,
        message: 'Please fill in all required fields'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.checkEligibility(
        formData.studentName,
        formData.dob.toISOString().split('T')[0],
        formData.voterId
      );
      
      setEligibilityResult(result);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibilityResult({
        eligible: false,
        message: 'Error checking eligibility. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Collect books
  const collectBooks = async () => {
    if (!eligibilityResult?.eligible) return;

    setProcessing(true);
    try {
      const collectionData = {
        studentId: eligibilityResult.student.id,
        studentName: formData.studentName,
        dob: formData.dob.toISOString().split('T')[0],
        voterId: formData.voterId,
        books: 20,
        collectedAt: new Date().toISOString(),
        collectedBy: 'staff_1', // In real app, this would be the current user
        proofs: formData.proofs
      };

      const result = await apiService.collectBooks(collectionData);
      
      if (result.success) {
        // Update inventory
        updateInventory(20);
        
        // Set collection data for QR code
        setCollectionData(collectionData);
        setShowQRModal(true);
        
        // Reset form
        setFormData({
          studentName: '',
          dob: null,
          voterId: '',
          proofs: []
        });
        setEligibilityResult(null);
      }
    } catch (error) {
      console.error('Error collecting books:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return formData.studentName && formData.dob && formData.voterId;
  };

  // Check if enough books are available
  const hasEnough = hasEnoughBooks(20);

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parent Collection</h1>
          <p className="mt-2 text-gray-600">
            Help parents collect books for their children.
          </p>
        </div>

        {/* Collection Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Information</h2>
          
          <div className="space-y-6">
            {/* Student Name Search */}
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <AutocompleteSearch
                placeholder="Search for student by name..."
                onSelect={handleStudentSelect}
                searchType="students"
                className="w-full"
              />
              {formData.studentName && (
                <p className="mt-1 text-sm text-gray-500">
                  Selected: {formData.studentName}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <DatePicker
                selected={formData.dob}
                onChange={handleDOBChange}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholderText="Select date of birth"
                aria-describedby="dob-help"
              />
              <p id="dob-help" className="mt-1 text-sm text-gray-500">
                Select the student's date of birth
              </p>
            </div>

            {/* Voter ID */}
            <div>
              <label htmlFor="voterId" className="block text-sm font-medium text-gray-700 mb-2">
                Voter ID *
              </label>
              <input
                type="text"
                id="voterId"
                value={formData.voterId}
                onChange={handleVoterIdChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter voter ID"
                aria-describedby="voterId-help"
              />
              <p id="voterId-help" className="mt-1 text-sm text-gray-500">
                Enter the parent's voter ID for verification
              </p>
            </div>

            {/* Proof Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proof Documents (Optional)
              </label>
              <FileUpload
                onFileSelect={handleProofUpload}
                acceptedTypes={{
                  'application/pdf': ['.pdf'],
                  'image/*': ['.png', '.jpg', '.jpeg']
                }}
                placeholder="Upload supporting documents"
              />
            </div>

            {/* Check Eligibility Button */}
            <div className="flex justify-center">
              <button
                onClick={checkEligibility}
                disabled={!isFormValid() || loading}
                className="bg-primary text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-5 w-5" />
                    <span>Check Eligibility</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Eligibility Result */}
        {eligibilityResult && (
          <div className="mt-8">
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <Skeleton height={50} />
              </div>
            ) : (
              <div className={`rounded-lg shadow-md p-6 ${
                eligibilityResult.eligible 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {eligibilityResult.eligible ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-lg font-medium ${
                      eligibilityResult.eligible ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {eligibilityResult.eligible ? 'Eligible for Collection' : 'Not Eligible'}
                    </h3>
                    <p className={`mt-1 text-sm ${
                      eligibilityResult.eligible ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {eligibilityResult.message}
                    </p>
                    
                    {eligibilityResult.eligible && (
                      <div className="mt-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-medium text-gray-900 mb-2">Student Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Name:</span> {eligibilityResult.student.name}
                            </div>
                            <div>
                              <span className="font-medium">DOB:</span> {eligibilityResult.student.dob}
                            </div>
                            <div>
                              <span className="font-medium">Books:</span> 20
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> Available
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={collectBooks}
                            disabled={!hasEnough || processing}
                            className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                          >
                            {processing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <DocumentTextIcon className="h-5 w-5" />
                                <span>Collect Now</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        {!hasEnough && (
                          <p className="mt-2 text-sm text-red-600 text-center">
                            <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                            Not enough books available in inventory
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Code Modal */}
        <Transition appear show={showQRModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowQRModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      Collection Successful!
                    </Dialog.Title>
                    
                    {collectionData && (
                      <div className="text-center">
                        <QRCodeGenerator
                          data={collectionData}
                          size={200}
                          text="Book Collection Receipt"
                        />
                        
                        <div className="mt-6">
                          <p className="text-sm text-gray-600 mb-4">
                            Books have been successfully collected. The QR code above can be used to verify this collection.
                          </p>
                          
                          <button
                            onClick={() => setShowQRModal(false)}
                            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default ParentCollection;