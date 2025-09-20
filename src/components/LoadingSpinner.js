import React from 'react';

/**
 * Enhanced loading spinner component with different sizes and styles
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  fullScreen = false,
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-12 w-12';
      case 'xl':
        return 'h-16 w-16';
      default:
        return 'h-8 w-8';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white';
      case 'gray':
        return 'border-gray-500';
      case 'success':
        return 'border-success';
      case 'error':
        return 'border-error';
      default:
        return 'border-primary';
    }
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-2 ${getSizeClasses()} ${getColorClasses()} ${className}`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          {text && (
            <p className="mt-4 text-gray-600 font-medium animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center justify-center space-x-3">
        {spinner}
        <span className="text-gray-600 font-medium">{text}</span>
      </div>
    );
  }

  return spinner;
};

/**
 * Skeleton loading component for content placeholders
 */
export const SkeletonLoader = ({ 
  lines = 1, 
  height = 'h-4', 
  width = 'w-full',
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded animate-pulse ${height} ${width}`}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

/**
 * Card skeleton for loading states
 */
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="bg-gray-200 rounded-full h-12 w-12 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="bg-gray-200 rounded h-4 w-3/4 animate-pulse" />
          <div className="bg-gray-200 rounded h-3 w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

/**
 * Table skeleton for loading states
 */
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="bg-gray-200 rounded h-6 w-1/4 animate-pulse" />
      </div>
      <div className="card-body">
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="bg-gray-200 rounded h-4 flex-1 animate-pulse"
                  style={{
                    animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s`
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;