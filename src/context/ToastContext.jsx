import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const variantClass = {
  success: 'text-bg-success',
  danger: 'text-bg-danger',
  warning: 'text-bg-warning',
  info: 'text-bg-info',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, variant = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts([{ id, message, variant }]);
  }, []);

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3 d-flex flex-column gap-2">
        {toasts.map((toast) => (
          <div
            aria-atomic="true"
            aria-live="assertive"
            className={`toast show border-0 ${variantClass[toast.variant] || variantClass.info}`}
            key={toast.id}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                aria-label="Close"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => removeToast(toast.id)}
                type="button"
              />
            </div>
          </div>
        ))}
      </div>
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
