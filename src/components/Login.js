import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { BookOpenIcon } from '@heroicons/react/24/outline';

/**
 * Login component with role-based authentication
 * Handles form validation and error display
 */
const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'school'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password, formData.role);
      
      if (result.success) {
        showSuccess('Login Successful', `Welcome back, ${formData.username}!`);
        navigate('/dashboard');
      } else {
        setError('Login failed. Please check your credentials.');
        showError('Login Failed', 'Please check your credentials and try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      showError('Login Error', 'An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8" role="main" aria-label="Login form">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <BookOpenIcon className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to FreeBooks Sekondi
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Empowering Education!
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} aria-label="Login form">
          <div className="card p-8 space-y-6 animate-fade-in">
            {/* Error Message */}
            {error && (
              <div className="bg-error-50 border border-error-200 rounded-lg p-4 animate-slide-up">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-error-800">Login Error</h3>
                    <div className="mt-2 text-sm text-error-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your username"
                aria-label="Username input"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                aria-label="Password input"
                disabled={loading}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="form-label">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
                aria-label="Select your role"
              >
                <option value="school">School Administrator</option>
                <option value="admin">System Administrator</option>
                <option value="staff">Collection Staff</option>
              </select>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  'Log In'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 animate-fade-in">
          <h3 className="text-sm font-medium text-primary-800 mb-2">Demo Credentials</h3>
          <div className="text-xs text-primary-700 space-y-1">
            <p><strong>School:</strong> school1 / password123</p>
            <p><strong>Admin:</strong> admin1 / password123</p>
            <p><strong>Staff:</strong> staff1 / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
