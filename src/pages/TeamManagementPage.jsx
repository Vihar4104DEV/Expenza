import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TopNavigationBar from '../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';
import StatusBadge from '../components/shared/StatusBadge';
import AddTeamMemberModal from './manager/AddTeamMemberModal';
import { getInitials, formatCurrency } from '../utils/formatters';

const TeamManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Get current user from localStorage
  const getUserData = () => {
    const role = localStorage.getItem('userRole') || 'employee';
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    return {
      name: role === 'admin' ? 'Admin User' : 'Manager User',
      email: role === 'admin' ? 'admin@company.com' : 'manager@company.com',
      role: role,
      department: role === 'manager' ? 'Engineering' : null // Manager's department
    };
  };

  const currentUser = getUserData();
  const isManager = currentUser.role === 'manager';
  const isAdmin = currentUser.role === 'admin';

  // All team members (for admin) or manager's team only
  const allTeamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Marketing',
      role: 'Employee',
      avatar: null,
      status: 'active',
      totalExpenses: 12500,
      pendingExpenses: 3,
      joinedDate: '2023-01-15',
      managerId: 'MGR-001'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      department: 'Engineering',
      role: 'Employee',
      avatar: null,
      status: 'active',
      totalExpenses: 10800,
      pendingExpenses: 2,
      joinedDate: '2023-03-20',
      managerId: 'MGR-002' // Current manager's ID
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      department: 'Sales',
      role: 'Employee',
      avatar: null,
      status: 'active',
      totalExpenses: 9200,
      pendingExpenses: 5,
      joinedDate: '2023-02-10',
      managerId: 'MGR-003'
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@company.com',
      department: 'Engineering',
      role: 'Employee',
      avatar: null,
      status: 'active',
      totalExpenses: 8500,
      pendingExpenses: 1,
      joinedDate: '2023-04-05',
      managerId: 'MGR-002' // Current manager's ID
    },
    {
      id: 5,
      name: 'Lisa Wang',
      email: 'lisa.wang@company.com',
      department: 'Engineering',
      role: 'Employee',
      avatar: null,
      status: 'active',
      totalExpenses: 7800,
      pendingExpenses: 4,
      joinedDate: '2023-05-12',
      managerId: 'MGR-002' // Current manager's ID
    },
    {
      id: 6,
      name: 'John Smith',
      email: 'john.smith@company.com',
      department: 'Engineering',
      role: 'Employee',
      avatar: null,
      status: 'active',
      totalExpenses: 6500,
      pendingExpenses: 2,
      joinedDate: '2023-06-01',
      managerId: 'MGR-002' // Current manager's ID
    }
  ];

  // Filter team members based on role
  // Manager sees only their team (managerId: 'MGR-002')
  // Admin sees all team members
  const teamMembers = isManager 
    ? allTeamMembers.filter(member => member.managerId === 'MGR-002' && member.department === 'Engineering')
    : allTeamMembers;

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleLogout = () => {
    navigate('/');
  };

  // Departments filter - Manager sees only their department
  const departments = isManager 
    ? ['all', 'Engineering'] 
    : ['all', 'Marketing', 'Engineering', 'Sales', 'Finance', 'HR'];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={5} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isManager ? 'My Team' : 'Team Management'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isManager 
                    ? `Manage your ${teamMembers.length} team members in Engineering` 
                    : 'Manage all team members and their expenses'}
                </p>
              </div>
              {isManager && (
                <Button
                  variant="default"
                  iconName="UserPlus"
                  iconPosition="left"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  Add Team Member
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="Search"
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Users" size={24} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              <p className="text-sm text-gray-600">Total Members</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="DollarSign" size={24} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(teamMembers.reduce((sum, m) => sum + m.totalExpenses, 0), 'INR')}
              </p>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="Clock" size={24} className="text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.reduce((sum, m) => sum + m.pendingExpenses, 0)}
              </p>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon name="TrendingUp" size={24} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(teamMembers.reduce((sum, m) => sum + m.totalExpenses, 0) / teamMembers.length, 'INR')}
              </p>
              <p className="text-sm text-gray-600">Avg per Member</p>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={member.status} size="sm" />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Icon name="Mail" size={16} />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Icon name="Briefcase" size={16} />
                    <span>{member.department}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Expenses</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(member.totalExpenses, 'INR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">
                      {member.pendingExpenses} expenses
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/team-expenses?member=${member.id}`)}
                  >
                    View Expenses
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="MoreVertical"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Users" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>

      <MobileBottomNavigation user={currentUser} notificationCount={5} />

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        department={currentUser.department || 'Engineering'}
      />
    </div>
  );
};

export default TeamManagementPage;
