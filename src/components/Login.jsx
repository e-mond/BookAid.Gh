import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      
      if (result.success) {
        setShowToast(true);
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-success flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8">
        {/* Aside */}
        <div className="md:w-1/3 bg-white bg-opacity-80 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">FreeBooks Sekondi</h2>
          <p className="text-lg font-semibold leading-relaxed">
            FreeBooks Sekondi provides 300,000 exercise books to students, ensuring transparency and accessibility for all schools and external students in Sekondi.
          </p>
        </div>

        {/* Login Form */}
        <div className="md:w-2/3 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-600">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  aria-label="Username input"
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  aria-label="Password input"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success"
                    aria-label="Role selection"
                  >
                    <option value="admin">System Admin</option>
                    <option value="staff">Staff</option>
                    <option value="school">School Administrator</option>
                  </select>
                </div>

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
                  Log In
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-primary hover:text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Sign up as a school
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message="Login successful! Redirecting..."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Login;