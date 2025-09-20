import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState('');
  const [passwordModalData, setPasswordModalData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  const { signup, changePassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordModalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signup(formData);
      
      if (result.success) {
        setDefaultPassword(result.data.user.defaultPassword);
        setShowPasswordModal(true);
        setShowToast(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordModalData.newPassword !== passwordModalData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordModalData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      const result = await changePassword({
        oldPassword: passwordModalData.oldPassword,
        newPassword: passwordModalData.newPassword
      });

      if (result.success) {
        setShowPasswordModal(false);
        navigate('/login');
      } else {
        setPasswordError(result.error);
      }
    } catch (err) {
      setPasswordError('Failed to change password');
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-success flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8">
        {/* Aside */}
        <div className="md:w-1/3 bg-white bg-opacity-80 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Join FreeBooks Sekondi</h2>
          <p className="text-lg font-semibold leading-relaxed">
            Register your school to participate in the free exercise book distribution program. Ensure your students receive the educational resources they need.
          </p>
        </div>

        {/* Signup Form */}
        <div className="md:w-2/3 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">School Registration</h1>
                <p className="text-gray-600">Create your school administrator account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                  aria-label="Username input"
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  aria-label="Email input"
                />

                <Input
                  label="School Name"
                  name="schoolName"
                  type="text"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="Enter your school name"
                  required
                  aria-label="School name input"
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md" role="alert">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  Sign Up
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-primary hover:text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={closePasswordModal}
        title="Change Default Password"
        size="md"
        closeOnOverlayClick={false}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Default Password:</strong> {defaultPassword}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Please change this password for security reasons.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              name="oldPassword"
              type="password"
              value={passwordModalData.oldPassword}
              onChange={handlePasswordChange}
              placeholder="Enter default password"
              required
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordModalData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              required
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordModalData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              required
            />

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md" role="alert">
                {passwordError}
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={closePasswordModal}
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

      {showToast && (
        <Toast
          message="School registered successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Signup;