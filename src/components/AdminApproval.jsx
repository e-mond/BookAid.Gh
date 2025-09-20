import React, { useState, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext.jsx';
import api from '../services/api.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { searchSchools } from '../utils/fuseSearch.jsx';
import { TableSkeleton } from './common/SkeletonWrapper.jsx';

const AdminApproval = () => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { updateDistribution } = useInventory();

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    let filtered = schools;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(school => school.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchSchools(filtered, searchQuery);
    }

    setFilteredSchools(filtered);
  }, [schools, statusFilter, searchQuery]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await api.getSchools();
      setSchools(response.data);
    } catch (error) {
      console.error('Error loading schools:', error);
      showToastMessage('Failed to load schools', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (school) => {
    setSelectedSchool(school);
    setConfirmAction('approve');
    setShowConfirmModal(true);
  };

  const handleDeliver = (school) => {
    setSelectedSchool(school);
    setConfirmAction('deliver');
    setShowConfirmModal(true);
  };

  const handleViewDetails = (school) => {
    setSelectedSchool(school);
    setShowDetailsModal(true);
  };

  const executeAction = async () => {
    if (!selectedSchool || !confirmAction) return;

    try {
      setActionLoading(true);
      
      if (confirmAction === 'approve') {
        await api.approveSchool(selectedSchool.id);
        showToastMessage('School approved successfully', 'success');
      } else if (confirmAction === 'deliver') {
        await api.deliverSchool(selectedSchool.id);
        updateDistribution(selectedSchool.totalDeclared * 20);
        showToastMessage('Delivery recorded successfully', 'success');
      }

      // Update local state
      setSchools(prev => prev.map(school => 
        school.id === selectedSchool.id 
          ? { 
              ...school, 
              status: confirmAction === 'approve' ? 'approved' : 'delivered' 
            }
          : school
      ));

      setShowConfirmModal(false);
      setSelectedSchool(null);
      setConfirmAction(null);
    } catch (error) {
      console.error(`Error ${confirmAction}ing school:`, error);
      showToastMessage(`Failed to ${confirmAction} school`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', text: 'Approved' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const handleRowClick = (school) => {
    handleViewDetails(school);
  };

  // Prepare table data
  const tableHeaders = ['School Name', 'Total Students', 'Status', 'Notes', 'Actions'];
  const tableData = filteredSchools.map(school => [
    school.name,
    school.totalDeclared,
    getStatusBadge(school.status),
    school.notes ? (school.notes.length > 50 ? school.notes.substring(0, 50) + '...' : school.notes) : '-',
    <div key={school.id} className="flex space-x-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleViewDetails(school);
        }}
        aria-label={`View details for ${school.name}`}
      >
        View
      </Button>
      {school.status === 'pending' && (
        <Button
          variant="success"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleApprove(school);
          }}
          aria-label={`Approve ${school.name}`}
        >
          Approve
        </Button>
      )}
      {school.status === 'approved' && (
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDeliver(school);
          }}
          aria-label={`Mark as delivered for ${school.name}`}
        >
          Deliver
        </Button>
      )}
    </div>
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">School Approvals</h1>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">School Submissions</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : (
            <Table
              headers={tableHeaders}
              data={tableData}
              onRowClick={handleRowClick}
              emptyMessage="No schools found"
            />
          )}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">School Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSchool.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(selectedSchool.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Students</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSchool.totalDeclared}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Books Required</label>
                <p className="mt-1 text-sm text-gray-900">{selectedSchool.totalDeclared * 20}</p>
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
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{cls.className}</span>
                      <span>{cls.declaredCount} students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedSchool.students && selectedSchool.students.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Students</label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {selectedSchool.students.map((student, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-sm text-gray-600">{student.className}</span>
                      </div>
                      <p className="text-sm text-gray-500">{student.dob}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              {selectedSchool.status === 'pending' && (
                <Button
                  variant="success"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleApprove(selectedSchool);
                  }}
                >
                  Approve
                </Button>
              )}
              {selectedSchool.status === 'approved' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDeliver(selectedSchool);
                  }}
                >
                  Mark as Delivered
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={`Confirm ${confirmAction === 'approve' ? 'Approval' : 'Delivery'}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {confirmAction} <strong>{selectedSchool?.name}</strong>?
          </p>
          
          {confirmAction === 'deliver' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                This will record the delivery of <strong>{selectedSchool?.totalDeclared * 20} books</strong> 
                to {selectedSchool?.name} and update the inventory.
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirmAction === 'approve' ? 'success' : 'primary'}
              onClick={executeAction}
              loading={actionLoading}
              disabled={actionLoading}
            >
              {confirmAction === 'approve' ? 'Approve' : 'Confirm Delivery'}
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

export default AdminApproval;