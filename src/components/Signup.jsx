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
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col md:flex-row"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
      }}
    >
      {/* Aside Section */}
      <div className="md:w-1/3 bg-indigo-800 bg-opacity-90 text-white p-4 sm:p-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Join BookAid Gh.</h1>
          <p className="text-base sm:text-lg font-medium leading-relaxed">
            Register your school to access free exercise books and contribute to quality education in Ghana.
          </p>
          <div className="space-y-2 text-sm sm:text-base">
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Easy school registration
            </p>
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Submit student lists
            </p>
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Track book allocations
            </p>
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Secure account setup
            </p>
          </div>
        </div>
      </div>

      {/* Signup Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-3xl">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">School Registration</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Join BookAid Gh to manage book distribution</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
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
                className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
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
                className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
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
                className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-sm sm:text-base"
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
                  className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded transition-colors duration-200"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {}} // Prevent closing without action
        title="Change Default Password"
        size="md"
        showCloseButton={false}
        closeOnOverlayClick={false}
        className="rounded-xl shadow-2xl"
      >
        <div className="space-y-6 p-6">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm text-indigo-800 font-medium">
              <strong>Your default password is:</strong> {defaultPassword}
            </p>
            <p className="text-sm text-indigo-600 mt-1">
              Please change this password for enhanced security.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 sm:space-y-6">
            <Input
              label="Current Password (Default)"
              name="oldPassword"
              type="password"
              value={passwordChangeData.oldPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.oldPassword}
              required
              placeholder="Enter default password"
              className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
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
              className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
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
              className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSkipPasswordChange}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 text-sm sm:text-base"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-sm sm:text-base"
              >
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleToastClose}
          duration={3000}
          className="shadow-lg"
        />
      )}
    </div>
  );
};

export default Signup;