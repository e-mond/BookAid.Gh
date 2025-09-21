import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Toast from './common/Toast.jsx';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      
      setTimeout(() => {
        const role = result.user.role;
        const redirectPath = location.state?.from?.pathname || 
          (role === 'admin' ? '/admin' : 
           role === 'staff' ? '/staff' : 
           role === 'school' ? '/school' : '/');
        navigate(redirectPath, { replace: true });
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
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col md:flex-row"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
      }}
    >
      {/* Aside Section */}
      <div className="md:w-1/3 bg-indigo-900 bg-opacity-90 text-white p-4 sm:p-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">BookAid Gh.</h1>
          <p className="text-base sm:text-lg font-medium leading-relaxed">
            Empowering education in Ghana by providing free exercise books to students, with transparency and accessibility for all schools.
          </p>
          <div className="space-y-2 text-sm sm:text-base">
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Track yearly book distribution
            </p>
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Manage school submissions
            </p>
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Monitor delivery & collection
            </p>
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Generate detailed reports
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-3xl">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Sign in to manage book distribution</p>
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
                placeholder="Enter your username"
                aria-label="Username input"
                className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
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
                className="w-full px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm sm:text-base"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-sm sm:text-base"
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
                  className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded transition-colors duration-200"
                >
                  Sign up for schools
                </button>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p><strong>Admin:</strong> admin1 / password</p>
                <p><strong>Staff:</strong> staff1 / password</p>
                <p><strong>School:</strong> school1 / password</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default Login;