import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { schoolService } from '../services/api';
import { Dialog } from '@headlessui/react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  DocumentArrowUpIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const SchoolSubmission = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    schoolName: '',
    classes: [{ className: '', declaredCount: 0 }],
    students: [],
    totalDeclared: 0
  });

  // Validation state
  const [validation, setValidation] = useState({
    schoolName: { isValid: true, message: '' },
    classes: { isValid: true, message: '' },
    students: { isValid: true, message: '' },
    totalMatch: { isValid: true, message: '' }
  });

  // CSV upload state
  const [csvData, setCsvData] = useState(null);
  const [csvError, setCsvError] = useState('');

  // Handle school name change
  const handleSchoolNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, schoolName: value }));
    
    // Validate school name
    if (value.trim().length < 3) {
      setValidation(prev => ({
        ...prev,
        schoolName: { isValid: false, message: 'School name must be at least 3 characters' }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        schoolName: { isValid: true, message: 'School name is valid' }
      }));
    }
  };

  // Handle class changes
  const handleClassChange = (index, field, value) => {
    const updatedClasses = [...formData.classes];
    updatedClasses[index] = {
      ...updatedClasses[index],
      [field]: field === 'declaredCount' ? parseInt(value) || 0 : value
    };
    
    // Calculate total declared
    const totalDeclared = updatedClasses.reduce((sum, cls) => sum + cls.declaredCount, 0);
    
    setFormData(prev => ({
      ...prev,
      classes: updatedClasses,
      totalDeclared
    }));

    validateClasses(updatedClasses);
    validateTotalMatch(formData.students.length, totalDeclared);
  };

  // Add new class row
  const addClassRow = () => {
    setFormData(prev => ({
      ...prev,
      classes: [...prev.classes, { className: '', declaredCount: 0 }]
    }));
  };

  // Remove class row
  const removeClassRow = (index) => {
    if (formData.classes.length > 1) {
      const updatedClasses = formData.classes.filter((_, i) => i !== index);
      const totalDeclared = updatedClasses.reduce((sum, cls) => sum + cls.declaredCount, 0);
      
      setFormData(prev => ({
        ...prev,
        classes: updatedClasses,
        totalDeclared
      }));
      
      validateClasses(updatedClasses);
      validateTotalMatch(formData.students.length, totalDeclared);
    }
  };

  // Validate classes
  const validateClasses = (classes) => {
    const hasEmptyClass = classes.some(cls => !cls.className.trim() || cls.declaredCount <= 0);
    const hasDuplicateClass = classes.some((cls, index) => 
      classes.findIndex(c => c.className.toLowerCase() === cls.className.toLowerCase()) !== index
    );

    if (hasEmptyClass) {
      setValidation(prev => ({
        ...prev,
        classes: { isValid: false, message: 'All classes must have a name and count greater than 0' }
      }));
    } else if (hasDuplicateClass) {
      setValidation(prev => ({
        ...prev,
        classes: { isValid: false, message: 'Duplicate class names are not allowed' }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        classes: { isValid: true, message: 'Classes are valid' }
      }));
    }
  };

  // Handle CSV file drop
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        
        // Skip header row if it exists
        const dataLines = lines.slice(1);
        
        const students = dataLines.map((line, index) => {
          const [name, dob, className] = line.split(',').map(field => field.trim());
          
          if (!name || !dob || !className) {
            throw new Error(`Invalid data at row ${index + 2}: missing required fields`);
          }
          
          // Validate date format (YYYY-MM-DD)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
            throw new Error(`Invalid date format at row ${index + 2}: use YYYY-MM-DD`);
          }
          
          return {
            name: name.replace(/"/g, ''),
            dob: dob.replace(/"/g, ''),
            className: className.replace(/"/g, ''),
            issued: false
          };
        });

        setCsvData(students);
        setCsvError('');
        setFormData(prev => ({ ...prev, students }));
        validateTotalMatch(students.length, formData.totalDeclared);
        
      } catch (error) {
        setCsvError(error.message);
        setCsvData(null);
      }
    };
    
    reader.readAsText(file);
  }, [formData.totalDeclared]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  // Add student manually
  const addStudentRow = () => {
    const newStudent = {
      name: '',
      dob: '',
      className: formData.classes.length > 0 ? formData.classes[0].className : '',
      issued: false
    };
    
    const updatedStudents = [...formData.students, newStudent];
    setFormData(prev => ({ ...prev, students: updatedStudents }));
    validateTotalMatch(updatedStudents.length, formData.totalDeclared);
  };

  // Update student data
  const updateStudent = (index, field, value) => {
    const updatedStudents = [...formData.students];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    setFormData(prev => ({ ...prev, students: updatedStudents }));
    validateTotalMatch(updatedStudents.length, formData.totalDeclared);
  };

  // Remove student
  const removeStudent = (index) => {
    const updatedStudents = formData.students.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, students: updatedStudents }));
    validateTotalMatch(updatedStudents.length, formData.totalDeclared);
  };

  // Validate total match
  const validateTotalMatch = (studentCount, totalDeclared) => {
    if (studentCount !== totalDeclared) {
      setValidation(prev => ({
        ...prev,
        totalMatch: { 
          isValid: false, 
          message: `Student count (${studentCount}) must match total declared (${totalDeclared})` 
        }
      }));
    } else {
      setValidation(prev => ({
        ...prev,
        totalMatch: { isValid: true, message: 'Student count matches declared total' }
      }));
    }
  };

  // Check if step is valid
  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return validation.schoolName.isValid && formData.schoolName.trim().length >= 3;
      case 2:
        return validation.classes.isValid && formData.classes.every(cls => cls.className.trim() && cls.declaredCount > 0);
      case 3:
        return validation.students.isValid && validation.totalMatch.isValid && formData.students.length > 0;
      default:
        return false;
    }
  };

  // Handle step navigation
  const goToStep = (step) => {
    if (step < currentStep || isStepValid(currentStep)) {
      setCurrentStep(step);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isStepValid(1) || !isStepValid(2) || !isStepValid(3)) {
      return;
    }

    setLoading(true);

    try {
      const result = await schoolService.submitSchool(formData);
      setSubmissionResult(result);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Submission error:', error);
      // Handle error - you might want to show an error toast here
    } finally {
      setLoading(false);
    }
  };

  // Close success modal and navigate
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Student List</h1>
          <p className="mt-2 text-gray-600">
            Submit your school's student list for free exercise book distribution.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {/* Tab navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              {[
                { id: 1, name: 'School Info', description: 'Basic school information' },
                { id: 2, name: 'Classes', description: 'Class breakdown and counts' },
                { id: 3, name: 'Students', description: 'Student list upload' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => goToStep(tab.id)}
                  className={`group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-6 text-sm font-medium text-center hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${
                    currentStep === tab.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300'
                  } ${tab.id < currentStep && isStepValid(tab.id) ? 'text-success' : ''}`}
                  aria-selected={currentStep === tab.id}
                  aria-describedby={`step-${tab.id}-description`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {tab.id < currentStep && isStepValid(tab.id) && (
                      <CheckIcon className="h-4 w-4 text-success" />
                    )}
                    <span>{tab.name}</span>
                  </div>
                  <p id={`step-${tab.id}-description`} className="mt-1 text-xs text-gray-500">
                    {tab.description}
                  </p>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {/* Step 1: School Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={handleSchoolNameChange}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                        validation.schoolName.isValid ? 'border-gray-300' : 'border-red-300'
                      }`}
                      placeholder="Enter your school name"
                      aria-describedby="schoolName-validation"
                    />
                  </div>
                  <div id="schoolName-validation" className="mt-2">
                    {validation.schoolName.message && (
                      <p className={`text-sm ${validation.schoolName.isValid ? 'text-success' : 'text-error'}`}>
                        {validation.schoolName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => goToStep(2)}
                    disabled={!isStepValid(1)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Classes
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Classes */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Class Information</h3>
                  <div className="space-y-4">
                    {formData.classes.map((classItem, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Class name (e.g., Class 1A)"
                            value={classItem.className}
                            onChange={(e) => handleClassChange(index, 'className', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            placeholder="Count"
                            min="1"
                            value={classItem.declaredCount || ''}
                            onChange={(e) => handleClassChange(index, 'declaredCount', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeClassRow(index)}
                          disabled={formData.classes.length === 1}
                          className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                          aria-label="Remove class"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addClassRow}
                    className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Class
                  </button>

                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-600">
                      <strong>Total Declared Students: {formData.totalDeclared}</strong>
                    </div>
                  </div>

                  {validation.classes.message && (
                    <p className={`text-sm ${validation.classes.isValid ? 'text-success' : 'text-error'}`}>
                      {validation.classes.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => goToStep(1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Previous: School Info
                  </button>
                  <button
                    onClick={() => goToStep(3)}
                    disabled={!isStepValid(2)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Students
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Students */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Student List</h3>
                  
                  {/* CSV Upload */}
                  <div className="mb-6">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-primary bg-primary bg-opacity-5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        {isDragActive
                          ? 'Drop the CSV file here...'
                          : 'Drag and drop a CSV file here, or click to select'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        CSV format: Name, Date of Birth (YYYY-MM-DD), Class
                      </p>
                    </div>
                    {csvError && (
                      <p className="mt-2 text-sm text-error">{csvError}</p>
                    )}
                    {csvData && (
                      <p className="mt-2 text-sm text-success">
                        Successfully loaded {csvData.length} students from CSV
                      </p>
                    )}
                  </div>

                  {/* Manual entry option */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">Or add students manually:</h4>
                      <button
                        type="button"
                        onClick={addStudentRow}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Student
                      </button>
                    </div>

                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {formData.students.map((student, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <input
                              type="text"
                              placeholder="Student name"
                              value={student.name}
                              onChange={(e) => updateStudent(index, 'name', e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            <input
                              type="date"
                              value={student.dob}
                              onChange={(e) => updateStudent(index, 'dob', e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            <select
                              value={student.className}
                              onChange={(e) => updateStudent(index, 'className', e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            >
                              <option value="">Select class</option>
                              {formData.classes.map((cls, clsIndex) => (
                                <option key={clsIndex} value={cls.className}>
                                  {cls.className}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeStudent(index)}
                              className="p-2 text-red-600 hover:text-red-800"
                              aria-label="Remove student"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Validation summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <strong>Students Added: {formData.students.length}</strong>
                      </div>
                      <div>
                        <strong>Total Declared: {formData.totalDeclared}</strong>
                      </div>
                    </div>
                    {validation.totalMatch.message && (
                      <p className={`mt-2 text-sm ${validation.totalMatch.isValid ? 'text-success' : 'text-error'}`}>
                        {validation.totalMatch.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Previous: Classes
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isStepValid(3) || loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-success hover:bg-success-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit List'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onClose={() => {}} className="relative z-50">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-12 w-12 text-success mr-4" />
                  <div>
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      Submission Successful!
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      Your student list has been submitted for review.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={closeSuccessModal}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default SchoolSubmission;