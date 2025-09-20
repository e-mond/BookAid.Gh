import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useInventory } from '../contexts/InventoryContext.jsx';
import api from '../services/api.jsx';
import { searchData } from '../utils/fuseSearch.jsx';
import Navbar from './Navbar.jsx';
import Button from './common/Button.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import { CardSkeleton, TableSkeleton } from './common/SkeletonWrapper.jsx';
import { 
  BookOpenIcon, 
  TruckIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, isAdmin, isStaff, isSchool } = useAuth();
  const { inventory, getDistributionStats } = useInventory();
  const navigate = useNavigate();
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const role = user?.role;
      const logsResponse = await api.getLogs(role);
      setRecentActivities(logsResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBasedBg = () => {
    if (isStaff) return 'bg-blue-50';
    if (isSchool) return 'bg-green-50';
    return 'bg-gray-50';
  };

  const getDashboardCards = () => {
    const stats = getDistributionStats();
    
    if (isAdmin) {
      return [
        {
          title: 'Total Books',
          value: stats.totalBooks.toLocaleString(),
          icon: BookOpenIcon,
          path: '/details/total',
          color: 'bg-blue-500'
        },
        {
          title: 'Total Distributions',
          value: stats.totalDistributed.toLocaleString(),
          icon: TruckIcon,
          path: '/details/distributions',
          color: 'bg-green-500'
        },
        {
          title: 'School Distributions',
          value: stats.schoolDistributions.toLocaleString(),
          icon: BuildingOfficeIcon,
          path: '/details/schools',
          color: 'bg-purple-500'
        },
        {
          title: 'External Distributions',
          value: stats.externalDistributions.toLocaleString(),
          icon: UserGroupIcon,
          path: '/details/external',
          color: 'bg-orange-500'
        }
      ];
    } else if (isStaff) {
      return [
        {
          title: 'Deliveries Made',
          value: '12',
          icon: TruckIcon,
          path: '/staff/delivery',
          color: 'bg-blue-500'
        },
        {
          title: 'Collections Processed',
          value: '8',
          icon: UserGroupIcon,
          path: '/staff/parental-collect',
          color: 'bg-green-500'
        }
      ];
    } else if (isSchool) {
      return [
        {
          title: 'My School Stats',
          value: '100 Students',
          icon: BuildingOfficeIcon,
          path: '/school/submission',
          color: 'bg-blue-500'
        },
        {
          title: 'Submissions',
          value: '2',
          icon: BookOpenIcon,
          path: '/reports',
          color: 'bg-green-500'
        }
      ];
    }
    return [];
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const filteredActivities = searchQuery 
    ? searchData(recentActivities, searchQuery, 'logs')
    : recentActivities;

  const activityHeaders = ['Action', 'Details', 'User', 'Timestamp'];
  const activityData = filteredActivities.map(activity => ({
    Action: activity.action,
    Details: activity.details,
    User: activity.user,
    Timestamp: new Date(activity.timestamp).toLocaleString()
  }));

  const cards = getDashboardCards();

  return (
    <div className={`min-h-screen ${getRoleBasedBg()}`}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin && 'Manage the FreeBooks Sekondi distribution system'}
            {isStaff && 'Track deliveries and process parental collections'}
            {isSchool && 'Submit student lists and track your school\'s progress'}
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            [...Array(cards.length)].map((_, index) => (
              <CardSkeleton key={index} />
            ))
          ) : (
            cards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={index}
                  onClick={() => handleCardClick(card.path)}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(card.path);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${card.color}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : (
              <Table
                headers={activityHeaders}
                data={activityData}
                onRowClick={(row, index) => handleActivityClick(filteredActivities[index])}
                emptyMessage="No recent activities found"
              />
            )}
          </div>
        </div>
      </div>

      {/* Activity Details Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Activity Details"
        size="md"
      >
        {selectedActivity && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Action</label>
              <p className="mt-1 text-sm text-gray-900">{selectedActivity.action}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Details</label>
              <p className="mt-1 text-sm text-gray-900">{selectedActivity.details}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User</label>
              <p className="mt-1 text-sm text-gray-900">{selectedActivity.user}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{selectedActivity.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timestamp</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(selectedActivity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;