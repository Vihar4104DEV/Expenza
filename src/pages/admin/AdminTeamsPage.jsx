import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../../components/ui/MobileBottomNavigation';
import { getInitials, formatCurrency } from '../../utils/formatters';

const AdminTeamsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);

  // Get current user from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        name: user.name,
        email: user.email,
        role: user.role?.toLowerCase() || 'admin',
        employee_id: user.employee_id,
        company: user.company
      };
    }
    return {
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'admin'
    };
  };

  const currentUser = getUserData();

  // Managers with their teams
  const managers = [
    {
      id: 'MGR-001',
      name: 'David Wilson',
      email: 'david.wilson@company.com',
      department: 'Engineering',
      teamSize: 4,
      totalExpenses: 34600,
      pendingApprovals: 8,
      avatar: null,
      team: [
        {
          id: 2,
          name: 'Mike Chen',
          email: 'mike.chen@company.com',
          role: 'Employee',
          totalExpenses: 10800,
          pendingExpenses: 2,
          status: 'active'
        },
        {
          id: 4,
          name: 'Alex Rodriguez',
          email: 'alex.rodriguez@company.com',
          role: 'Employee',
          totalExpenses: 8500,
          pendingExpenses: 1,
          status: 'active'
        },
        {
          id: 5,
          name: 'Lisa Wang',
          email: 'lisa.wang@company.com',
          role: 'Employee',
          totalExpenses: 7800,
          pendingExpenses: 4,
          status: 'active'
        },
        {
          id: 6,
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'Employee',
          totalExpenses: 6500,
          pendingExpenses: 2,
          status: 'active'
        }
      ]
    },
    {
      id: 'MGR-002',
      name: 'Jennifer Martinez',
      email: 'jennifer.martinez@company.com',
      department: 'Marketing',
      teamSize: 2,
      totalExpenses: 21000,
      pendingApprovals: 3,
      avatar: null,
      team: [
        {
          id: 1,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          role: 'Employee',
          totalExpenses: 12500,
          pendingExpenses: 3,
          status: 'active'
        },
        {
          id: 7,
          name: 'Robert Brown',
          email: 'robert.brown@company.com',
          role: 'Employee',
          totalExpenses: 8500,
          pendingExpenses: 0,
          status: 'active'
        }
      ]
    },
    {
      id: 'MGR-003',
      name: 'Michael Chang',
      email: 'michael.chang@company.com',
      department: 'Sales',
      teamSize: 1,
      totalExpenses: 9200,
      pendingApprovals: 5,
      avatar: null,
      team: [
        {
          id: 3,
          name: 'Emily Davis',
          email: 'emily.davis@company.com',
          role: 'Employee',
          totalExpenses: 9200,
          pendingExpenses: 5,
          status: 'active'
        }
      ]
    }
  ];

  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    navigate('/');
  };

  const handleViewTeam = (manager) => {
    setSelectedManager(manager);
  };

  const handleBackToManagers = () => {
    setSelectedManager(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={5} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedManager ? (
            <>
              {/* Managers View */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Teams Overview</h1>
                    <p className="text-gray-600 mt-2">View all managers and their teams</p>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <Input
                    placeholder="Search by manager name or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon="Search"
                  />
                </div>
              </div>

              {/* Managers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredManagers.map((manager, index) => (
                  <motion.div
                    key={manager.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewTeam(manager)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(manager.name)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                          <p className="text-sm text-gray-600">Manager</p>
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={20} className="text-gray-400" />
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Icon name="Briefcase" size={16} />
                        <span>{manager.department}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Icon name="Mail" size={16} />
                        <span className="truncate">{manager.email}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Team Size</span>
                        <span className="font-semibold text-gray-900">{manager.teamSize} members</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Expenses</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(manager.totalExpenses, 'INR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-semibold text-yellow-600">
                          {manager.pendingApprovals} approvals
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTeam(manager);
                        }}
                      >
                        View Team
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Team Members View */}
              <div className="mb-8">
                <Button
                  variant="ghost"
                  onClick={handleBackToManagers}
                  iconName="ArrowLeft"
                  iconPosition="left"
                  className="mb-4"
                >
                  Back to Managers
                </Button>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{selectedManager.name}'s Team</h1>
                    <p className="text-gray-600 mt-2">
                      {selectedManager.department} Department • {selectedManager.teamSize} members
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedManager.team.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Icon name="Mail" size={16} />
                        <span className="truncate">{member.email}</span>
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

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/team-expenses?member=${member.id}`)}
                      >
                        View Expenses
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <MobileBottomNavigation user={currentUser} notificationCount={5} />
    </div>
  );
};

export default AdminTeamsPage;
