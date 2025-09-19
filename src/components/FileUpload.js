import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  DocumentArrowUpIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const FileUpload = ({
  onFilesAccepted,
  onFileRemoved,
  acceptedFileTypes = {},
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  disabled = false,
  className = '',
  label = 'Upload Files',
  description = 'Drag and drop files here, or click to select',
  showPreview = true,
  existingFiles = []
}) => {
  const [uploadedFiles, setUploadedFiles] = useState(existingFiles);
  const [errors, setErrors] = useState([]);

  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Clear previous errors
    setErrors([]);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(rejection => ({
        file: rejection.file.name,
        errors: rejection.errors.map(error => error.message)
      }));
      setErrors(newErrors);
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));

      const updatedFiles = multiple 
        ? [...uploadedFiles, ...newFiles].slice(0, maxFiles)
        : newFiles.slice(0, 1);

      setUploadedFiles(updatedFiles);
      
      if (onFilesAccepted) {
        onFilesAccepted(updatedFiles);
      }
    }
  }, [uploadedFiles, multiple, maxFiles, onFilesAccepted]);

  // Remove file
  const removeFile = (fileId) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    
    if (onFileRemoved) {
      onFileRemoved(fileId, updatedFiles);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type icon
  const getFileTypeIcon = (type) => {
    if (type.startsWith('image/')) {
      return '🖼️';
    } else if (type.includes('pdf')) {
      return '📄';
    } else if (type.includes('document') || type.includes('word')) {
      return '📝';
    } else if (type.includes('spreadsheet') || type.includes('excel')) {
      return '📊';
    } else if (type.includes('csv')) {
      return '📋';
    } else {
      return '📎';
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    maxSize,
    multiple,
    disabled
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : isDragActive
            ? isDragReject
              ? 'border-red-400 bg-red-50'
              : 'border-primary bg-primary bg-opacity-5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-disabled={disabled}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-2">
          {isDragReject ? (
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />
          ) : (
            <DocumentArrowUpIcon className="h-12 w-12 text-gray-400" />
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isDragActive
                ? isDragReject
                  ? 'Some files will be rejected'
                  : 'Drop the files here...'
                : label
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
            
            {/* File constraints */}
            <div className="text-xs text-gray-400 mt-2 space-y-1">
              {maxFiles > 1 && <div>Max {maxFiles} files</div>}
              <div>Max size: {formatFileSize(maxSize)}</div>
              {Object.keys(acceptedFileTypes).length > 0 && (
                <div>
                  Accepted: {Object.keys(acceptedFileTypes).join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {error.file}
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {error.errors.map((err, errIndex) => (
                      <li key={errIndex}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File preview */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((fileInfo) => (
              <div
                key={fileInfo.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  {fileInfo.preview ? (
                    <img
                      src={fileInfo.preview}
                      alt={fileInfo.name}
                      className="h-10 w-10 object-cover rounded"
                      onLoad={() => URL.revokeObjectURL(fileInfo.preview)}
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-lg">
                      {getFileTypeIcon(fileInfo.type)}
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {fileInfo.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileInfo.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <button
                    type="button"
                    onClick={() => removeFile(fileInfo.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${fileInfo.name}`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;