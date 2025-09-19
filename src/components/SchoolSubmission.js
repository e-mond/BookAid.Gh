import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { apiService } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import FileUpload from './FileUpload';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * SchoolSubmission component for schools to submit their student lists
 * Multi-step form with validation and CSV upload support
 */
const SchoolSubmission = () => {
  const navigate = useNavigate();
  const { hasEnoughBooks } = useInventory();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    schoolName: '',
    classes: [{ className: '', declaredCount: '' }],
    students: [],
    totalDeclared: 0
  });

  // Validation states
  const [validation, setValidation] = useState({
    schoolName: true,
    classes: true,
    students: true,
    totalMatch: true
  });

  // Handle school name change
  const handleSchoolNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, schoolName: value }));
    setValidation(prev => ({ ...prev, schoolName: value.trim().length > 0 }));
  };

  // Handle class changes
  const handleClassChange = (index, field, value) => {
    const newClasses = [...formData.classes];
    newClasses[index][field] = value;
    
    setFormData(prev => ({ ...prev, classes: newClasses }));
    
    // Recalculate total
    const total = newClasses.reduce((sum, cls) => {
      const count = parseInt(cls.declaredCount) || 0;
      return sum + count;
    }, 0);
    
    setFormData(prev => ({ ...prev, totalDeclared: total }));
    
    // Validate classes
    const classesValid = newClasses.every(cls => 
      cls.className.trim() && cls.declaredCount && parseInt(cls.declaredCount) > 0
    );
    setValidation(prev => ({ ...prev, classes: classesValid }));
  };

  // Add new class
  const addClass = () => {
    setFormData(prev => ({
      ...prev,
      classes: [...prev.classes, { className: '', declaredCount: '' }]
    }));
  };

  // Remove class
  const removeClass = (index) => {
    if (formData.classes.length > 1) {
      const newClasses = formData.classes.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, classes: newClasses }));
      
      // Recalculate total
      const total = newClasses.reduce((sum, cls) => {
        const count = parseInt(cls.declaredCount) || 0;
        return sum + count;
      }, 0);
      
      setFormData(prev => ({ ...prev, totalDeclared: total }));
    }
  };

  // Handle CSV file upload
  const handleCSVUpload = (files) => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const students = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            return {
              name: values[0] || '',
              dob: values[1] || '',
              className: values[2] || ''
            };
          });
        
        setFormData(prev => ({ ...prev, students }));
        validateStudents(students);
      };
      
      reader.readAsText(file);
    }
  };

  // Validate students
  const validateStudents = (students) => {
    const studentsValid = students.every(student => 
      student.name.trim() && student.dob.trim() && student.className.trim()
    );
    
    const totalStudents = students.length;
    const totalMatch = totalStudents === formData.totalDeclared;
    
    setValidation(prev => ({ 
      ...prev, 
      students: studentsValid,
      totalMatch 
    }));
  };

  // Add student manually
  const addStudent = () => {
    const newStudent = { name: '', dob: '', className: '' };
    setFormData(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));
  };

  // Update student
  const updateStudent = (index, field, value) => {
    const newStudents = [...formData.students];
    newStudents[index][field] = value;
    setFormData(prev => ({ ...prev, students: newStudents }));
    validateStudents(newStudents);
  };

  // Remove student
  const removeStudent = (index) => {
    const newStudents = formData.students.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, students: newStudents }));
    validateStudents(newStudents);
  };

  // Check if form is valid
  const isFormValid = () => {
    return validation.schoolName && 
           validation.classes && 
           validation.students && 
           validation.totalMatch &&
           formData.students.length > 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setLoading(true);
    try {
      const submissionData = {
        schoolName: formData.schoolName,
        classes: formData.classes,
        students: formData.students,
        totalDeclared: formData.totalDeclared
      };
      
      const result = await apiService.submitSchool(submissionData);
      
      if (result.success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if enough books are available
  const requiredBooks = formData.totalDeclared * 20;
  const hasEnough = hasEnoughBooks(requiredBooks);

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">School Submission</h1>
          <p className="mt-2 text-gray-600">
            Submit your school's student list for book distribution.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-primary' : 'text-gray-500'
                }`}>
                  {step === 1 && 'School Info'}
                  {step === 2 && 'Classes'}
                  {step === 3 && 'Students'}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Step 1: School Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">School Information</h2>
              
              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                  School Name *
                </label>
                <input
                  type="text"
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={handleSchoolNameChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    !validation.schoolName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your school name"
                  aria-describedby={!validation.schoolName ? "schoolName-error" : undefined}
                />
                {!validation.schoolName && (
                  <p id="schoolName-error" className="mt-1 text-sm text-red-600">
                    School name is required
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!validation.schoolName}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next: Classes
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Classes */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Class Information</h2>
              
              <div className="space-y-4">
                {formData.classes.map((cls, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={cls.className}
                        onChange={(e) => handleClassChange(index, 'className', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Class name (e.g., Class 5)"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={cls.declaredCount}
                        onChange={(e) => handleClassChange(index, 'declaredCount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Count"
                        min="1"
                      />
                    </div>
                    {formData.classes.length > 1 && (
                      <button
                        onClick={() => removeClass(index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Remove class ${index + 1}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addClass}
                className="flex items-center space-x-2 text-primary hover:text-blue-700"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Class</span>
              </button>

              {/* Total Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Total Students Declared: <span className="font-bold">{formData.totalDeclared}</span>
                </p>
                <p className="text-sm text-blue-700">
                  Total Books Required: <span className="font-bold">{requiredBooks}</span>
                </p>
                {!hasEnough && (
                  <p className="text-sm text-red-600 mt-2">
                    <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                    Not enough books available in inventory
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!validation.classes || !hasEnough}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next: Students
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Students */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Student Information</h2>
              
              {/* CSV Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File (Optional)
                </label>
                <FileUpload
                  onFileSelect={handleCSVUpload}
                  acceptedTypes={{
                    'text/csv': ['.csv'],
                    'application/vnd.ms-excel': ['.csv']
                  }}
                  placeholder="Upload CSV file with student data"
                />
              </div>

              {/* Manual Entry */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Student List</h3>
                  <button
                    onClick={addStudent}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Student</span>
                  </button>
                </div>

                {loading ? (
                  <Skeleton count={3} height={60} />
                ) : (
                  <div className="space-y-4">
                    {formData.students.map((student, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={student.name}
                            onChange={(e) => updateStudent(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Student name"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="date"
                            value={student.dob}
                            onChange={(e) => updateStudent(index, 'dob', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div className="w-32">
                          <select
                            value={student.className}
                            onChange={(e) => updateStudent(index, 'className', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Select Class</option>
                            {formData.classes.map((cls, i) => (
                              <option key={i} value={cls.className}>
                                {cls.className}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => removeStudent(index)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Remove student ${index + 1}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Validation Messages */}
              <div className="space-y-2">
                {!validation.students && (
                  <p className="text-sm text-red-600">
                    <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                    All students must have name, date of birth, and class
                  </p>
                )}
                {!validation.totalMatch && (
                  <p className="text-sm text-red-600">
                    <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                    Number of students ({formData.students.length}) must match declared total ({formData.totalDeclared})
                  </p>
                )}
                {validation.students && validation.totalMatch && formData.students.length > 0 && (
                  <p className="text-sm text-green-600">
                    <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                    Student list is valid and ready for submission
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || loading}
                  className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit List'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Success Modal */}
        <Transition appear show={showSuccessModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
                    <div className="text-center">
                      <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Submission Successful!
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Your school's student list has been submitted successfully. 
                          You will be notified once it's reviewed and approved.
                        </p>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            setShowSuccessModal(false);
                            navigate('/dashboard');
                          }}
                          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Return to Dashboard
                        </button>
                      </div>
                    </div>
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

export default SchoolSubmission;