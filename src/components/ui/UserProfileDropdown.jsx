import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Image from '../AppImage';

const UserProfileDropdown = ({
  user = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'employee',
    avatar: null,
    department: 'Engineering'
  },
  onLogout = () => {},
  onProfileClick = () => {},
  onSettingsClick = () => {},
  showRoleInfo = true,
  showDepartment = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event?.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'employee': 'Employee',
      'manager': 'Manager',
      'admin': 'Administrator',
      'finance': 'Finance Team',
      'hr': 'HR Team'
    };
    return roleMap?.[role] || 'User';
  };

  const getRoleIcon = (role) => {
    const iconMap = {
      'employee': 'User',
      'manager': 'Users',
      'admin': 'Shield',
      'finance': 'Calculator',
      'hr': 'Heart'
    };
    return iconMap?.[role] || 'User';
  };

  const handleMenuAction = (action, path = null) => {
    setIsOpen(false);
    
    switch (action) {
      case 'profile':
        onProfileClick();
        if (path) navigate(path);
        break;
      case 'settings':
        onSettingsClick();
        if (path) navigate(path);
        break;
      case 'logout':
        onLogout();
        break;
      default:
        if (path) navigate(path);
    }
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'View Profile',
      icon: 'User',
      action: 'profile',
      path: '/profile'
    },
    {
      id: 'account',
      label: 'Account Settings',
      icon: 'Settings',
      action: 'settings',
      path: '/account-settings'
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: 'Sliders',
      action: 'custom',
      path: '/preferences'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'HelpCircle',
      action: 'custom',
      path: '/help'
    }
  ];

  const getInitials = (name) => {
    return name?.split(' ')?.map(word => word?.charAt(0))?.join('')?.toUpperCase()?.slice(0, 2);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="relative">
          {user?.avatar ? (
            <Image
              src={user?.avatar}
              alt={`${user?.name}'s avatar`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">
                {getInitials(user?.name)}
              </span>
            </div>
          )}
          
          {/* Online Status Indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full"></div>
        </div>

        {/* User Info */}
        <div className="hidden lg:block text-left">
          <div className="text-sm font-medium text-foreground truncate max-w-32">
            {user?.name}
          </div>
          {showRoleInfo && (
            <div className="text-xs text-muted-foreground truncate max-w-32">
              {getRoleDisplayName(user?.role)}
            </div>
          )}
        </div>

        {/* Chevron */}
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-muted-foreground transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-popover border border-border rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
          {/* User Info Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <Image
                  src={user?.avatar}
                  alt={`${user?.name}'s avatar`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-foreground">
                    {getInitials(user?.name)}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-popover-foreground truncate">
                  {user?.name}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {user?.email}
                </div>
                
                {/* Role and Department */}
                <div className="flex items-center space-x-3 mt-2">
                  {showRoleInfo && (
                    <div className="flex items-center space-x-1">
                      <Icon name={getRoleIcon(user?.role)} size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {getRoleDisplayName(user?.role)}
                      </span>
                    </div>
                  )}
                  
                  {showDepartment && user?.department && (
                    <div className="flex items-center space-x-1">
                      <Icon name="Building" size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {user?.department}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems?.map((item) => (
              <button
                key={item?.id}
                onClick={() => handleMenuAction(item?.action, item?.path)}
                className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
              >
                <Icon name={item?.icon} size={16} className="mr-3 text-muted-foreground" />
                {item?.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border"></div>

          {/* Logout */}
          <div className="py-2">
            <button
              onClick={() => handleMenuAction('logout')}
              className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors duration-150"
            >
              <Icon name="LogOut" size={16} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;