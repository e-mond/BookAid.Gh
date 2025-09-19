import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * FileUpload component with drag and drop functionality
 * Supports multiple file types and provides upload progress
 */
const FileUpload = ({ 
  onFileSelect, 
  acceptedTypes = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg', '.gif']
  },
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  className = "",
  disabled = false,
  placeholder = "Drag & drop files here, or click to select"
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Handle file drop/selection
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      console.error('Some files were rejected:', rejectedFiles);
      return;
    }

    setUploading(true);
    
    try {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading'
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Simulate upload process
      for (const fileObj of newFiles) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, status: 'completed' }
              : f
          )
        );
      }

      // Notify parent component
      onFileSelect && onFileSelect(acceptedFiles);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === newFiles[0]?.id 
            ? { ...f, status: 'error' }
            : f
        )
      );
    } finally {
      setUploading(false);
    }
  }, [onFileSelect]);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxFiles,
    maxSize,
    disabled
  });

  // Remove file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <p className="text-sm text-gray-600 mb-2">
          {isDragActive 
            ? 'Drop the files here...' 
            : placeholder
          }
        </p>
        
        <p className="text-xs text-gray-500">
          Accepted formats: PDF, PNG, JPG, JPEG, GIF (max {formatFileSize(maxSize)})
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          {uploadedFiles.map((fileObj) => (
            <div
              key={fileObj.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <DocumentIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {fileObj.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileObj.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Status indicator */}
                {fileObj.status === 'uploading' && (
                  <div className="flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </div>
                )}
                
                {fileObj.status === 'completed' && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Uploaded
                  </span>
                )}
                
                {fileObj.status === 'error' && (
                  <span className="text-xs text-red-600 font-medium">
                    ✗ Error
                  </span>
                )}
                
                {/* Remove button */}
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${fileObj.name}`}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading files...</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;