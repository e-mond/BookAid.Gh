import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useInventory } from '../contexts/InventoryContext.jsx';
import api from '../services/api.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Toast from './common/Toast.jsx';
import { FormSkeleton } from './common/SkeletonWrapper.jsx';

const DeliveryEntry = () => {
  const [formData, setFormData] = useState({
    schoolId: '',
    schoolName: '',
    booksDelivered: '',
    deliveryDate: new Date(),
    notes: ''
  });
  const [schools, setSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { updateDistribution } = useInventory();

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await api.getSchools('approved');
      setSchools(response.data);
    } catch (error) {
      console.error('Error loading schools:', error);
      showToastMessage('Failed to load schools', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      deliveryDate: date
    }));
  };

  const handleSchoolSelect = (e) => {
    const schoolId = e.target.value;
    const selectedSchool = schools.find(school => school.id === schoolId);
    
    setFormData(prev => ({
      ...prev,
      schoolId: schoolId,
      schoolName: selectedSchool ? selectedSchool.name : ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.schoolId) {
      newErrors.schoolId = 'Please select a school';
    }

    if (!formData.booksDelivered || formData.booksDelivered <= 0) {
      newErrors.booksDelivered = 'Books delivered must be a positive number';
    } else if (formData.booksDelivered > 10000) {
      newErrors.booksDelivered = 'Books delivered seems unusually high';
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else if (formData.deliveryDate > new Date()) {
      newErrors.deliveryDate = 'Delivery date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const deliveryData = {
        schoolId: formData.schoolId,
        schoolName: formData.schoolName,
        booksDelivered: parseInt(formData.booksDelivered),
        deliveredAt: formData.deliveryDate.toISOString(),
        notes: formData.notes.trim() || null
      };

      const response = await api.createDelivery(deliveryData);
      
      // Update inventory context
      updateDistribution(parseInt(formData.booksDelivered));
      
      resetForm();
      showToastMessage('Delivery recorded successfully', 'success');
    } catch (error) {
      console.error('Error recording delivery:', error);
      showToastMessage(error.message || 'Failed to record delivery', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      schoolId: '',
      schoolName: '',
      booksDelivered: '',
      deliveryDate: new Date(),
      notes: ''
    });
    setErrors({});
  };

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  if (loading && schools.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Entry</h1>
        <FormSkeleton fields={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Record Delivery</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Delivery Information</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 mb-1">
                School <span className="text-error">*</span>
              </label>
              <select
                id="schoolId"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleSchoolSelect}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success transition-colors duration-200 ${
                  errors.schoolId ? 'border-error' : 'border-gray-300'
                }`}
                aria-invalid={errors.schoolId ? 'true' : 'false'}
                aria-describedby={errors.schoolId ? 'schoolId-error' : undefined}
              >
                <option value="">Select a school</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.totalDeclared} students)
                  </option>
                ))}
              </select>
              {errors.schoolId && (
                <p id="schoolId-error" className="mt-1 text-sm text-error" role="alert">
                  {errors.schoolId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="booksDelivered" className="block text-sm font-medium text-gray-700 mb-1">
                  Books Delivered <span className="text-error">*</span>
                </label>
                <input
                  id="booksDelivered"
                  name="booksDelivered"
                  type="number"
                  value={formData.booksDelivered}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success transition-colors duration-200 ${
                    errors.booksDelivered ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholder="Enter number of books"
                  min="1"
                  aria-invalid={errors.booksDelivered ? 'true' : 'false'}
                  aria-describedby={errors.booksDelivered ? 'booksDelivered-error' : undefined}
                />
                {errors.booksDelivered && (
                  <p id="booksDelivered-error" className="mt-1 text-sm text-error" role="alert">
                    {errors.booksDelivered}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date <span className="text-error">*</span>
                </label>
                <DatePicker
                  selected={formData.deliveryDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  maxDate={new Date()}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success transition-colors duration-200 ${
                    errors.deliveryDate ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholderText="Select delivery date"
                  aria-invalid={errors.deliveryDate ? 'true' : 'false'}
                  aria-describedby={errors.deliveryDate ? 'deliveryDate-error' : undefined}
                />
                {errors.deliveryDate && (
                  <p id="deliveryDate-error" className="mt-1 text-sm text-error" role="alert">
                    {errors.deliveryDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success transition-colors duration-200"
                placeholder="Enter any additional notes about the delivery"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                Record Delivery
              </Button>
            </div>
          </form>
        </div>
      </div>

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

export default DeliveryEntry;