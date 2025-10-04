import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';

const Toast = ({ 
  isVisible, 
  onClose, 
  message, 
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  duration = 5000,
  position = 'top-right' // 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const typeConfig = {
    success: {
      icon: 'CheckCircle',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      iconColor: 'text-green-600'
    },
    error: {
      icon: 'XCircle',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: 'AlertTriangle',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      iconColor: 'text-yellow-600'
    },
    info: {
      icon: 'Info',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600'
    }
  };

  const positionConfig = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position.includes('top') ? -20 : 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed z-50 max-w-md w-full shadow-lg rounded-lg border p-4',
            config.bgColor,
            config.borderColor,
            positionConfig[position]
          )}
        >
          <div className="flex items-start space-x-3">
            <Icon 
              name={config.icon} 
              size={20} 
              className={cn('flex-shrink-0 mt-0.5', config.iconColor)} 
            />
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', config.textColor)}>
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors',
                config.textColor
              )}
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container Component for managing multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{ 
            position: 'absolute',
            top: toast.position?.includes('top') ? `${4 + index * 80}px` : 'auto',
            bottom: toast.position?.includes('bottom') ? `${4 + index * 80}px` : 'auto',
            right: toast.position?.includes('right') ? '16px' : 'auto',
            left: toast.position?.includes('center') ? '50%' : 'auto',
            transform: toast.position?.includes('center') ? 'translateX(-50%)' : 'none'
          }}
        >
          <Toast
            isVisible={true}
            onClose={() => removeToast(toast.id)}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            position={toast.position}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;
