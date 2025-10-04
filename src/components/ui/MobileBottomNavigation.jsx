import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { NotificationBadge } from './NotificationBadge';

const MobileBottomNavigation = ({
  user = { role: 'employee' },
  notificationCount = 0,
  onQuickAction = () => {},
  className = ''
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getNavigationItems = (userRole) => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        path: userRole === 'admin' ? '/admin-dashboard' : 
              userRole === 'manager'? '/manager-approval-dashboard' : '/employee-dashboard',
        roles: ['employee', 'manager', 'admin']
      }
    ];

    const roleSpecificItems = {
      employee: [
        {
          id: 'expenses',
          label: 'Expenses',
          icon: 'Receipt',
          path: '/expenses',
          roles: ['employee']
        },
        {
          id: 'quick-add',
          label: 'Add',
          icon: 'Plus',
          path: '/add-expense',
          isQuickAction: true,
          roles: ['employee']
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: 'User',
          path: '/profile',
          roles: ['employee']
        }
      ],
      manager: [
        {
          id: 'team',
          label: 'Team',
          icon: 'Users',
          path: '/team',
          roles: ['manager']
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: 'BarChart3',
          path: '/manager/reports',
          roles: ['manager']
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: 'User',
          path: '/profile',
          roles: ['manager']
        }
      ],
      admin: [
        {
          id: 'team',
          label: 'Team',
          icon: 'Users',
          path: '/team',
          roles: ['admin']
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: 'BarChart3',
          path: '/admin/reports',
          roles: ['admin']
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'Settings',
          path: '/settings',
          roles: ['admin']
        }
      ]
    };

    const items = [...baseItems, ...(roleSpecificItems?.[userRole] || [])];
    
    // Add notifications/profile as the last item
    items?.push({
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      path: '/profile',
      badge: notificationCount > 0 ? notificationCount : undefined,
      roles: ['employee', 'manager', 'admin']
    });

    return items?.filter(item => item?.roles?.includes(userRole))?.slice(0, 5);
  };

  const navigationItems = getNavigationItems(user?.role);

  const isActivePath = (path) => {
    if (path === '/profile') {
      return location?.pathname === '/profile' || location?.pathname === '/notifications';
    }
    return location?.pathname === path;
  };

  const handleNavigation = (item) => {
    if (item?.isQuickAction) {
      onQuickAction(item);
    } else {
      navigate(item?.path);
    }
  };

  const getItemColor = (item, isActive) => {
    if (item?.isQuickAction) {
      return 'text-primary';
    }
    return isActive ? 'text-primary' : 'text-muted-foreground';
  };

  const getItemBackground = (item, isActive) => {
    if (item?.isQuickAction) {
      return 'bg-primary/10';
    }
    return isActive ? 'bg-primary/10' : '';
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border md:hidden ${className}`}>
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems?.map((item) => {
          const isActive = isActivePath(item?.path);
          
          return (
            <button
              key={item?.id}
              onClick={() => handleNavigation(item)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg min-w-0 flex-1 mx-1
                transition-all duration-150 hover:scale-105
                ${getItemBackground(item, isActive)}
                ${item?.isQuickAction ? 'transform scale-110' : ''}
              `}
              aria-label={item?.label}
            >
              <div className="relative">
                <Icon 
                  name={item?.icon} 
                  size={item?.isQuickAction ? 24 : 20} 
                  className={getItemColor(item, isActive)}
                />
                
                {/* Badge for notifications or counts */}
                {item?.badge && item?.badge > 0 && (
                  <div className="absolute -top-2 -right-2">
                    <NotificationBadge 
                      count={item?.badge} 
                      size="sm"
                      variant={item?.id === 'approvals' ? 'warning' : 'default'}
                    />
                  </div>
                )}
              </div>
              <span className={`
                text-xs font-medium mt-1 truncate max-w-full
                ${getItemColor(item, isActive)}
                ${item?.isQuickAction ? 'font-semibold' : ''}
              `}>
                {item?.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-card"></div>
    </nav>
  );
};

const QuickActionButton = ({
  icon = 'Plus',
  label = 'Quick Action',
  onClick = () => {},
  variant = 'primary',
  className = ''
}) => {
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      success: 'bg-success text-success-foreground hover:bg-success/90',
      warning: 'bg-warning text-warning-foreground hover:bg-warning/90'
    };
    return variants?.[variant] || variants?.primary;
  };

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-20 right-4 z-50 md:hidden
        w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200 hover:scale-110 active:scale-95
        ${getVariantClasses()}
        ${className}
      `}
      aria-label={label}
    >
      <Icon name={icon} size={24} />
    </button>
  );
};

export { MobileBottomNavigation, QuickActionButton };
export default MobileBottomNavigation;