import React from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const EmptyState = ({ 
  icon = 'Inbox',
  title = 'No data found',
  description,
  actionLabel,
  onAction,
  className 
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon name={icon} size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="default"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
