import { createContext, useCallback, useContext, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext(null);

const variantToType = {
  danger: 'error',
  error: 'error',
  info: 'info',
  success: 'success',
  warning: 'warning',
};

export function ToastProvider({ children }) {
  const showToast = useCallback((message, variant = 'info') => {
    const type = variantToType[variant] || 'info';
    toast[type](message);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer autoClose={2500} newestOnTop position="top-right" />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
