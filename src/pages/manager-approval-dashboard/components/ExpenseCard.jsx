import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ExpenseCard = ({ 
  expense = {
    id: 'EXP-001',
    employee: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      department: 'Marketing'
    },
    amount: 125.50,
    currency: 'INR',
    merchant: 'Starbucks Coffee',
    date: '2025-10-03',
    category: 'Meals & Entertainment',
    receipt: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300',
    description: 'Client meeting coffee and breakfast',
    submittedAt: '2025-10-03T14:30:00Z',
    urgency: 'normal',
    tags: ['client-meeting', 'breakfast']
  },
  isSelected = false,
  onSelect = () => {},
  onApprove = () => {},
  onReject = () => {},
  onViewDetails = () => {},
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const getUrgencyColor = (urgency) => {
    const colors = {
      urgent: 'border-error bg-error/5',
      high: 'border-warning bg-warning/5',
      normal: 'border-border bg-card'
    };
    return colors?.[urgency] || colors?.normal;
  };

  const getUrgencyIndicator = (urgency) => {
    if (urgency === 'urgent') {
      return (
        <div className="flex items-center space-x-1 text-error">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">URGENT</span>
        </div>
      );
    }
    if (urgency === 'high') {
      return (
        <div className="flex items-center space-x-1 text-warning">
          <Icon name="AlertTriangle" size={12} />
          <span className="text-xs font-medium">HIGH</span>
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })?.format(amount);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const submitted = new Date(timestamp);
    const diffInHours = Math.floor((now - submitted) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className={`
      border rounded-lg p-4 transition-all duration-200 hover:shadow-md
      ${getUrgencyColor(expense?.urgency)}
      ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
      ${className}
    `}>
      {/* Header with selection and urgency */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm font-medium text-muted-foreground">
            {expense?.id}
          </span>
        </div>
        {getUrgencyIndicator(expense?.urgency)}
      </div>
      {/* Employee Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          {expense?.employee?.avatar && !imageError ? (
            <Image
              src={expense?.employee?.avatar}
              alt={expense?.employee?.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {expense?.employee?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {expense?.employee?.department}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(expense?.amount, expense?.currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            {getTimeAgo(expense?.submittedAt)}
          </p>
        </div>
      </div>
      {/* Receipt Thumbnail */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          {expense?.receipt ? (
            <Image
              src={expense?.receipt}
              alt="Receipt"
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onViewDetails}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {expense?.merchant}
          </p>
          <p className="text-xs text-muted-foreground mb-1">
            {formatDate(expense?.date)} • {expense?.category}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {expense?.description}
          </p>
        </div>
      </div>
      {/* Tags */}
      {expense?.tags && expense?.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {expense?.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-muted text-xs text-muted-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          iconName="Eye"
          iconPosition="left"
          iconSize={14}
          className="flex-1"
        >
          View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReject}
          iconName="X"
          iconPosition="left"
          iconSize={14}
          className="text-error border-error hover:bg-error hover:text-error-foreground"
        >
          Reject
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onApprove}
          iconName="Check"
          iconPosition="left"
          iconSize={14}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          Approve
        </Button>
      </div>
    </div>
  );
};

export default ExpenseCard;