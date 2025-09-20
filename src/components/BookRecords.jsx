import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useInventory } from '../contexts/InventoryContext.jsx';
import Navbar from './Navbar.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { TableSkeleton } from './common/SkeletonWrapper.jsx';
import { PlusIcon } from '@heroicons/react/24/outline';

const BookRecords = () => {
  const { isAdmin } = useAuth();
  const { inventory, addYearlyBooks } = useInventory();
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    booksAdded: '',
    budget: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.year || formData.year < 2020 || formData.year > 2030) {
      errors.year = 'Year must be between 2020 and 2030';
    }
    
    if (!formData.booksAdded || formData.booksAdded <= 0) {
      errors.booksAdded = 'Books added must be greater than 0';
    }
    
    if (!formData.budget || formData.budget <= 0) {
      errors.budget = 'Budget must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddYearlyRecord = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      const result = await addYearlyBooks(
        parseInt(formData.year),
        parseInt(formData.booksAdded),
        parseFloat(formData.budget)
      );
      
      if (result.success) {
        showToast('Yearly book record added successfully');
        setShowAddModal(false);
        setFormData({
          year: new Date().getFullYear(),
          booksAdded: '',
          budget: ''
        });
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      console.error('Failed to add yearly record:', error);
      showToast('Failed to add yearly record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const yearlyHeaders = ['Year', 'Books Added', 'Budget (GHS)', 'Distribution Rate'];
  const yearlyData = inventory.yearlyRecords.map(record => ({
    Year: record.year,
    'Books Added': record.booksAdded.toLocaleString(),
    'Budget (GHS)': `GHS ${record.budget.toLocaleString()}`,
    'Distribution Rate': `${((inventory.distributed / record.booksAdded) * 100).toFixed(1)}%`
  }));

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Book Records</h1>
              <p className="text-gray-600 mt-2">Manage yearly book distribution records</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Yearly Record</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Books</h3>
            <p className="text-3xl font-bold text-blue-600">
              {inventory.totalBooks.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Distributed</h3>
            <p className="text-3xl font-bold text-green-600">
              {inventory.distributed.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Remaining</h3>
            <p className="text-3xl font-bold text-orange-600">
              {inventory.remaining.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            {loading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : (
              <Table
                headers={yearlyHeaders}
                data={yearlyData}
                emptyMessage="No yearly records found"
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Yearly Record Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Yearly Book Record"
        size="md"
      >
        <form onSubmit={handleAddYearlyRecord} className="space-y-4">
          <Input
            label="Year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleInputChange}
            error={formErrors.year}
            min="2020"
            max="2030"
            required
          />

          <Input
            label="Books Added"
            name="booksAdded"
            type="number"
            value={formData.booksAdded}
            onChange={handleInputChange}
            error={formErrors.booksAdded}
            placeholder="Enter number of books"
            min="1"
            required
          />

          <Input
            label="Budget (GHS)"
            name="budget"
            type="number"
            step="0.01"
            value={formData.budget}
            onChange={handleInputChange}
            error={formErrors.budget}
            placeholder="Enter budget amount"
            min="0.01"
            required
          />

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="flex-1"
            >
              Add Record
            </Button>
          </div>
        </form>
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

export default BookRecords;