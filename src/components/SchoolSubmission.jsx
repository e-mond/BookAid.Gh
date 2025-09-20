import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api.jsx';
import { validateCompleteSubmission } from '../utils/validateSchoolSubmission.jsx';
import { parseCSV, csvToStudents, downloadCSVTemplate } from '../utils/parseCSV.jsx';
import Navbar from './Navbar.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Textarea from './common/Textarea.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { SkeletonWrapper } from './common/SkeletonWrapper.jsx';
import { useDropzone } from 'react-dropzone';
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentArrowUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const SchoolSubmission = () => {
  const { isSchool } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    schoolInfo: {
      schoolName: '',
      notes: ''
    },
    classes: [],
    students: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSchoolInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      schoolInfo: {
        ...prev.schoolInfo,
        [name]: value
      }
    }));
  };

  const addClass = () => {
    setFormData(prev => ({
      ...prev,
      classes: [...prev.classes, { className: '', declaredCount: '' }]
    }));
  };

  const updateClass = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.map((cls, i) => 
        i === index ? { ...cls, [field]: value } : cls
      )
    }));
  };

  const removeClass = (index) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index)
    }));
  };

  const addStudent = () => {
    setFormData(prev => ({
      ...prev,
      students: [...prev.students, { name: '', dob: '', className: '' }]
    }));
  };

  const updateStudent = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map((student, i) => 
        i === index ? { ...student, [field]: value } : student
      )
    }));
  };

  const removeStudent = (index) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.filter((_, i) => i !== index)
    }));
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const csvData = parseCSV(csvText);
        const students = csvToStudents(csvData);
        
        setFormData(prev => ({
          ...prev,
          students: students
        }));
        
        showToast('CSV file imported successfully');
      } catch (error) {
        console.error('CSV import error:', error);
        showToast('Failed to import CSV file: ' + error.message, 'error');
      }
    };
    
    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.schoolInfo.schoolName.trim()) {
        errors.schoolName = 'School name is required';
      }
      if (formData.schoolInfo.notes && formData.schoolInfo.notes.length > 500) {
        errors.notes = 'Notes cannot exceed 500 characters';
      }
    } else if (step === 2) {
      if (formData.classes.length === 0) {
        errors.classes = 'At least one class is required';
      }
      formData.classes.forEach((cls, index) => {
        if (!cls.className.trim()) {
          errors[`class_${index}_name`] = 'Class name is required';
        }
        if (!cls.declaredCount || cls.declaredCount <= 0) {
          errors[`class_${index}_count`] = 'Student count must be greater than 0';
        }
      });
    } else if (step === 3) {
      if (formData.students.length === 0) {
        errors.students = 'At least one student is required';
      }
      formData.students.forEach((student, index) => {
        if (!student.name.trim()) {
          errors[`student_${index}_name`] = 'Student name is required';
        }
        if (!student.dob) {
          errors[`student_${index}_dob`] = 'Date of birth is required';
        }
        if (!student.className.trim()) {
          errors[`student_${index}_class`] = 'Class is required';
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    const validation = validateCompleteSubmission(formData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      showToast('Please fix all validation errors', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      const submissionData = {
        ...formData.schoolInfo,
        classes: formData.classes,
        students: formData.students,
        totalDeclared: formData.students.length
      };
      
      await api.submitSchool(submissionData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to submit school data:', error);
      showToast('Failed to submit school data', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalDeclared = formData.classes.reduce((sum, cls) => sum + parseInt(cls.declaredCount || 0), 0);
  const studentCount = formData.students.length;

  if (!isSchool) {
    return (
      <div className="min-h-screen bg-green-50">
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
    <div className="min-h-screen bg-green-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Student List</h1>
          <p className="text-gray-600 mt-2">Submit your school's student list for book distribution</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
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
                    currentStep > step ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            {/* Step 1: School Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">School Information</h2>
                
                <Input
                  label="School Name"
                  name="schoolName"
                  value={formData.schoolInfo.schoolName}
                  onChange={handleSchoolInfoChange}
                  error={formErrors.schoolName}
                  placeholder="Enter your school name"
                  required
                />

                <Textarea
                  label="Additional Notes (Optional)"
                  name="notes"
                  value={formData.schoolInfo.notes}
                  onChange={handleSchoolInfoChange}
                  error={formErrors.notes}
                  placeholder="Any additional information or special requests"
                  maxLength={500}
                  rows={4}
                />
              </div>
            )}

            {/* Step 2: Classes */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Classes</h2>
                  <Button
                    onClick={addClass}
                    variant="primary"
                    className="flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Class</span>
                  </Button>
                </div>

                {formData.classes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No classes added yet. Click "Add Class" to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.classes.map((cls, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Input
                          label="Class Name"
                          value={cls.className}
                          onChange={(e) => updateClass(index, 'className', e.target.value)}
                          error={formErrors[`class_${index}_name`]}
                          placeholder="e.g., Class 5"
                          className="flex-1"
                        />
                        <Input
                          label="Student Count"
                          type="number"
                          value={cls.declaredCount}
                          onChange={(e) => updateClass(index, 'declaredCount', e.target.value)}
                          error={formErrors[`class_${index}_count`]}
                          placeholder="0"
                          min="1"
                          className="w-32"
                        />
                        <button
                          onClick={() => removeClass(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                          aria-label={`Remove class ${index + 1}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {totalDeclared > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium">
                      Total Declared Students: {totalDeclared}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Students */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Students</h2>
                  <div className="flex space-x-2">
                    <Button
                      onClick={downloadCSVTemplate}
                      variant="secondary"
                      className="flex items-center space-x-2"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      <span>Download Template</span>
                    </Button>
                    <Button
                      onClick={addStudent}
                      variant="primary"
                      className="flex items-center space-x-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Add Student</span>
                    </Button>
                  </div>
                </div>

                {/* CSV Upload */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-primary bg-primary bg-opacity-10' 
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  <input {...getInputProps()} />
                  <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {isDragActive
                      ? 'Drop the CSV file here...'
                      : 'Drag & drop CSV file here, or click to select'
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Download the template above for the correct format
                  </p>
                </div>

                {formData.students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No students added yet. Upload a CSV file or add students manually.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.students.map((student, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                        <Input
                          label="Student Name"
                          value={student.name}
                          onChange={(e) => updateStudent(index, 'name', e.target.value)}
                          error={formErrors[`student_${index}_name`]}
                          placeholder="Full name"
                        />
                        <Input
                          label="Date of Birth"
                          type="date"
                          value={student.dob}
                          onChange={(e) => updateStudent(index, 'dob', e.target.value)}
                          error={formErrors[`student_${index}_dob`]}
                        />
                        <Input
                          label="Class"
                          value={student.className}
                          onChange={(e) => updateStudent(index, 'className', e.target.value)}
                          error={formErrors[`student_${index}_class`]}
                          placeholder="Class name"
                        />
                        <div className="flex items-end">
                          <button
                            onClick={() => removeStudent(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                            aria-label={`Remove student ${index + 1}`}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Validation Summary */}
                <div className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium">
                      Students Added: {studentCount}
                    </p>
                  </div>
                  {totalDeclared !== studentCount && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        Warning: Student count ({studentCount}) doesn't match declared count ({totalDeclared})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={handlePrevious}
                variant="secondary"
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  variant="primary"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="success"
                  loading={submitting}
                >
                  Submit Student List
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Submission Successful"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Student List Submitted</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your student list has been submitted successfully. It will be reviewed by the admin team.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Submission Summary:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>School: {formData.schoolInfo.schoolName}</li>
              <li>Classes: {formData.classes.length}</li>
              <li>Students: {formData.students.length}</li>
              {formData.schoolInfo.notes && (
                <li>Notes: {formData.schoolInfo.notes}</li>
              )}
            </ul>
          </div>
          
          <Button
            onClick={() => setShowSuccessModal(false)}
            variant="primary"
            className="w-full"
          >
            Close
          </Button>
        </div>
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

export default SchoolSubmission;