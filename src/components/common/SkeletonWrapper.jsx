import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonWrapper = ({
  children,
  loading = false,
  count = 1,
  height,
  width,
  className = '',
  ...props
}) => {
  if (loading) {
    return (
      <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
        <Skeleton
          count={count}
          height={height}
          width={width}
          className={className}
          {...props}
        />
      </SkeletonTheme>
    );
  }

  return children;
};

// Specific skeleton components for common use cases
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
    <SkeletonWrapper loading={true} height={24} width="60%" className="mb-4" />
    <SkeletonWrapper loading={true} height={16} width="100%" className="mb-2" />
    <SkeletonWrapper loading={true} height={16} width="80%" className="mb-2" />
    <SkeletonWrapper loading={true} height={16} width="90%" />
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {[...Array(columns)].map((_, index) => (
            <th key={index} className="px-6 py-3 text-left">
              <SkeletonWrapper loading={true} height={16} width="80%" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <tr key={rowIndex}>
            {[...Array(columns)].map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <SkeletonWrapper loading={true} height={16} width="90%" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const FormSkeleton = ({ fields = 4, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {[...Array(fields)].map((_, index) => (
      <div key={index}>
        <SkeletonWrapper loading={true} height={16} width="25%" className="mb-2" />
        <SkeletonWrapper loading={true} height={40} width="100%" />
      </div>
    ))}
    <div className="flex justify-end space-x-2">
      <SkeletonWrapper loading={true} height={40} width={100} />
      <SkeletonWrapper loading={true} height={40} width={100} />
    </div>
  </div>
);

export const ChartSkeleton = ({ className = '' }) => (
  <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
    <SkeletonWrapper loading={true} height={24} width="40%" className="mb-4" />
    <SkeletonWrapper loading={true} height={300} width="100%" />
  </div>
);

export const ListSkeleton = ({ items = 5, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(items)].map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <SkeletonWrapper loading={true} height={40} width={40} className="rounded-full" />
        <div className="flex-1">
          <SkeletonWrapper loading={true} height={16} width="60%" className="mb-1" />
          <SkeletonWrapper loading={true} height={14} width="40%" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonWrapper;