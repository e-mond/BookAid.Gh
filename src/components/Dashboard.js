import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../contexts/InventoryContext';
import { apiService } from '../services/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
  BookOpenIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import AutocompleteSearch from './AutocompleteSearch';

/**
 * Dashboard component showing overview statistics and recent activity
 * Displays different content based on user role
 */
const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const { inventory, getStats } = useInventory();
  const [stats, setStats] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats and activity logs in parallel
      const [statsData, logsData] = await Promise.all([
        apiService.getStats(),
        apiService.getActivityLogs()
      ]);
      
      setStats(statsData);
      setActivityLogs(logsData.slice(0, 10)); // Show last 10 activities
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set fallback data to prevent UI breaking
      setStats({
        schoolsApproved: 0,
        studentsCovered: 0
      });
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Get inventory statistics
  const inventoryStats = getStats();

  // Get role-specific quick actions (memoized for performance)
  const quickActions = useMemo(() => {
    if (hasRole('school')) {
      return [
        {
          name: 'Submit Student List',
          description: 'Submit your school\'s student list for book distribution',
          href: '/school-submission',
          icon: BookOpenIcon,
          color: 'bg-green-500 hover:bg-green-600'
        }
      ];
    }

    if (hasRole('admin')) {
      return [
        {
          name: 'Review Submissions',
          description: 'Review and approve school submissions',
          href: '/admin-approval',
          icon: CheckCircleIcon,
          color: 'bg-blue-500 hover:bg-blue-600'
        }
      ];
    }

    if (hasRole('staff')) {
      return [
        {
          name: 'Parent Collection',
          description: 'Help parents collect books for their children',
          href: '/parent-collection',
          icon: UsersIcon,
          color: 'bg-purple-500 hover:bg-purple-600'
        }
      ];
    }

    return [];
  }, [hasRole]);

  // Format activity log entry (memoized for performance)
  const formatActivityLog = useCallback((log) => {
    const date = new Date(log.timestamp);
    return {
      ...log,
      formattedDate: date.toLocaleDateString(),
      formattedTime: date.toLocaleTimeString()
    };
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with the FreeBooks Sekondi program.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Students
            </label>
            <AutocompleteSearch
              placeholder="Search by name or date of birth..."
              onSelect={(student) => {
                console.log('Selected student:', student);
                setSearchQuery(student.name);
              }}
              searchType="students"
              className="w-full"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Remaining Books */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100" role="region" aria-label="Remaining books">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Remaining Books</p>
                {loading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {inventoryStats.remaining.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Distributed Books */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100" role="region" aria-label="Distributed books">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Distributed</p>
                {loading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {inventoryStats.distributed.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Schools Approved */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100" role="region" aria-label="Schools approved">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Schools Approved</p>
                {loading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.schoolsApproved || 0}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Students Covered */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100" role="region" aria-label="Students covered">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students Covered</p>
                {loading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.studentsCovered || 0}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <a
                    key={index}
                    href={action.href}
                    className={`${action.color} text-white rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg transform`}
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{action.name}</h3>
                        <p className="text-sm opacity-90 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton count={5} height={60} />
              </div>
            ) : (
              <div className="space-y-4">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => {
                    const formattedLog = formatActivityLog(log);
                    return (
                      <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <div className="p-2 rounded-lg">
                            {log.type === 'approval' && (
                              <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                              </div>
                            )}
                            {log.type === 'delivery' && (
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpenIcon className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                            {log.type === 'collection' && (
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <UsersIcon className="h-5 w-5 text-purple-600" />
                              </div>
                            )}
                            {log.type === 'submission' && (
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {formattedLog.action}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formattedLog.details}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formattedLog.formattedDate} at {formattedLog.formattedTime}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No recent activity</p>
                    <p className="text-gray-400 text-xs mt-1">Activity will appear here as users interact with the system</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;