import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonWrapper = ({ 
  children, 
  loading = false, 
  count = 1, 
  height = '1rem',
  width = '100%',
  className = '',
  ...props 
}) => {
  if (loading) {
    return (
      <Skeleton
        count={count}
        height={height}
        width={width}
        className={className}
        {...props}
      />
    );
  }

  return children;
};

// Specific skeleton components for common use cases
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    <Skeleton height="1.5rem" width="60%" className="mb-4" />
    <Skeleton height="1rem" count={3} className="mb-2" />
    <Skeleton height="2rem" width="40%" />
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
    <div className="px-6 py-3 bg-gray-50 border-b">
      <Skeleton height="1rem" width="20%" />
    </div>
    <div className="divide-y divide-gray-200">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 flex space-x-4">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} height="1rem" width="25%" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton = ({ fields = 4, className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    {[...Array(fields)].map((_, index) => (
      <div key={index} className="mb-4">
        <Skeleton height="1rem" width="30%" className="mb-2" />
        <Skeleton height="2.5rem" width="100%" />
      </div>
    ))}
    <Skeleton height="2.5rem" width="40%" />
  </div>
);

export const ChartSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    <Skeleton height="1.5rem" width="40%" className="mb-4" />
    <Skeleton height="300px" width="100%" />
  </div>
);

export default SkeletonWrapper;