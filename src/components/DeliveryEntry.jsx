import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useInventory } from '../contexts/InventoryContext.jsx';
import api from '../services/api.jsx';
import Navbar from './Navbar.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { FormSkeleton } from './common/SkeletonWrapper.jsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DeliveryEntry = () => {
  const { isStaff } = useAuth();
  const { deductBooks } = useInventory();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schoolId: '',
    schoolName: '',
    booksDelivered: '',
    deliveryTime: new Date()
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (isStaff) {
      loadSchools();
    }
  }, [isStaff]);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const response = await api.getSchools();
      setSchools(response.data);
    } catch (error) {
      console.error('Failed to load schools:', error);
      showToast('Failed to load schools', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSchoolSelect = (e) => {
    const schoolId = e.target.value;
    const selectedSchool = schools.find(school => school.id === schoolId);
    
    setFormData(prev => ({
      ...prev,
      schoolId,
      schoolName: selectedSchool ? selectedSchool.name : ''
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      deliveryTime: date
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.schoolId) {
      errors.schoolId = 'Please select a school';
    }
    
    if (!formData.booksDelivered || formData.booksDelivered <= 0) {
      errors.booksDelivered = 'Books delivered must be greater than 0';
    }
    
    if (!formData.deliveryTime) {
      errors.deliveryTime = 'Delivery time is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      const deliveryData = {
        schoolId: formData.schoolId,
        schoolName: formData.schoolName,
        booksDelivered: parseInt(formData.booksDelivered),
        deliveredAt: formData.deliveryTime.toISOString()
      };
      
      await api.createDelivery(deliveryData);
      deductBooks(parseInt(formData.booksDelivered));
      
      showToast('Delivery recorded successfully');
      
      // Reset form
      setFormData({
        schoolId: '',
        schoolName: '',
        booksDelivered: '',
        deliveryTime: new Date()
      });
    } catch (error) {
      console.error('Failed to record delivery:', error);
      showToast('Failed to record delivery', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-blue-50">
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
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Entry</h1>
          <p className="text-gray-600 mt-2">Record book deliveries to schools</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            {loading ? (
              <FormSkeleton fields={4} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School
                  </label>
                  <select
                    name="schoolId"
                    value={formData.schoolId}
                    onChange={handleSchoolSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success"
                  >
                    <option value="">Select a school</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.schoolId && (
                    <p className="mt-1 text-sm text-error">{formErrors.schoolId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Time
                  </label>
                  <DatePicker
                    selected={formData.deliveryTime}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success"
                    placeholderText="Select delivery time"
                  />
                  {formErrors.deliveryTime && (
                    <p className="mt-1 text-sm text-error">{formErrors.deliveryTime}</p>
                  )}
                </div>

                <Input
                  label="Books Delivered"
                  name="booksDelivered"
                  type="number"
                  value={formData.booksDelivered}
                  onChange={handleInputChange}
                  error={formErrors.booksDelivered}
                  placeholder="Enter number of books delivered"
                  min="1"
                  required
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="px-8"
                  >
                    Record Delivery
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

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

export default DeliveryEntry;