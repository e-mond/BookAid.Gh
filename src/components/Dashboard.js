import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../contexts/InventoryContext';
import { reportService, studentService } from '../services/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Fuse from 'fuse.js';
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentPlusIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const { inventory, loading: inventoryLoading, getStats } = useInventory();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, logs] = await Promise.all([
          reportService.getDashboardStats(),
          reportService.getActivityLogs(5)
        ]);
        
        setDashboardStats(stats);
        setActivityLogs(logs);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle student search with fuzzy matching
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const results = await studentService.searchStudents(query);
      setSearchResults(results.slice(0, 5)); // Limit to 5 results
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Get inventory statistics
  const inventoryStats = getStats();

  // Format activity log timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get action icon based on type
  const getActionIcon = (type) => {
    switch (type) {
      case 'submission':
        return <DocumentPlusIcon className="h-5 w-5 text-blue-500" />;
      case 'approval':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'collection':
        return <UserGroupIcon className="h-5 w-5 text-purple-500" />;
      case 'delivery':
        return <BookOpenIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of the FreeBooks Sekondi distribution program.
          </p>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Remaining books card */}
          <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="Remaining books statistics">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Books Remaining</p>
                {inventoryLoading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {inventory.remaining.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {!inventoryLoading && (
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span>Distribution: {inventoryStats.distributionPercentage}%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${inventoryStats.distributionPercentage}%` }}
                    aria-label={`${inventoryStats.distributionPercentage}% distributed`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Distributed books card */}
          <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="Distributed books statistics">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-success" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Books Distributed</p>
                {inventoryLoading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {inventory.distributed.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {!inventoryLoading && (
              <div className="mt-4 text-sm text-gray-600">
                <span>Students served: {inventoryStats.studentsServed.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Schools approved card */}
          <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="Schools statistics">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-orange-500" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Schools Approved</p>
                {loading ? (
                  <Skeleton height={32} width={60} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats?.schoolsApproved || 0}
                  </p>
                )}
              </div>
            </div>
            {!loading && dashboardStats && (
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <div>Students covered: {dashboardStats.studentsServed.toLocaleString()}</div>
                <div>Flagged students: {dashboardStats.flaggedStudents}</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and quick actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student search */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Search</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
                  aria-label="Search students"
                />
                
                {/* Search results dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student.id}
                        className="px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">
                          {student.schoolName} • DOB: {student.dob}
                        </div>
                        <div className="text-xs">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            student.issued 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {student.issued ? 'Books Issued' : 'Eligible'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions based on role */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {hasRole('school') && (
                  <Link
                    to="/submit"
                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-success hover:bg-success-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success transition-colors"
                  >
                    <DocumentPlusIcon className="h-5 w-5 mr-2" />
                    Submit Student List
                  </Link>
                )}
                
                {hasRole('admin') && (
                  <Link
                    to="/admin/approve"
                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                    Review Submissions
                  </Link>
                )}
                
                {(hasRole('staff') || hasRole('admin')) && (
                  <Link
                    to="/collect"
                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Collect Books
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Skeleton circle height={40} width={40} />
                        <div className="flex-1">
                          <Skeleton height={20} width="60%" />
                          <Skeleton height={16} width="40%" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flow-root">
                    <ul className="-mb-8" role="list" aria-label="Recent actions">
                      {activityLogs.map((log, index) => (
                        <li key={log.id}>
                          <div className="relative pb-8">
                            {index !== activityLogs.length - 1 && (
                              <span 
                                className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" 
                                aria-hidden="true"
                              />
                            )}
                            <div className="relative flex items-start space-x-3">
                              <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  {getActionIcon(log.type)}
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {log.action}
                                  </div>
                                  <p className="mt-0.5 text-sm text-gray-500">
                                    {log.description}
                                  </p>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                  <time dateTime={log.timestamp}>
                                    {formatTimestamp(log.timestamp)}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;