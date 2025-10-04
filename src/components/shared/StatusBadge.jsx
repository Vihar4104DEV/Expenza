import React from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';

const StatusBadge = ({ status, size = 'md', showIcon = true, className }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      icon: 'Clock',
      iconColor: 'text-yellow-600'
    },
    'in-progress': {
      label: 'In Progress',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: 'Loader2',
      iconColor: 'text-blue-600'
    },
    approved: {
      label: 'Approved',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: 'CheckCircle',
      iconColor: 'text-green-600'
    },
    rejected: {
      label: 'Rejected',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: 'XCircle',
      iconColor: 'text-red-600'
    },
    submitted: {
      label: 'Submitted',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: 'Send',
      iconColor: 'text-gray-600'
    },
    cancelled: {
      label: 'Cancelled',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: 'Ban',
      iconColor: 'text-gray-600'
    }
  };

  const sizeConfig = {
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      iconSize: 12
    },
    md: {
      padding: 'px-2.5 py-1',
      text: 'text-sm',
      iconSize: 14
    },
    lg: {
      padding: 'px-3 py-1.5',
      text: 'text-base',
      iconSize: 16
    }
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const sizeStyles = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center space-x-1.5 rounded-full border font-medium',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeStyles.padding,
        sizeStyles.text,
        className
      )}
    >
      {showIcon && (
        <Icon 
          name={config.icon} 
          size={sizeStyles.iconSize} 
          className={config.iconColor}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
