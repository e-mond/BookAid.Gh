import React from 'react';

const Textarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  error, 
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
  ...props 
}) => {
  const textareaClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
    focus:outline-none focus:ring-2 focus:ring-success focus:border-success
    disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical
    ${error ? 'border-error focus:ring-error focus:border-error' : 'border-gray-300'}
    ${className}
  `;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={textareaClasses}
        {...props}
      />
      {maxLength && (
        <p className="mt-1 text-xs text-gray-500">
          {value?.length || 0} / {maxLength} characters
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;