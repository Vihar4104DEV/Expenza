import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const TopNavigationBar = ({ 
  user = { name: 'John Doe', role: 'employee', avatar: null },
  notificationCount = 0,
  onLogout = () => {},
  className = ''
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const getNavigationItems = () => {
    const role = user?.role;
    
    // Common items for all roles
    const commonItems = [
      {
        label: 'Dashboard',
        path: role === 'admin' ? '/admin-dashboard' : 
              role === 'manager' ? '/manager-approval-dashboard' : '/employee-dashboard',
        icon: 'LayoutDashboard',
        roles: ['employee', 'manager', 'admin']
      }
    ];

    // Role-specific items
    if (role === 'employee') {
      return [
        ...commonItems,
        {
          label: 'Expenses',
          path: '/expenses',
          icon: 'Receipt',
          roles: ['employee']
        },
        {
          label: 'Profile',
          path: '/profile',
          icon: 'User',
          roles: ['employee']
        },
        {
          label: 'Settings',
          path: '/settings',
          icon: 'Settings',
          roles: ['employee']
        }
      ];
    }

    if (role === 'manager') {
      return [
        ...commonItems,
        {
          label: 'Reports',
          path: '/manager/reports',
          icon: 'BarChart3',
          roles: ['manager']
        },
        {
          label: 'Team',
          path: '/manager/team',
          icon: 'Users',
          roles: ['manager']
        },
        {
          label: 'Profile',
          path: '/profile',
          icon: 'User',
          roles: ['manager']
        }
      ];
    }

    if (role === 'admin') {
      return [
        ...commonItems,
        {
          label: 'Reports',
          path: '/admin/reports',
          icon: 'BarChart3',
          roles: ['admin']
        },
        {
          label: 'Teams',
          path: '/admin/teams',
          icon: 'Users',
          roles: ['admin']
        },
        {
          label: 'Settings',
          path: '/settings',
          icon: 'Settings',
          roles: ['admin']
        }
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  const visibleItems = navigationItems?.filter(item => 
    item?.roles?.includes(user?.role)
  )?.slice(0, 4);

  const moreItems = navigationItems?.filter(item => 
    item?.roles?.includes(user?.role)
  )?.slice(4);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef?.current && !profileRef?.current?.contains(event?.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleProfileAction = (action) => {
    setIsProfileOpen(false);
    if (action === 'logout') {
      onLogout();
    } else if (action === 'profile') {
      navigate('/profile');
    }
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'employee': 'Employee',
      'manager': 'Manager',
      'admin': 'Administrator',
      'Employee': 'Employee',
      'Manager': 'Manager',
      'Admin': 'Administrator'
    };
    return roleMap?.[role] || 'User';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-card border-b border-border ${className}`}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Receipt" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">Expenza</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {visibleItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActivePath(item?.path) ? "default" : "ghost"}
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={18}
              className="px-3 py-2"
            >
              {item?.label}
            </Button>
          ))}
          
          {moreItems?.length > 0 && (
            <div className="relative">
              <Button
                variant="ghost"
                iconName="MoreHorizontal"
                iconSize={18}
                className="px-3 py-2"
              >
                More
              </Button>
            </div>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              iconName="Bell"
              iconSize={20}
              className="p-2"
            />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors duration-150"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-foreground">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{getRoleDisplayName(user?.role)}</div>
              </div>
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg animate-in slide-in-from-top">
                <div className="p-3 border-b border-border">
                  <div className="font-medium text-popover-foreground">{user?.name}</div>
                  <div className="text-sm text-muted-foreground">{getRoleDisplayName(user?.role)}</div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => handleProfileAction('profile')}
                    className="flex items-center w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                  >
                    <Icon name="User" size={16} className="mr-2" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => handleProfileAction('preferences')}
                    className="flex items-center w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                  >
                    <Icon name="Settings" size={16} className="mr-2" />
                    Preferences
                  </button>
                  <div className="border-t border-border my-1"></div>
                  <button
                    onClick={() => handleProfileAction('logout')}
                    className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors duration-150"
                  >
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Hidden since we have bottom nav on mobile */}
          {/* <Button
            variant="ghost"
            iconName="Menu"
            iconSize={20}
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          /> */}
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-in slide-in-from-top">
          <nav className="px-4 py-3 space-y-1">
            {visibleItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-colors duration-150 ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} className="mr-3" />
                {item?.label}
              </button>
            ))}
            {moreItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-colors duration-150 ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} className="mr-3" />
                {item?.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default TopNavigationBar;