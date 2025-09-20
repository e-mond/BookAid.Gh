import React, { createContext, useContext } from 'react';
import { useToast, ToastContainer } from '../components/Toast';

// Create the ToastContext
const ToastContext = createContext();

// Custom hook to use the ToastContext
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

// ToastProvider component to wrap the app
export const ToastProvider = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </ToastContext.Provider>
  );
};