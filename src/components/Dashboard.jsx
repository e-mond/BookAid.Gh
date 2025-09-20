import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useInventory } from '../contexts/InventoryContext.jsx';
import api from '../services/api.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { searchLogs } from '../utils/fuseSearch.jsx';
import { CardSkeleton, TableSkeleton } from './common/SkeletonWrapper.jsx';

const Dashboard = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { user } = useAuth();
  const { inventory, getDistributionStats } = useInventory();
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentActivities();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchLogs(recentActivities, searchQuery);
      setFilteredActivities(filtered);
    } else {
      setFilteredActivities(recentActivities);
    }
  }, [searchQuery, recentActivities]);

  const loadRecentActivities = async () => {
    try {
      setLoading(true);
      const response = await api.getLogs(user.role);
      setRecentActivities(response.data);
    } catch (error) {
      console.error('Error loading activities:', error);
      showToastMessage('Failed to load recent activities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const handleCardClick = (type) => {
    navigate(`/details/${type}`);
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const getRoleBasedCards = () => {
    const stats = getDistributionStats();
    
    if (user.role === 'admin') {
      return [
        {
          title: 'Total Distributions',
          value: stats.distributed.toLocaleString(),
          subtitle: 'Books distributed',
          type: 'distributions',
          icon: '📊',
          color: 'bg-blue-500'
        },
        {
          title: 'Total Books',
          value: stats.totalBooks.toLocaleString(),
          subtitle: 'Available books',
          type: 'total',
          icon: '📚',
          color: 'bg-green-500'
        },
        {
          title: 'School Distributions',
          value: '1,200',
          subtitle: 'Books to schools',
          type: 'schools',
          icon: '🏫',
          color: 'bg-purple-500'
        },
        {
          title: 'External Distributions',
          value: '800',
          subtitle: 'Parental collections',
          type: 'external',
          icon: '👨‍👩‍👧‍👦',
          color: 'bg-orange-500'
        }
      ];
    } else if (user.role === 'staff') {
      return [
        {
          title: 'Deliveries Made',
          value: '45',
          subtitle: 'School deliveries',
          type: 'deliveries',
          icon: '🚚',
          color: 'bg-blue-500'
        },
        {
          title: 'Collections Processed',
          value: '120',
          subtitle: 'Parental collections',
          type: 'collections',
          icon: '📋',
          color: 'bg-green-500'
        }
      ];
    } else if (user.role === 'school') {
      return [
        {
          title: 'My School Stats',
          value: '100',
          subtitle: 'Students declared',
          type: 'school-stats',
          icon: '🏫',
          color: 'bg-blue-500'
        },
        {
          title: 'Submissions',
          value: '1',
          subtitle: 'Pending approval',
          type: 'submissions',
          icon: '📝',
          color: 'bg-yellow-500'
        }
      ];
    }
    
    return [];
  };

  const getRoleBasedBackground = () => {
    switch (user.role) {
      case 'staff':
        return 'bg-blue-50'; // #E6F0FA equivalent
      case 'school':
        return 'bg-green-50'; // #E6FFE6 equivalent
      case 'admin':
        return 'bg-gray-50'; // #F9FAFB equivalent
      default:
        return 'bg-gray-50';
    }
  };

  const getActivityTableHeaders = () => {
    if (user.role === 'admin') {
      return ['Action', 'Details', 'User', 'Timestamp'];
    } else if (user.role === 'staff') {
      return ['Action', 'Details', 'Timestamp'];
    } else if (user.role === 'school') {
      return ['Action', 'Details', 'Timestamp'];
    }
    return [];
  };

  const getActivityTableData = () => {
    return filteredActivities.map(activity => {
      const baseData = [
        activity.action,
        activity.details,
        new Date(activity.timestamp).toLocaleString()
      ];
      
      if (user.role === 'admin') {
        baseData.splice(2, 0, activity.userId || 'System');
      }
      
      return baseData;
    });
  };

  const cards = getRoleBasedCards();

  return (
    <div className={`min-h-screen ${getRoleBasedBackground()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.username}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'admin' && 'System Administrator Dashboard'}
                {user.role === 'staff' && 'Staff Dashboard'}
                {user.role === 'school' && 'School Administrator Dashboard'}
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(cards.length)].map((_, index) => (
                <CardSkeleton key={index} />
              ))
            ) : (
              cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                  onClick={() => handleCardClick(card.type)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(card.type);
                    }
                  }}
                  aria-label={`View ${card.title} details`}
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                      {card.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      <p className="text-xs text-gray-500">{card.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
                <div className="w-64">
                  <Input
                    type="text"
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <TableSkeleton rows={5} columns={getActivityTableHeaders().length} />
              ) : (
                <Table
                  headers={getActivityTableHeaders()}
                  data={getActivityTableData()}
                  onRowClick={handleActivityClick}
                  emptyMessage="No recent activities found"
                />
              )}
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <p className="mt-1 text-sm text-gray-900">{selectedActivity.action}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedActivity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Details</label>
              <p className="mt-1 text-sm text-gray-900">{selectedActivity.details}</p>
            </div>
            
            {selectedActivity.userId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedActivity.userId}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => setShowActivityModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
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

export default Dashboard;