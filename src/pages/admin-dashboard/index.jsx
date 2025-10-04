import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../../components/ui/MobileBottomNavigation';
import StatsCard from './components/StatsCard';
import UsersTab from './components/UsersTab';
import ApprovalWorkflowsTab from './components/ApprovalWorkflowsTab';
import AllExpensesTab from './components/AllExpensesTab';
import Icon from '../../components/AppIcon';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  // Mock admin user data
  const adminUser = {
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'admin',
    department: 'Finance',
    avatar: null
  };

  // Mock dashboard statistics
  const dashboardStats = [
    {
      title: 'Total Expenses',
      value: '$47,892',
      change: '+12.5% from last month',
      changeType: 'positive',
      icon: 'Receipt',
      color: 'primary'
    },
    {
      title: 'Pending Approvals',
      value: '23',
      change: '+5 from yesterday',
      changeType: 'neutral',
      icon: 'Clock',
      color: 'warning'
    },
    {
      title: 'Approved This Month',
      value: '156',
      change: '+8.2% from last month',
      changeType: 'positive',
      icon: 'CheckCircle',
      color: 'success'
    },
    {
      title: 'Rejected',
      value: '12',
      change: '-2.1% from last month',
      changeType: 'positive',
      icon: 'XCircle',
      color: 'error'
    }
  ];

  const tabs = [
    {
      id: 'users',
      label: 'Users',
      icon: 'Users',
      component: UsersTab
    },
    {
      id: 'workflows',
      label: 'Approval Workflows',
      icon: 'Settings',
      component: ApprovalWorkflowsTab
    },
    {
      id: 'expenses',
      label: 'All Expenses',
      icon: 'Receipt',
      component: AllExpensesTab
    }
  ];

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStatsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    console.log('Admin logout');
    navigate('/');
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
  };

  const ActiveTabComponent = tabs?.find(tab => tab?.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigationBar
        user={adminUser}
        notificationCount={5}
        onLogout={handleLogout}
      />
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage users, workflows, and oversee all expense activities
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats?.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat?.title}
                value={stat?.value}
                change={stat?.change}
                changeType={stat?.changeType}
                icon={stat?.icon}
                color={stat?.color}
                loading={statsLoading}
              />
            ))}
          </div>

          {/* Tabs Navigation */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Tab Headers */}
            <div className="border-b border-border">
              <div className="flex overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                      activeTab === tab?.id
                        ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {ActiveTabComponent && <ActiveTabComponent />}
            </div>
          </div>
        </div>
      </main>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        user={adminUser}
        notificationCount={5}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
};

export default AdminDashboard;