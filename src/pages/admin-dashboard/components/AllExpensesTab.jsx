import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AllExpensesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  const mockExpenses = [
    {
      id: 1,
      title: "Client Dinner - Q4 Planning",
      employee: {
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        department: "Marketing"
      },
      amount: 245.50,
      currency: "USD",
      category: "meals",
      status: "pending",
      submittedDate: "2025-10-03T14:30:00Z",
      receiptUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
      description: "Dinner meeting with potential client to discuss Q4 marketing strategy and budget allocation.",
      merchant: "The Capital Grille",
      approvalWorkflow: "Standard Employee Workflow",
      currentApprover: "Michael Chen"
    },
    {
      id: 2,
      title: "Conference Registration - TechSummit 2025",
      employee: {
        name: "Emily Rodriguez",
        email: "emily.rodriguez@company.com",
        department: "Engineering"
      },
      amount: 1250.00,
      currency: "USD",
      category: "training",
      status: "approved",
      submittedDate: "2025-09-28T09:15:00Z",
      approvedDate: "2025-09-30T16:45:00Z",
      receiptUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
      description: "Annual technology conference registration including workshops and networking events.",
      merchant: "TechSummit Events",
      approvalWorkflow: "High-Value Expense Workflow",
      approver: "Alex Thompson"
    },
    {
      id: 3,
      title: "Office Supplies - Q4 Inventory",
      employee: {
        name: "Michael Chen",
        email: "michael.chen@company.com",
        department: "Marketing"
      },
      amount: 89.99,
      currency: "USD",
      category: "supplies",
      status: "rejected",
      submittedDate: "2025-10-01T11:20:00Z",
      rejectedDate: "2025-10-02T14:30:00Z",
      receiptUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
      description: "Bulk purchase of office supplies including paper, pens, and organizational materials.",
      merchant: "Office Depot",
      approvalWorkflow: "Standard Employee Workflow",
      rejectionReason: "Duplicate purchase - similar order placed last week"
    },
    {
      id: 4,
      title: "Flight to Seattle - Client Meeting",
      employee: {
        name: "David Wilson",
        email: "david.wilson@company.com",
        department: "Sales"
      },
      amount: 425.75,
      currency: "USD",
      category: "travel",
      status: "in_review",
      submittedDate: "2025-10-04T08:45:00Z",
      receiptUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400",
      description: "Round-trip flight for important client presentation and contract negotiation.",
      merchant: "Delta Airlines",
      approvalWorkflow: "Travel Expense Workflow",
      currentApprover: "Sarah Martinez"
    },
    {
      id: 5,
      title: "Team Lunch - Project Celebration",
      employee: {
        name: "Alex Thompson",
        email: "alex.thompson@company.com",
        department: "Engineering"
      },
      amount: 156.80,
      currency: "USD",
      category: "meals",
      status: "approved",
      submittedDate: "2025-09-25T12:30:00Z",
      approvedDate: "2025-09-26T10:15:00Z",
      receiptUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
      description: "Team celebration lunch after successful project completion and client approval.",
      merchant: "Olive Garden",
      approvalWorkflow: "Standard Employee Workflow",
      approver: "David Wilson"
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'meals', label: 'Meals & Entertainment' },
    { value: 'travel', label: 'Travel' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'supplies', label: 'Office Supplies' },
    { value: 'training', label: 'Training & Development' },
    { value: 'equipment', label: 'Equipment' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const filteredExpenses = mockExpenses?.filter(expense => {
    const matchesSearch = expense?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         expense?.employee?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         expense?.merchant?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense?.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense?.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredExpenses?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses?.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedExpenses(paginatedExpenses?.map(expense => expense?.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleSelectExpense = (expenseId, checked) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, expenseId]);
    } else {
      setSelectedExpenses(selectedExpenses?.filter(id => id !== expenseId));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning/10 text-warning',
      in_review: 'bg-primary/10 text-primary',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-error/10 text-error'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'Clock',
      in_review: 'Eye',
      approved: 'CheckCircle',
      rejected: 'XCircle'
    };
    return icons?.[status] || 'Circle';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      meals: 'Utensils',
      travel: 'Plane',
      accommodation: 'Building',
      supplies: 'Package',
      training: 'GraduationCap',
      equipment: 'Monitor'
    };
    return icons?.[category] || 'Tag';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })?.format(amount);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} for expenses:`, selectedExpenses);
    setSelectedExpenses([]);
  };

  const handleAdminOverride = (expenseId, action) => {
    console.log(`Admin override ${action} for expense:`, expenseId);
  };

  const handleExport = () => {
    console.log('Exporting expenses:', filteredExpenses);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search expenses by title, employee, or merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            iconName="Filter"
            iconPosition="left"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>
        
        <div className="flex gap-2">
          {selectedExpenses?.length > 0 && (
            <>
              <Button
                variant="outline"
                iconName="CheckCircle"
                iconPosition="left"
                onClick={() => handleBulkAction('approve')}
              >
                Approve ({selectedExpenses?.length})
              </Button>
              <Button
                variant="outline"
                iconName="XCircle"
                iconPosition="left"
                onClick={() => handleBulkAction('reject')}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-4 animate-in slide-in-from-top">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Select
              label="Category"
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        </div>
      )}
      {/* Expenses Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="w-12 p-4">
                  <Checkbox
                    checked={selectedExpenses?.length === paginatedExpenses?.length && paginatedExpenses?.length > 0}
                    onChange={(e) => handleSelectAll(e?.target?.checked)}
                  />
                </th>
                <th className="text-left p-4 font-medium text-foreground">Expense</th>
                <th className="text-left p-4 font-medium text-foreground">Employee</th>
                <th className="text-left p-4 font-medium text-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-foreground">Category</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Date</th>
                <th className="text-right p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedExpenses?.map((expense) => (
                <tr key={expense?.id} className="hover:bg-muted/30 transition-colors duration-150">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedExpenses?.includes(expense?.id)}
                      onChange={(e) => handleSelectExpense(expense?.id, e?.target?.checked)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {expense?.receiptUrl ? (
                          <img 
                            src={expense?.receiptUrl} 
                            alt="Receipt" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="Receipt" size={16} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{expense?.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{expense?.merchant}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{expense?.employee?.name}</div>
                      <div className="text-sm text-muted-foreground">{expense?.employee?.department}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">
                      {formatCurrency(expense?.amount, expense?.currency)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name={getCategoryIcon(expense?.category)} size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground capitalize">
                        {expense?.category?.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense?.status)}`}>
                        <Icon name={getStatusIcon(expense?.status)} size={12} className="mr-1" />
                        {expense?.status?.replace('_', ' ')?.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {formatDate(expense?.submittedDate)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Eye"
                        onClick={() => console.log('View expense:', expense?.id)}
                      />
                      {expense?.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="CheckCircle"
                            onClick={() => handleAdminOverride(expense?.id, 'approve')}
                            className="text-success hover:text-success"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="XCircle"
                            onClick={() => handleAdminOverride(expense?.id, 'reject')}
                            className="text-error hover:text-error"
                          />
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="MoreHorizontal"
                        onClick={() => console.log('More actions:', expense?.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredExpenses?.length)} of {filteredExpenses?.length} expenses
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronLeft"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              />
              <span className="text-sm text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronRight"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              />
            </div>
          </div>
        )}
      </div>
      {/* Empty State */}
      {filteredExpenses?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No expenses found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ?'Try adjusting your search or filter criteria.' :'No expenses have been submitted yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AllExpensesTab;