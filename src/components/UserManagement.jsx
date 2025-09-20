import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api.jsx';
import Navbar from './Navbar.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { TableSkeleton } from './common/SkeletonWrapper.jsx';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'staff',
    schoolId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    if (formData.role === 'school' && !formData.schoolId.trim()) {
      errors.schoolId = 'School ID is required for school role';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      await api.createUser(formData);
      showToast('User created successfully');
      setShowCreateModal(false);
      setFormData({ username: '', email: '', role: 'staff', schoolId: '' });
      loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      showToast('Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setSubmitting(true);
    try {
      await api.removeUser(selectedUser.id);
      showToast('User removed successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to remove user:', error);
      showToast('Failed to remove user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const userHeaders = ['Username', 'Email', 'Role', 'School ID', 'Actions'];
  const userData = users.map(user => ({
    Username: user.username,
    Email: user.email,
    Role: user.role,
    'School ID': user.schoolId || '-',
    Actions: (
      <button
        onClick={() => openDeleteModal(user)}
        className="text-red-600 hover:text-red-800 p-1"
        aria-label={`Delete user ${user.username}`}
      >
        <TrashIcon className="h-4 w-4" />
      </button>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage system users and their roles</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add User</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            {loading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : (
              <Table
                headers={userHeaders}
                data={userData}
                emptyMessage="No users found"
              />
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            error={formErrors.username}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="school">School</option>
            </select>
            {formErrors.role && (
              <p className="mt-1 text-sm text-error">{formErrors.role}</p>
            )}
          </div>

          {formData.role === 'school' && (
            <Input
              label="School ID"
              name="schoolId"
              value={formData.schoolId}
              onChange={handleInputChange}
              error={formErrors.schoolId}
              placeholder="Enter school identifier"
            />
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="flex-1"
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete user <strong>{selectedUser?.username}</strong>? 
            This action cannot be undone.
          </p>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="error"
              onClick={handleDeleteUser}
              loading={submitting}
              className="flex-1"
            >
              Delete
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

export default UserManagement;