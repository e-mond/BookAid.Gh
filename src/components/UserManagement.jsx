import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Table from './common/Table.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';
import { TableSkeleton } from './common/SkeletonWrapper.jsx';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'school',
    schoolId: ''
  });
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      showToastMessage('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.role === 'school' && !formData.schoolId.trim()) {
      newErrors.schoolId = 'School ID is required for school role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.createUser(formData);
      setUsers(prev => [...prev, response.data]);
      setShowCreateModal(false);
      resetForm();
      showToastMessage('User created successfully', 'success');
    } catch (error) {
      console.error('Error creating user:', error);
      showToastMessage(error.message || 'Failed to create user', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await api.removeUser(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      showToastMessage('User removed successfully', 'success');
    } catch (error) {
      console.error('Error removing user:', error);
      showToastMessage(error.message || 'Failed to remove user', 'error');
    }
  };

  const handleRowClick = (user) => {
    // For now, just show user details in console
    console.log('User details:', user);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      role: 'school',
      schoolId: ''
    });
    setErrors({});
  };

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setShowDeleteModal(false);
  };

  // Prepare table data
  const tableHeaders = ['Username', 'Email', 'Role', 'School ID', 'Actions'];
  const tableData = users.map(user => [
    user.username,
    user.email,
    user.role.charAt(0).toUpperCase() + user.role.slice(1),
    user.schoolId || '-',
    <div key={user.id} className="flex space-x-2">
      <Button
        variant="error"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          openDeleteModal(user);
        }}
        disabled={user.id === currentUser?.id}
        aria-label={`Remove user ${user.username}`}
      >
        Remove
      </Button>
    </div>
  ]);

  return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          aria-label="Create new user"
        >
          Create User
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Users</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : (
            <Table
              headers={tableHeaders}
              data={tableData}
              onRowClick={handleRowClick}
              emptyMessage="No users found"
            />
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New User"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            error={errors.username}
            required
            placeholder="Enter username"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            required
            placeholder="Enter email address"
          />

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-error">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success transition-colors duration-200 ${
                errors.role ? 'border-error' : 'border-gray-300'
              }`}
            >
              <option value="admin">System Administrator</option>
              <option value="staff">Staff</option>
              <option value="school">School Administrator</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-error" role="alert">
                {errors.role}
              </p>
            )}
          </div>

          {formData.role === 'school' && (
            <Input
              label="School ID"
              name="schoolId"
              type="text"
              value={formData.schoolId}
              onChange={handleInputChange}
              error={errors.schoolId}
              required
              placeholder="Enter school ID"
            />
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Confirm User Removal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove user <strong>{selectedUser?.username}</strong>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={closeDeleteModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="error"
              onClick={handleDeleteUser}
            >
              Remove User
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

export default UserManagement;