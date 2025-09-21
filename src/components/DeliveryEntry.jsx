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
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Delivery Entry</h1>
        <FormSkeleton fields={5} />
      </div>
    );
  }

  return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Record Delivery</h1>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delivery Information</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 mb-2">
                School <span className="text-red-500">*</span>
              </label>
              <select
                id="schoolId"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleSchoolSelect}
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                  errors.schoolId ? 'border-red-500' : 'border-gray-300'
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
                <p id="schoolId-error" className="mt-2 text-sm text-red-500" role="alert">
                  {errors.schoolId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="booksDelivered" className="block text-sm font-medium text-gray-700 mb-2">
                  Books Delivered <span className="text-red-500">*</span>
                </label>
                <input
                  id="booksDelivered"
                  name="booksDelivered"
                  type="number"
                  value={formData.booksDelivered}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                    errors.booksDelivered ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter number of books"
                  min="1"
                  aria-invalid={errors.booksDelivered ? 'true' : 'false'}
                  aria-describedby={errors.booksDelivered ? 'booksDelivered-error' : undefined}
                />
                {errors.booksDelivered && (
                  <p id="booksDelivered-error" className="mt-2 text-sm text-red-500" role="alert">
                    {errors.booksDelivered}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={formData.deliveryDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  maxDate={new Date()}
                  className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                    errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholderText="Select delivery date"
                  aria-invalid={errors.deliveryDate ? 'true' : 'false'}
                  aria-describedby={errors.deliveryDate ? 'deliveryDate-error' : undefined}
                />
                {errors.deliveryDate && (
                  <p id="deliveryDate-error" className="mt-2 text-sm text-red-500" role="alert">
                    {errors.deliveryDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 resize-y"
                placeholder="Enter any additional notes about the delivery"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Record Delivery
              </Button>
            </div>
          </form>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleToastClose}
          duration={3000}
          className="shadow-lg"
        />
      )}
    </div>
  );
};

export default DeliveryEntry;