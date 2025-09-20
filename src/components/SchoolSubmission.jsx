import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Textarea from './common/Textarea.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { validateSchoolSubmission, sanitizeSubmission } from '../utils/validateSchoolSubmission.jsx';
import { parseCSVFile, validateStudentCSV, getStudentCSVTemplate } from '../utils/parseCSV.jsx';
import { FormSkeleton } from './common/SkeletonWrapper.jsx';

const SchoolSubmission = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: '',
    notes: '',
    classes: [],
    students: []
  });
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvErrors, setCsvErrors] = useState([]);
  const [csvWarnings, setCsvWarnings] = useState([]);

  const { user } = useAuth();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setCsvFile(file);
        
        try {
          const result = await parseCSVFile(file);
          if (result.error) {
            setCsvErrors([result.error]);
            setCsvWarnings([]);
          } else {
            const validation = validateStudentCSV(result.data);
            setCsvErrors(validation.errors);
            setCsvWarnings(validation.warnings);
            
            if (validation.validStudents.length > 0) {
              setFormData(prev => ({
                ...prev,
                students: validation.validStudents
              }));
            }
          }
        } catch (error) {
          setCsvErrors(['Failed to parse CSV file']);
          setCsvWarnings([]);
        }
      }
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

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.schoolName.trim()) {
        newErrors.schoolName = 'School name is required';
      }
      
      if (formData.notes && formData.notes.length > 500) {
        newErrors.notes = 'Notes must be 500 characters or less';
      }
    } else if (step === 2) {
      if (formData.classes.length === 0) {
        newErrors.classes = 'At least one class must be added';
      } else {
        formData.classes.forEach((cls, index) => {
          if (!cls.className.trim()) {
            newErrors[`class_${index}_name`] = 'Class name is required';
          }
          if (!cls.declaredCount || cls.declaredCount <= 0) {
            newErrors[`class_${index}_count`] = 'Declared count must be a positive number';
          }
        });
      }
    } else if (step === 3) {
      if (formData.students.length === 0) {
        newErrors.students = 'At least one student must be added';
      } else {
        formData.students.forEach((student, index) => {
          if (!student.name.trim()) {
            newErrors[`student_${index}_name`] = 'Student name is required';
          }
          if (!student.dob) {
            newErrors[`student_${index}_dob`] = 'Date of birth is required';
          }
          if (!student.className.trim()) {
            newErrors[`student_${index}_class`] = 'Class name is required';
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    const sanitizedData = sanitizeSubmission(formData);
    const validation = validateSchoolSubmission(sanitizedData);
    
    if (!validation.isValid) {
      setErrors(validation.errors.reduce((acc, error, index) => {
        acc[`general_${index}`] = error;
        return acc;
      }, {}));
      return;
    }

    try {
      setLoading(true);
      
      const submissionData = {
        ...sanitizedData,
        totalDeclared: sanitizedData.classes.reduce((sum, cls) => sum + cls.declaredCount, 0)
      };

      const response = await api.submitSchool(submissionData);
      
      setShowSuccessModal(true);
      showToastMessage('School submission successful!', 'success');
    } catch (error) {
      console.error('Error submitting school:', error);
      showToastMessage(error.message || 'Failed to submit school data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = getStudentCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">School Information</h3>
        
        <Input
          label="School Name"
          name="schoolName"
          type="text"
          value={formData.schoolName}
          onChange={handleInputChange}
          error={errors.schoolName}
          required
          placeholder="Enter your school name"
        />

        <Textarea
          label="Additional Notes (Optional)"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          error={errors.notes}
          maxLength={500}
          rows={4}
          placeholder="Enter any additional information or special requests"
          aria-label="Optional notes"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Class Information</h3>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={addClass}
        >
          Add Class
        </Button>
      </div>

      {formData.classes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No classes added yet. Click "Add Class" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.classes.map((cls, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Class Name"
                    value={cls.className}
                    onChange={(e) => updateClass(index, 'className', e.target.value)}
                    error={errors[`class_${index}_name`]}
                    placeholder="e.g., Class 5, JHS 1"
                  />
                </div>
                <div>
                  <Input
                    label="Declared Count"
                    type="number"
                    value={cls.declaredCount}
                    onChange={(e) => updateClass(index, 'declaredCount', parseInt(e.target.value) || 0)}
                    error={errors[`class_${index}_count`]}
                    placeholder="Number of students"
                    min="1"
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  variant="error"
                  size="sm"
                  onClick={() => removeClass(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.classes && (
        <p className="text-sm text-error" role="alert">
          {errors.classes}
        </p>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={addStudent}
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* CSV Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV File (Optional)
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
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop the CSV file here...'
                : 'Drag & drop CSV file here, or click to select'
              }
            </p>
            <p className="text-xs text-gray-500">
              CSV file with student data
            </p>
          </div>
        </div>

        {csvFile && (
          <div className="mt-2 text-sm text-gray-600">
            Selected file: {csvFile.name}
          </div>
        )}

        {csvErrors.length > 0 && (
          <div className="mt-2 space-y-1">
            {csvErrors.map((error, index) => (
              <p key={index} className="text-sm text-error" role="alert">
                {error}
              </p>
            ))}
          </div>
        )}

        {csvWarnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {csvWarnings.map((warning, index) => (
              <p key={index} className="text-sm text-yellow-600">
                {warning}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Manual Student Entry */}
      {formData.students.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No students added yet. Upload a CSV file or add students manually.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.students.map((student, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="Student Name"
                    value={student.name}
                    onChange={(e) => updateStudent(index, 'name', e.target.value)}
                    error={errors[`student_${index}_name`]}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={student.dob}
                    onChange={(e) => updateStudent(index, 'dob', e.target.value)}
                    error={errors[`student_${index}_dob`]}
                  />
                </div>
                <div>
                  <Input
                    label="Class"
                    value={student.className}
                    onChange={(e) => updateStudent(index, 'className', e.target.value)}
                    error={errors[`student_${index}_class`]}
                    placeholder="Class name"
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  variant="error"
                  size="sm"
                  onClick={() => removeStudent(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.students && (
        <p className="text-sm text-error" role="alert">
          {errors.students}
        </p>
      )}
    </div>
  );

  const renderPreview = () => {
    const totalDeclared = formData.classes.reduce((sum, cls) => sum + (cls.declaredCount || 0), 0);
    const totalStudents = formData.students.length;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Submission Preview</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Summary</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>School:</strong> {formData.schoolName}</p>
            <p><strong>Classes:</strong> {formData.classes.length}</p>
            <p><strong>Total Declared:</strong> {totalDeclared} students</p>
            <p><strong>Students Added:</strong> {totalStudents}</p>
            {formData.notes && (
              <p><strong>Notes:</strong> {formData.notes}</p>
            )}
          </div>
        </div>

        {totalStudents !== totalDeclared && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> Student count ({totalStudents}) doesn't match declared count ({totalDeclared}).
              You can still submit, but please ensure accuracy.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">School Submission</h1>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {step === 1 && 'School Info'}
                  {step === 2 && 'Classes'}
                  {step === 3 && 'Students'}
                  {step === 4 && 'Preview'}
                </span>
                {step < 4 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderPreview()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                Submit
              </Button>
            )}
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              School Submission Complete
            </h3>
            <p className="text-gray-600">
              Your school data has been submitted successfully and is now pending approval.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your submission will be reviewed by administrators</li>
              <li>• You'll receive notification once approved</li>
              <li>• Books will be delivered to your school</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

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

export default SchoolSubmission;