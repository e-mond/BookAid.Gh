import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useInventory } from '../contexts/InventoryContext.jsx';
import api from '../services/api.jsx';
import Navbar from './Navbar.jsx';
import Button from './common/Button.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { TableSkeleton } from './common/SkeletonWrapper.jsx';
import { 
  EyeIcon, 
  CheckIcon, 
  TruckIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const AdminApproval = () => {
  const { isAdmin } = useAuth();
  const { deductBooks } = useInventory();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (isAdmin) {
      loadSchools();
    }
  }, [isAdmin]);

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

  const handleViewDetails = (school) => {
    setSelectedSchool(school);
    setShowDetailsModal(true);
  };

  const handleApprove = (school) => {
    setSelectedSchool(school);
    setShowApprovalModal(true);
  };

  const handleDeliver = (school) => {
    setSelectedSchool(school);
    setShowDeliveryModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedSchool) return;
    
    setActionLoading(true);
    try {
      await api.approveSchool(selectedSchool.id);
      showToast('School approved successfully');
      setShowApprovalModal(false);
      loadSchools();
    } catch (error) {
      console.error('Failed to approve school:', error);
      showToast('Failed to approve school', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelivery = async () => {
    if (!selectedSchool) return;
    
    setActionLoading(true);
    try {
      // In a real app, this would create a delivery record
      const booksToDeliver = selectedSchool.totalDeclared * 20; // 20 books per student
      deductBooks(booksToDeliver);
      
      showToast('Delivery recorded successfully');
      setShowDeliveryModal(false);
      loadSchools();
    } catch (error) {
      console.error('Failed to record delivery:', error);
      showToast('Failed to record delivery', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      delivered: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (school.notes && school.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const schoolHeaders = ['School Name', 'Total Students', 'Status', 'Notes', 'Actions'];
  const schoolData = filteredSchools.map(school => ({
    'School Name': school.name,
    'Total Students': school.totalDeclared,
    'Status': getStatusBadge(school.status),
    'Notes': school.notes ? (school.notes.length > 50 ? school.notes.substring(0, 50) + '...' : school.notes) : '-',
    'Actions': (
      <div className="flex space-x-2">
        <button
          onClick={() => handleViewDetails(school)}
          className="text-blue-600 hover:text-blue-800 p-1"
          aria-label={`View details for ${school.name}`}
        >
          <EyeIcon className="h-4 w-4" />
        </button>
        {school.status === 'pending' && (
          <button
            onClick={() => handleApprove(school)}
            className="text-green-600 hover:text-green-800 p-1"
            aria-label={`Approve ${school.name}`}
          >
            <CheckIcon className="h-4 w-4" />
          </button>
        )}
        {school.status === 'approved' && (
          <button
            onClick={() => handleDeliver(school)}
            className="text-blue-600 hover:text-blue-800 p-1"
            aria-label={`Record delivery for ${school.name}`}
          >
            <TruckIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">School Approval</h1>
          <p className="text-gray-600 mt-2">Review and approve school submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search schools or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            {loading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : (
              <Table
                headers={schoolHeaders}
                data={schoolData}
                emptyMessage="No schools found"
              />
            )}
          </div>
        </div>
      </div>

      {/* School Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="School Details"
        size="lg"
      >
        {selectedSchool && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">School Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSchool.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Students</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSchool.totalDeclared}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(selectedSchool.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedSchool.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedSchool.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSchool.notes}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Classes</label>
              <div className="space-y-2">
                {selectedSchool.classes.map((cls, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{cls.className}</span>
                    <span className="text-sm text-gray-600">{cls.declaredCount} students</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Students ({selectedSchool.students.length})</label>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {selectedSchool.students.map((student, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span>{student.name}</span>
                    <span className="text-gray-600">{student.className}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Approval Confirmation Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Approve School"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to approve <strong>{selectedSchool?.name}</strong>?
            This will allow the school to receive book deliveries.
          </p>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowApprovalModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={confirmApprove}
              loading={actionLoading}
              className="flex-1"
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delivery Confirmation Modal */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        title="Record Delivery"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Record delivery for <strong>{selectedSchool?.name}</strong>?
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Books to deliver:</strong> {selectedSchool?.totalDeclared * 20} books
              <br />
              <strong>Students:</strong> {selectedSchool?.totalDeclared}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeliveryModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmDelivery}
              loading={actionLoading}
              className="flex-1"
            >
              Record Delivery
            </Button>
          </div>
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

export default AdminApproval;