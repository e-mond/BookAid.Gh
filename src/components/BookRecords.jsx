import React, { useState, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { TableSkeleton } from './common/SkeletonWrapper.jsx';

const BookRecords = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    booksAdded: '',
    budget: ''
  });
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { inventory, loading, addYearlyBooks, getYearlyStats } = useInventory();

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.year || formData.year < 2020 || formData.year > 2030) {
      newErrors.year = 'Year must be between 2020 and 2030';
    }

    if (!formData.booksAdded || formData.booksAdded <= 0) {
      newErrors.booksAdded = 'Books added must be a positive number';
    } else if (formData.booksAdded > 1000000) {
      newErrors.booksAdded = 'Books added seems unusually high';
    }

    if (!formData.budget || formData.budget <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await addYearlyBooks(
      parseInt(formData.year),
      parseInt(formData.booksAdded),
      parseFloat(formData.budget)
    );
    
    if (result.success) {
      setShowAddModal(false);
      resetForm();
      showToastMessage('Yearly book record added successfully', 'success');
    } else {
      showToastMessage(result.error || 'Failed to add yearly record', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      booksAdded: '',
      budget: ''
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

  const handleRowClick = (record) => {
    // Show record details in console for now
    console.log('Yearly record details:', record);
  };

  // Prepare table data
  const yearlyStats = getYearlyStats();
  const tableHeaders = ['Year', 'Books Added', 'Budget (GHS)', 'Cost per Book (GHS)'];
  const tableData = yearlyStats.map(record => [
    record.year,
    record.booksAdded.toLocaleString(),
    record.budget.toLocaleString(),
    record.costPerBook.toFixed(2)
  ]);

  return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Book Records</h1>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          aria-label="Add yearly book record"
        >
          Add Yearly Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📚</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Books
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {inventory.totalBooks.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Distributed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {inventory.distributed.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">📦</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Remaining
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {inventory.remaining.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Records Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Yearly Book Records</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
            <Table
              headers={tableHeaders}
              data={tableData}
              onRowClick={handleRowClick}
              emptyMessage="No yearly records found"
            />
          )}
        </div>
      </div>

      {/* Add Yearly Record Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Yearly Book Record"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleInputChange}
            error={errors.year}
            required
            min="2020"
            max="2030"
            placeholder="Enter year"
          />

          <Input
            label="Books Added"
            name="booksAdded"
            type="number"
            value={formData.booksAdded}
            onChange={handleInputChange}
            error={errors.booksAdded}
            required
            min="1"
            placeholder="Enter number of books added"
          />

          <Input
            label="Budget (GHS)"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleInputChange}
            error={errors.budget}
            required
            min="0.01"
            step="0.01"
            placeholder="Enter budget amount"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Cost Calculation</h4>
            {formData.booksAdded && formData.budget && (
              <p className="text-sm text-blue-600">
                Cost per book: <strong>GHS {(formData.budget / formData.booksAdded).toFixed(2)}</strong>
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Record
            </Button>
          </div>
        </form>
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

export default BookRecords;