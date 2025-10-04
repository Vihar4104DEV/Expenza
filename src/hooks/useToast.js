import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000, position = 'top-right') => {
    const id = toastId++;
    const newToast = { id, message, type, duration, position };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration, position) => {
    return addToast(message, 'success', duration, position);
  }, [addToast]);

  const error = useCallback((message, duration, position) => {
    return addToast(message, 'error', duration, position);
  }, [addToast]);

  const warning = useCallback((message, duration, position) => {
    return addToast(message, 'warning', duration, position);
  }, [addToast]);

  const info = useCallback((message, duration, position) => {
    return addToast(message, 'info', duration, position);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};
