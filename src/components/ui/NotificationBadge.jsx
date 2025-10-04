import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const NotificationBadge = ({ 
  count = 0,
  maxCount = 99,
  showZero = false,
  variant = 'default',
  size = 'default',
  pulse = false,
  onClick = () => {},
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(count > 0 || showZero);
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    setIsVisible(count > 0 || showZero);
    setDisplayCount(count > maxCount ? `${maxCount}+` : count);
  }, [count, maxCount, showZero]);

  const getVariantClasses = () => {
    const variants = {
      default: 'bg-error text-error-foreground',
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      secondary: 'bg-secondary text-secondary-foreground'
    };
    return variants?.[variant] || variants?.default;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-4 w-4 text-xs min-w-4',
      default: 'h-5 w-5 text-xs min-w-5',
      lg: 'h-6 w-6 text-sm min-w-6'
    };
    return sizes?.[size] || sizes?.default;
  };

  if (!isVisible) return null;

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        rounded-full font-medium
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${pulse ? 'animate-pulse' : ''}
        ${onClick !== (() => {}) ? 'cursor-pointer hover:scale-105 transition-transform duration-150' : ''}
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
};

const NotificationIcon = ({
  iconName = 'Bell',
  iconSize = 20,
  count = 0,
  maxCount = 99,
  showZero = false,
  badgeVariant = 'default',
  badgeSize = 'default',
  pulse = false,
  onClick = () => {},
  onBadgeClick = () => {},
  className = ''
}) => {
  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        onClick={onClick}
        className="p-2 rounded-lg hover:bg-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <Icon name={iconName} size={iconSize} className="text-foreground" />
      </button>
      
      {(count > 0 || showZero) && (
        <div className="absolute -top-1 -right-1">
          <NotificationBadge
            count={count}
            maxCount={maxCount}
            showZero={showZero}
            variant={badgeVariant}
            size={badgeSize}
            pulse={pulse}
            onClick={onBadgeClick}
          />
        </div>
      )}
    </div>
  );
};

const NotificationList = ({
  notifications = [],
  onNotificationClick = () => {},
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  className = ''
}) => {
  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  const getNotificationIcon = (type) => {
    const iconMap = {
      expense: 'Receipt',
      approval: 'CheckCircle',
      rejection: 'XCircle',
      reminder: 'Clock',
      system: 'Info',
      warning: 'AlertTriangle',
      error: 'AlertCircle'
    };
    return iconMap?.[type] || 'Bell';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      expense: 'text-primary',
      approval: 'text-success',
      rejection: 'text-error',
      reminder: 'text-warning',
      system: 'text-muted-foreground',
      warning: 'text-warning',
      error: 'text-error'
    };
    return colorMap?.[type] || 'text-muted-foreground';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`bg-popover border border-border rounded-lg shadow-lg w-80 max-h-96 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-popover-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <NotificationBadge count={unreadCount} size="sm" />
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-primary hover:text-primary/80 transition-colors duration-150"
          >
            Mark all read
          </button>
        )}
      </div>
      {/* Notifications */}
      <div className="max-h-80 overflow-y-auto">
        {notifications?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications?.map((notification) => (
              <div
                key={notification?.id}
                onClick={() => onNotificationClick(notification)}
                className={`p-4 hover:bg-muted cursor-pointer transition-colors duration-150 ${
                  !notification?.read ? 'bg-muted/50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 ${getNotificationColor(notification?.type)}`}>
                    <Icon name={getNotificationIcon(notification?.type)} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!notification?.read ? 'text-popover-foreground' : 'text-muted-foreground'}`}>
                        {notification?.title}
                      </p>
                      {!notification?.read && (
                        <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification?.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification?.timestamp)}
                      </span>
                      {!notification?.read && (
                        <button
                          onClick={(e) => {
                            e?.stopPropagation();
                            onMarkAsRead(notification?.id);
                          }}
                          className="text-xs text-primary hover:text-primary/80 transition-colors duration-150"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { NotificationBadge, NotificationIcon, NotificationList };
export default NotificationBadge;