import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../../components/ui/MobileBottomNavigation';
import PendingQueueStats from './components/PendingQueueStats';
import ExpenseCard from './components/ExpenseCard';
import BulkActionBar from './components/BulkActionBar';
import FilterPanel from './components/FilterPanel';
import ApprovalModal from './components/ApprovalModal';
import TeamExpenseOverview from './components/TeamExpenseOverview';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ManagerApprovalDashboard = () => {
  const navigate = useNavigate();
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [approvalModal, setApprovalModal] = useState({ isOpen: false, expense: null, type: 'approve' });
  const [filters, setFilters] = useState({
    employee: '',
    dateRange: 'all',
    category: '',
    amountMin: '',
    amountMax: '',
    urgency: '',
    status: 'pending'
  });

  // Mock user data
  const currentUser = {
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    department: 'Engineering'
  };

  // Mock pending queue stats
  const queueStats = {
    totalPending: 12,
    urgent: 3,
    thisWeek: 8,
    teamTotal: 45
  };

  // Mock employee options for filters
  const employeeOptions = [
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'mike-chen', label: 'Mike Chen' },
    { value: 'emily-davis', label: 'Emily Davis' },
    { value: 'alex-rodriguez', label: 'Alex Rodriguez' },
    { value: 'lisa-wang', label: 'Lisa Wang' }
  ];

  // Mock expenses data
  const mockExpenses = [
    {
      id: 'EXP-001',
      employee: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        department: 'Marketing'
      },
      amount: 125.50,
      currency: 'USD',
      merchant: 'Starbucks Coffee',
      date: '2025-10-03',
      category: 'Meals & Entertainment',
      receipt: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300',
      description: 'Client meeting coffee and breakfast',
      submittedAt: '2025-10-03T14:30:00Z',
      urgency: 'urgent',
      tags: ['client-meeting', 'breakfast'],
      status: 'pending'
    },
    {
      id: 'EXP-002',
      employee: {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        department: 'Engineering'
      },
      amount: 89.99,
      currency: 'USD',
      merchant: 'Office Depot',
      date: '2025-10-02',
      category: 'Office Supplies',
      receipt: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300',
      description: 'Wireless mouse and keyboard for workstation',
      submittedAt: '2025-10-02T16:45:00Z',
      urgency: 'normal',
      tags: ['office-equipment'],
      status: 'pending'
    },
    {
      id: 'EXP-003',
      employee: {
        name: 'Emily Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        department: 'Sales'
      },
      amount: 450.00,
      currency: 'USD',
      merchant: 'Delta Airlines',
      date: '2025-10-01',
      category: 'Travel & Transportation',
      receipt: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300',
      description: 'Flight to client presentation in Chicago',
      submittedAt: '2025-10-01T09:15:00Z',
      urgency: 'high',
      tags: ['business-travel', 'client-visit'],
      status: 'pending'
    },
    {
      id: 'EXP-004',
      employee: {
        name: 'Alex Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        department: 'Marketing'
      },
      amount: 75.25,
      currency: 'USD',
      merchant: 'Uber',
      date: '2025-09-30',
      category: 'Travel & Transportation',
      receipt: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300',
      description: 'Transportation to conference venue',
      submittedAt: '2025-09-30T18:20:00Z',
      urgency: 'normal',
      tags: ['conference', 'transportation'],
      status: 'pending'
    }
  ];

  // Mock team data
  const teamData = {
    totalExpenses: 156,
    totalAmount: 45750.25,
    thisMonth: 23450.75,
    avgPerEmployee: 2875.50,
    topSpenders: [
      {
        id: 'sarah-johnson',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        totalAmount: 3250.75,
        expenseCount: 12
      },
      {
        id: 'mike-chen',
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        totalAmount: 2890.50,
        expenseCount: 8
      },
      {
        id: 'emily-davis',
        name: 'Emily Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        totalAmount: 2650.25,
        expenseCount: 15
      }
    ]
  };

  // Filter expenses based on current filters
  const filteredExpenses = mockExpenses?.filter(expense => {
    if (filters?.employee && !expense?.employee?.name?.toLowerCase()?.includes(filters?.employee?.toLowerCase())) {
      return false;
    }
    if (filters?.category && expense?.category !== filters?.category) {
      return false;
    }
    if (filters?.urgency && expense?.urgency !== filters?.urgency) {
      return false;
    }
    if (filters?.status !== 'all' && expense?.status !== filters?.status) {
      return false;
    }
    if (filters?.amountMin && expense?.amount < parseFloat(filters?.amountMin)) {
      return false;
    }
    if (filters?.amountMax && expense?.amount > parseFloat(filters?.amountMax)) {
      return false;
    }
    return true;
  });

  // Handle expense selection
  const handleExpenseSelect = (expenseId) => {
    setSelectedExpenses(prev => 
      prev?.includes(expenseId) 
        ? prev?.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    setSelectedExpenses(filteredExpenses?.map(expense => expense?.id));
  };

  // Handle deselect all
  const handleDeselectAll = () => {
    setSelectedExpenses([]);
  };

  // Handle approval modal
  const handleApprovalAction = (expense, type) => {
    setApprovalModal({ isOpen: true, expense, type });
  };

  // Handle approval confirmation
  const handleApprovalConfirm = async (approvalData) => {
    console.log('Approval data:', approvalData);
    // Here you would typically make an API call to process the approval
    
    // Remove from selected expenses if it was selected
    setSelectedExpenses(prev => prev?.filter(id => id !== approvalData?.expenseId));
    
    // Show success notification (you could add a toast notification here)
    alert(`Expense ${approvalData?.type === 'approve' ? 'approved' : 'rejected'} successfully!`);
  };

  // Handle bulk actions
  const handleBulkApprove = () => {
    if (selectedExpenses?.length === 0) return;
    
    // For demo purposes, just show an alert
    alert(`${selectedExpenses?.length} expenses approved successfully!`);
    setSelectedExpenses([]);
  };

  const handleBulkReject = () => {
    if (selectedExpenses?.length === 0) return;
    
    // For demo purposes, just show an alert
    alert(`${selectedExpenses?.length} expenses rejected successfully!`);
    setSelectedExpenses([]);
  };

  // Handle navigation
  const handleLogout = () => {
    navigate('/');
  };

  const handleQuickAction = (action) => {
    if (action?.id === 'quick-add') {
      navigate('/add-expense');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e?.ctrlKey || e?.metaKey) {
        switch (e?.key) {
          case 'a':
            e?.preventDefault();
            if (selectedExpenses?.length > 0) {
              handleBulkApprove();
            }
            break;
          case 'r':
            e?.preventDefault();
            if (selectedExpenses?.length > 0) {
              handleBulkReject();
            }
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedExpenses]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigationBar
        user={currentUser}
        notificationCount={queueStats?.urgent}
        onLogout={handleLogout}
      />
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Manager Approval Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Review and approve team expense submissions
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/manager/reports')}
                  iconName="BarChart3"
                  iconPosition="left"
                  iconSize={16}
                >
                  View Reports
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/team')}
                  iconName="Users"
                  iconPosition="left"
                  iconSize={16}
                >
                  Manage Team
                </Button>
              </div>
            </div>
          </div>

          {/* Pending Queue Stats */}
          <PendingQueueStats stats={queueStats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter Panel */}
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={() => setFilters({
                  employee: '',
                  dateRange: 'all',
                  category: '',
                  amountMin: '',
                  amountMax: '',
                  urgency: '',
                  status: 'pending'
                })}
                employeeOptions={employeeOptions}
              />

              {/* Bulk Action Bar */}
              <BulkActionBar
                selectedCount={selectedExpenses?.length}
                totalCount={filteredExpenses?.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
                onBulkExport={() => alert('Export functionality would be implemented here')}
                isAllSelected={selectedExpenses?.length === filteredExpenses?.length && filteredExpenses?.length > 0}
              />

              {/* Expense Cards Grid */}
              <div className="space-y-4">
                {filteredExpenses?.length === 0 ? (
                  <div className="text-center py-12 bg-card border border-border rounded-lg">
                    <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No expenses found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters to see more results
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setFilters({
                        employee: '',
                        dateRange: 'all',
                        category: '',
                        amountMin: '',
                        amountMax: '',
                        urgency: '',
                        status: 'pending'
                      })}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  filteredExpenses?.map((expense) => (
                    <ExpenseCard
                      key={expense?.id}
                      expense={expense}
                      isSelected={selectedExpenses?.includes(expense?.id)}
                      onSelect={() => handleExpenseSelect(expense?.id)}
                      onApprove={() => handleApprovalAction(expense, 'approve')}
                      onReject={() => handleApprovalAction(expense, 'reject')}
                      onViewDetails={() => alert(`View details for ${expense?.id} would be implemented here`)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TeamExpenseOverview
                teamData={teamData}
                recentExpenses={mockExpenses?.slice(0, 3)}
                onViewAllExpenses={() => navigate('/team-expenses')}
              />
            </div>
          </div>
        </div>
      </main>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        user={currentUser}
        notificationCount={queueStats?.urgent}
        onQuickAction={handleQuickAction}
      />
      {/* Approval Modal */}
      <ApprovalModal
        isOpen={approvalModal?.isOpen}
        onClose={() => setApprovalModal({ isOpen: false, expense: null, type: 'approve' })}
        onConfirm={handleApprovalConfirm}
        expense={approvalModal?.expense}
        type={approvalModal?.type}
      />
    </div>
  );
};

export default ManagerApprovalDashboard;