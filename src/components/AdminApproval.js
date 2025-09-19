import React, { useState, useEffect } from 'react';
import { schoolService } from '../services/api';
import { useInventory } from '../contexts/InventoryContext';
import { Dialog } from '@headlessui/react';
import FileUpload from './FileUpload';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

const AdminApproval = () => {
  const { updateInventory, canDistribute } = useInventory();
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  
  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [deliveryProofs, setDeliveryProofs] = useState([]);

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  // Filter schools based on search and status
  useEffect(() => {
    let filtered = [...schools];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(school => school.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(query) ||
        school.submittedBy.toLowerCase().includes(query)
      );
    }

    setFilteredSchools(filtered);
  }, [schools, searchQuery, statusFilter]);

  // Fetch all schools
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const schoolData = await schoolService.getSchools();
      setSchools(schoolData);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle school approval
  const handleApproveSchool = async () => {
    if (!selectedSchool) return;

    const booksNeeded = selectedSchool.totalDeclared * 20; // 20 books per student
    
    if (!canDistribute(booksNeeded)) {
      alert('Insufficient books remaining for this approval');
      return;
    }

    try {
      setActionLoading(true);
      await schoolService.approveSchool(selectedSchool.id);
      
      // Update inventory
      updateInventory(booksNeeded);
      
      // Update local state
      setSchools(prevSchools => 
        prevSchools.map(school => 
          school.id === selectedSchool.id 
            ? { ...school, status: 'approved' }
            : school
        )
      );
      
      setShowApprovalModal(false);
      setSelectedSchool(null);
    } catch (error) {
      console.error('Error approving school:', error);
      alert('Failed to approve school. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delivery confirmation
  const handleDeliveryConfirmation = async () => {
    if (!selectedSchool || deliveryProofs.length === 0) return;

    try {
      setActionLoading(true);
      
      const deliveryData = {
        proofs: deliveryProofs.map(proof => proof.name),
        deliveredAt: new Date().toISOString(),
        deliveredBy: 'admin' // This would come from auth context in real app
      };
      
      await schoolService.deliverToSchool(selectedSchool.id, deliveryData);
      
      // Update local state
      setSchools(prevSchools => 
        prevSchools.map(school => 
          school.id === selectedSchool.id 
            ? { 
                ...school, 
                status: 'delivered',
                deliveryProofs: deliveryData.proofs,
                deliveredAt: deliveryData.deliveredAt
              }
            : school
        )
      );
      
      setShowDeliveryModal(false);
      setSelectedSchool(null);
      setDeliveryProofs([]);
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert('Failed to confirm delivery. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return `inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">School Approvals</h1>
          <p className="mt-2 text-gray-600">
            Review and approve school submissions for book distribution.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            {/* Status filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schools table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label="School submissions">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  // Loading skeleton
                  [...Array(10)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <Skeleton height={40} />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton height={20} width={60} />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton height={24} width={80} />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton height={20} width={100} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Skeleton height={32} width={80} />
                          <Skeleton height={32} width={80} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      {schools.length === 0 ? 'No schools found' : 'No schools match your filters'}
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {school.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {school.submittedBy}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {school.totalDeclared}
                        </div>
                        <div className="text-sm text-gray-500">
                          {school.totalDeclared * 20} books
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(school.status)}>
                          {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(school.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSchool(school);
                            setShowViewModal(true);
                          }}
                          className="text-primary hover:text-primary-hover"
                          title="View details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        
                        {school.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedSchool(school);
                              setShowApprovalModal(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Approve school"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        
                        {school.status === 'approved' && (
                          <button
                            onClick={() => {
                              setSelectedSchool(school);
                              setShowDeliveryModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Mark as delivered"
                          >
                            <TruckIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        <Dialog 
          open={showViewModal} 
          onClose={() => setShowViewModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
                <div className="px-6 py-4 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    School Details
                  </Dialog.Title>
                </div>
                
                {selectedSchool && (
                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedSchool.name}</h3>
                      <p className="text-gray-600">Submitted by: {selectedSchool.submittedBy}</p>
                      <p className="text-gray-600">Date: {formatDate(selectedSchool.createdAt)}</p>
                      <span className={getStatusBadge(selectedSchool.status)}>
                        {selectedSchool.status.charAt(0).toUpperCase() + selectedSchool.status.slice(1)}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Class Breakdown:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSchool.classes.map((cls, index) => (
                          <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span>{cls.className}</span>
                            <span>{cls.declaredCount} students</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Students:</span>
                        <span className="text-lg font-bold">{selectedSchool.totalDeclared}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Books Required:</span>
                        <span className="text-lg font-bold">{selectedSchool.totalDeclared * 20}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>

        {/* Approval Modal */}
        <Dialog 
          open={showApprovalModal} 
          onClose={() => setShowApprovalModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl">
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mr-4" />
                    <div>
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Approve School Submission
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        This action will approve the school and allocate books.
                      </p>
                    </div>
                  </div>
                  
                  {selectedSchool && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm space-y-1">
                        <div><strong>School:</strong> {selectedSchool.name}</div>
                        <div><strong>Students:</strong> {selectedSchool.totalDeclared}</div>
                        <div><strong>Books needed:</strong> {selectedSchool.totalDeclared * 20}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveSchool}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Approving...
                      </>
                    ) : (
                      'Approve'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>

        {/* Delivery Modal */}
        <Dialog 
          open={showDeliveryModal} 
          onClose={() => setShowDeliveryModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-lg bg-white rounded-lg shadow-xl">
                <div className="px-6 py-4 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Confirm Delivery
                  </Dialog.Title>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload delivery proof and confirm books have been delivered.
                  </p>
                </div>
                
                <div className="px-6 py-4 space-y-4">
                  {selectedSchool && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm space-y-1">
                        <div><strong>School:</strong> {selectedSchool.name}</div>
                        <div><strong>Books to deliver:</strong> {selectedSchool.totalDeclared * 20}</div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Proof <span className="text-red-500">*</span>
                    </label>
                    <FileUpload
                      onFilesAccepted={setDeliveryProofs}
                      acceptedFileTypes={{
                        'image/*': ['.png', '.jpg', '.jpeg'],
                        'application/pdf': ['.pdf']
                      }}
                      maxFiles={3}
                      multiple={true}
                      label="Upload delivery proof"
                      description="Upload photos or documents as proof of delivery"
                    />
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeliveryModal(false);
                      setDeliveryProofs([]);
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeliveryConfirmation}
                    disabled={actionLoading || deliveryProofs.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Confirming...
                      </>
                    ) : (
                      <>
                        <DocumentCheckIcon className="h-4 w-4 mr-1" />
                        Confirm Delivery
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminApproval;