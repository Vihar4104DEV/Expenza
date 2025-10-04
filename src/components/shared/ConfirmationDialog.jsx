import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default', // 'default' | 'danger'
  icon = 'AlertCircle',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        >
          {/* Icon */}
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mb-4',
            variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
          )}>
            <Icon 
              name={icon} 
              size={24} 
              className={variant === 'danger' ? 'text-red-600' : 'text-yellow-600'} 
            />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-gray-600 mb-6">
              {description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant === 'danger' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isLoading}
              iconName={isLoading ? 'Loader2' : undefined}
              iconClassName={isLoading ? 'animate-spin' : ''}
            >
              {confirmLabel}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationDialog;
