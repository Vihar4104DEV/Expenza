import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TopNavigationBar from '../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';
import { getInitials } from '../utils/formatters';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Marketing',
    employeeId: 'EMP-001',
    role: 'Employee',
    companyName: 'Acme Inc.',
    country: 'United States',
    currency: 'USD'
  });

  // Get current user role from localStorage
  const userRole = localStorage.getItem('userRole') || 'employee';
  
  const currentUser = {
    name: formData.fullName,
    email: formData.email,
    role: userRole
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    // Show success toast
    alert('Profile updated successfully!');
  };

  const stats = [
    { label: 'Total Expenses', value: '156', icon: 'Receipt', color: 'blue' },
    { label: 'Pending', value: '8', icon: 'Clock', color: 'yellow' },
    { label: 'Approved', value: '142', icon: 'CheckCircle', color: 'green' },
    { label: 'Rejected', value: '6', icon: 'XCircle', color: 'red' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={3} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {getInitials(formData.fullName)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{formData.fullName}</h2>
                  <p className="text-gray-600 mb-2">{formData.role}</p>
                  <p className="text-sm text-gray-500 mb-4">{formData.department}</p>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-6">
                    <Icon name="Mail" size={16} />
                    <span>{formData.email}</span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    iconName="Upload"
                    iconPosition="left"
                  >
                    Change Photo
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Employee ID</span>
                      <span className="font-medium text-gray-900">{formData.employeeId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Company</span>
                      <span className="font-medium text-gray-900">{formData.companyName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Currency</span>
                      <span className="font-medium text-gray-900">{formData.currency}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                          <Icon name={stat.icon} size={20} className={`text-${stat.color}-600`} />
                        </div>
                        <span className="text-gray-700">{stat.label}</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Information Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      iconName="Edit"
                      iconPosition="left"
                    >
                      Edit
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
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
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <Input
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <Input
                      name="employeeId"
                      value={formData.employeeId}
                      disabled={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <Input
                      name="role"
                      value={formData.role}
                      disabled={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      disabled={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <Input
                      name="country"
                      value={formData.country}
                      disabled={true}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Security Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">Change Password</Button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Active Sessions</p>
                      <p className="text-sm text-gray-600">Manage your active sessions</p>
                    </div>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNavigation user={currentUser} notificationCount={3} />
    </div>
  );
};

export default ProfilePage;
