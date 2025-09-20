import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Toast from './common/Toast.jsx';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin'
  });
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      setToastMessage('Login successful!');
      setToastType('success');
      setShowToast(true);
      
      // Redirect to dashboard or intended page
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }, 1000);
    } else {
      setToastMessage(result.error || 'Login failed');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-success flex flex-col md:flex-row">
      {/* Aside Section */}
      <div className="md:w-1/3 bg-black bg-opacity-80 text-white p-4 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">FreeBooks Sekondi</h1>
          <p className="text-lg font-semibold mb-4">
            FreeBooks Sekondi provides 300,000 exercise books to students, ensuring transparency and accessibility for all schools and external students in Sekondi.
          </p>
          <div className="space-y-2 text-sm">
            <p>• Track yearly distribution of free exercise books</p>
            <p>• Manage school submissions and approvals</p>
            <p>• Monitor delivery and collection processes</p>
            <p>• Generate comprehensive reports</p>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
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
                placeholder="Enter your username"
                aria-label="Username input"
                className="focus:ring-2 focus:ring-success"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                required
                placeholder="Enter your password"
                aria-label="Password input"
                className="focus:ring-2 focus:ring-success"
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
                  aria-invalid={errors.role ? 'true' : 'false'}
                  aria-describedby={errors.role ? 'role-error' : undefined}
                >
                  <option value="">Select your role</option>
                  <option value="admin">System Administrator</option>
                  <option value="staff">Staff</option>
                  <option value="school">School Administrator</option>
                </select>
                {errors.role && (
                  <p id="role-error" className="mt-1 text-sm text-error" role="alert">
                    {errors.role}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                aria-label="Log in button"
              >
                Log In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-primary hover:text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                >
                  Sign up for schools
                </button>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Admin:</strong> admin1 / password</p>
                <p><strong>Staff:</strong> staff1 / password</p>
                <p><strong>School:</strong> school1 / password</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default Login;