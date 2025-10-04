import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import TopNavigationBar from '../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    expenseApprovalAlerts: true,
    weeklyReports: true,
    monthlyReports: false,
    darkMode: false,
    compactView: false,
    autoSaveExpenses: true,
    requireReceipts: true,
    twoFactorAuth: false
  });

  // Get current user from localStorage
  const getUserData = () => {
    const role = localStorage.getItem('userRole') || 'employee';
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    return {
      name: role === 'admin' ? 'Admin User' : role === 'manager' ? 'Manager User' : 'Employee User',
      email: role === 'admin' ? 'admin@company.com' : role === 'manager' ? 'manager@company.com' : 'employee@company.com',
      role: role
    };
  };

  const currentUser = getUserData();

  const handleLogout = () => {
    navigate('/');
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // Save settings logic
    alert('Settings saved successfully!');
  };

  const settingsSections = [
    {
      title: 'Notifications',
      icon: 'Bell',
      settings: [
        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about your expenses' },
        { key: 'pushNotifications', label: 'Push Notifications', description: 'Get push notifications on your device' },
        { key: 'expenseApprovalAlerts', label: 'Expense Approval Alerts', description: 'Get notified when expenses are approved or rejected' },
        { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly expense summary reports' },
        { key: 'monthlyReports', label: 'Monthly Reports', description: 'Receive monthly expense summary reports' }
      ]
    },
    {
      title: 'Appearance',
      icon: 'Palette',
      settings: [
        { key: 'darkMode', label: 'Dark Mode', description: 'Use dark theme throughout the app' },
        { key: 'compactView', label: 'Compact View', description: 'Show more items in a smaller space' }
      ]
    },
    {
      title: 'Expense Management',
      icon: 'Receipt',
      settings: [
        { key: 'autoSaveExpenses', label: 'Auto-save Drafts', description: 'Automatically save expense drafts as you type' },
        { key: 'requireReceipts', label: 'Require Receipts', description: 'Always require receipt uploads for expenses' }
      ]
    },
    {
      title: 'Security',
      icon: 'Shield',
      settings: [
        { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={3} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              iconName="ArrowLeft"
              iconPosition="left"
              className="mb-4"
            >
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your preferences and account settings</p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingsSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name={section.icon} size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1 mr-4">
                        <label
                          htmlFor={setting.key}
                          className="text-sm font-medium text-gray-900 cursor-pointer block mb-1"
                        >
                          {setting.label}
                        </label>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleToggle(setting.key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[setting.key] ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-red-200 p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" size={20} className="text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Danger Zone</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Clear Cache</p>
                    <p className="text-sm text-gray-600">Clear all cached data and temporary files</p>
                  </div>
                  <Button variant="outline" size="sm">Clear Cache</Button>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Export Data</p>
                    <p className="text-sm text-gray-600">Download all your expense data</p>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex items-center justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              iconName="Check"
              iconPosition="left"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </main>

      <MobileBottomNavigation user={currentUser} notificationCount={3} />
    </div>
  );
};

export default SettingsPage;
