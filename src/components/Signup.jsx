import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Modal from './common/Modal.jsx';
import Toast from './common/Toast.jsx';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    schoolName: ''
  });
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState('');
  const [passwordChangeData, setPasswordChangeData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const { signup, changePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordChangeData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
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

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    } else if (formData.schoolName.trim().length < 2) {
      newErrors.schoolName = 'School name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordChangeData.oldPassword.trim()) {
      newErrors.oldPassword = 'Current password is required';
    }

    if (!passwordChangeData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordChangeData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!passwordChangeData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await signup(formData);
    
    if (result.success) {
      setDefaultPassword(result.user.password);
      setShowPasswordModal(true);
      setToastMessage('School registration successful!');
      setToastType('success');
      setShowToast(true);
    } else {
      setToastMessage(result.error || 'Registration failed');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    const result = await changePassword({
      oldPassword: passwordChangeData.oldPassword,
      newPassword: passwordChangeData.newPassword
    });
    
    if (result.success) {
      setToastMessage('Password changed successfully!');
      setToastType('success');
      setShowToast(true);
      setShowPasswordModal(false);
      
      // Redirect to login after successful password change
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setToastMessage(result.error || 'Password change failed');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const handleSkipPasswordChange = () => {
    setShowPasswordModal(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-success flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">School Registration</h2>
            <p className="text-gray-600 mt-2">Register your school to participate in FreeBooks Sekondi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              required
              placeholder="Choose a username"
              aria-label="Username input"
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              placeholder="Enter your email"
              aria-label="Email input"
            />

            <Input
              label="School Name"
              name="schoolName"
              type="text"
              value={formData.schoolName}
              onChange={handleInputChange}
              error={errors.schoolName}
              required
              placeholder="Enter your school name"
              aria-label="School name input"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              aria-label="Sign up button"
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {}} // Prevent closing without password change
        title="Change Default Password"
        size="md"
        showCloseButton={false}
        closeOnOverlayClick={false}
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Your default password is:</strong> {defaultPassword}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Please change this password for security reasons.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password (Default)"
              name="oldPassword"
              type="password"
              value={passwordChangeData.oldPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.oldPassword}
              required
              placeholder="Enter default password"
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordChangeData.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
              required
              placeholder="Enter new password"
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordChangeData.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
              required
              placeholder="Confirm new password"
            />

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSkipPasswordChange}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Change Password
              </Button>
            </div>
          </form>
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

export default Signup;