import React, { useState, useEffect } from 'react';
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
    } finally {
      setLoading(false);
    }
  };

  // Get inventory statistics
  const inventoryStats = getStats();

  // Get role-specific quick actions
  const getQuickActions = () => {
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
  };

  const quickActions = getQuickActions();

  // Format activity log entry
  const formatActivityLog = (log) => {
    const date = new Date(log.timestamp);
    return {
      ...log,
      formattedDate: date.toLocaleDateString(),
      formattedTime: date.toLocaleTimeString()
    };
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Remaining Books */}
          <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="Remaining books">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Remaining Books</p>
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
          <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="Distributed books">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Distributed</p>
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
          <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="Schools approved">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Schools Approved</p>
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
          <div className="bg-white rounded-lg shadow-md p-6" role="region" aria-label="Students covered">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Students Covered</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <a
                    key={index}
                    href={action.href}
                    className={`${action.color} text-white rounded-lg p-6 transition-colors`}
                  >
                    <div className="flex items-center">
                      <Icon className="h-8 w-8 mr-4" />
                      <div>
                        <h3 className="text-lg font-semibold">{action.name}</h3>
                        <p className="text-blue-100">{action.description}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
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
                      <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {log.type === 'approval' && (
                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                          )}
                          {log.type === 'delivery' && (
                            <BookOpenIcon className="h-6 w-6 text-blue-500" />
                          )}
                          {log.type === 'collection' && (
                            <UsersIcon className="h-6 w-6 text-purple-500" />
                          )}
                          {log.type === 'submission' && (
                            <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {formattedLog.action}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formattedLog.details}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formattedLog.formattedDate} at {formattedLog.formattedTime}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
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