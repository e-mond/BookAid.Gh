import React, { useState, useEffect } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { apiService } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  TruckIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import FileUpload from './FileUpload';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * AdminApproval component for reviewing and approving school submissions
 * Includes filtering, viewing details, and delivery confirmation
 */
const AdminApproval = () => {
  const { updateInventory, hasEnoughBooks } = useInventory();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliveryProof, setDeliveryProof] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  // Load schools data
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPendingSchools();
      setSchools(data);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter schools based on current filters
  const filteredSchools = schools.filter(school => {
    const matchesStatus = filters.status === 'all' || school.status === filters.status;
    const matchesSearch = school.name.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  // Handle search filter change
  const handleSearchFilter = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  // View school details
  const viewSchoolDetails = (school) => {
    setSelectedSchool(school);
    setShowViewModal(true);
  };

  // Approve school
  const approveSchool = async (schoolId) => {
    setProcessing(true);
    try {
      const result = await apiService.approveSchool(schoolId);
      if (result.success) {
        // Update local state
        setSchools(prev => prev.map(school => 
          school.id === schoolId 
            ? { ...school, status: 'approved' }
            : school
        ));
      }
    } catch (error) {
      console.error('Error approving school:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Deliver school books
  const deliverSchoolBooks = async () => {
    if (!selectedSchool || !deliveryProof) return;
    
    setProcessing(true);
    try {
      const result = await apiService.deliverSchool(selectedSchool.id, deliveryProof);
      if (result.success) {
        // Update inventory
        const booksToDistribute = selectedSchool.totalDeclared * 20;
        updateInventory(booksToDistribute);
        
        // Update local state
        setSchools(prev => prev.map(school => 
          school.id === selectedSchool.id 
            ? { ...school, status: 'delivered', deliveryProofs: [...school.deliveryProofs, 'delivery_proof.pdf'] }
            : school
        ));
        
        setShowDeliverModal(false);
        setSelectedSchool(null);
        setDeliveryProof(null);
      }
    } catch (error) {
      console.error('Error delivering books:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Handle delivery proof upload
  const handleDeliveryProofUpload = (files) => {
    if (files.length > 0) {
      setDeliveryProof(files[0]);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Approval</h1>
          <p className="mt-2 text-gray-600">
            Review and approve school submissions for book distribution.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Search Schools
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="search-filter"
                  value={filters.search}
                  onChange={handleSearchFilter}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Search by school name..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              School Submissions ({filteredSchools.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label="School submissions">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Books Required
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
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={200} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={100} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={100} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={80} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={120} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={150} />
                      </td>
                    </tr>
                  ))
                ) : filteredSchools.length > 0 ? (
                  filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {school.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {school.totalDeclared}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {school.totalDeclared * 20}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(school.status)}`}>
                          {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(school.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewSchoolDetails(school)}
                            className="text-blue-600 hover:text-blue-900"
                            aria-label={`View details for ${school.name}`}
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          
                          {school.status === 'pending' && (
                            <button
                              onClick={() => approveSchool(school.id)}
                              disabled={processing}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              aria-label={`Approve ${school.name}`}
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          
                          {school.status === 'approved' && (
                            <button
                              onClick={() => {
                                setSelectedSchool(school);
                                setShowDeliverModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900"
                              aria-label={`Deliver books to ${school.name}`}
                            >
                              <TruckIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No schools found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View School Details Modal */}
        <Transition appear show={showViewModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowViewModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      {selectedSchool?.name} - Submission Details
                    </Dialog.Title>
                    
                    {selectedSchool && (
                      <div className="space-y-6">
                        {/* School Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900">Total Students</h4>
                            <p className="text-gray-600">{selectedSchool.totalDeclared}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Books Required</h4>
                            <p className="text-gray-600">{selectedSchool.totalDeclared * 20}</p>
                          </div>
                        </div>

                        {/* Classes */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Classes</h4>
                          <div className="space-y-2">
                            {selectedSchool.classes.map((cls, index) => (
                              <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                <span>{cls.className}</span>
                                <span className="font-medium">{cls.declaredCount} students</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Students */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Students ({selectedSchool.students.length})</h4>
                          <div className="max-h-60 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedSchool.students.map((student, index) => (
                                  <tr key={index}>
                                    <td className="px-3 py-2 text-sm text-gray-900">{student.name}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900">{student.dob}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900">{student.className}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Delivery Confirmation Modal */}
        <Transition appear show={showDeliverModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowDeliverModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      Confirm Delivery
                    </Dialog.Title>
                    
                    {selectedSchool && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Confirm delivery of <strong>{selectedSchool.totalDeclared * 20} books</strong> to{' '}
                          <strong>{selectedSchool.name}</strong>
                        </p>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Delivery Proof
                          </label>
                          <FileUpload
                            onFileSelect={handleDeliveryProofUpload}
                            acceptedTypes={{
                              'application/pdf': ['.pdf'],
                              'image/*': ['.png', '.jpg', '.jpeg']
                            }}
                            placeholder="Upload delivery receipt or photo"
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => setShowDeliverModal(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={deliverSchoolBooks}
                        disabled={!deliveryProof || processing}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing ? 'Processing...' : 'Confirm Delivery'}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default AdminApproval;