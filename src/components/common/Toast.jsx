import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Toast = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose, 
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose && onClose(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const icons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    error: <XCircleIcon className="h-5 w-5 text-red-400" />,
    info: <InformationCircleIcon className="h-5 w-5 text-blue-400" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className={`p-4 border-l-4 ${colors[type]}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose && onClose(), 300);
              }}
              aria-label="Close notification"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;