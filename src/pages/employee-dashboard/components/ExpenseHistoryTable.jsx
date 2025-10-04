import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExpenseHistoryTable = ({ 
  expenses = [], 
  onExpenseClick = () => {},
  onFilterChange = () => {},
  currentFilter = 'all',
  isLoading = false
}) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const displayExpenses = expenses || [];

  const getStatusBadge = (status) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status?.toLowerCase();
    
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
      approved: { color: 'bg-green-100 text-green-800', icon: 'CheckCircle' },
      rejected: { color: 'bg-red-100 text-red-800', icon: 'XCircle' },
      'in-progress': { color: 'bg-blue-100 text-blue-800', icon: 'RefreshCw' }
    };

    const config = statusConfig?.[normalizedStatus] || statusConfig?.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={12} className="mr-1" />
        {status}
      </span>
    );
  };

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedExpenses = [...displayExpenses]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    // Handle expense_date field from backend
    if (sortField === 'date') {
      aValue = new Date(a?.expense_date || a?.date);
      bValue = new Date(b?.expense_date || b?.date);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredExpenses = sortedExpenses?.filter(expense => {
    if (currentFilter === 'all') return true;
    // Case-insensitive status comparison
    return expense?.status?.toLowerCase() === currentFilter?.toLowerCase();
  });

  const totalPages = Math.ceil(filteredExpenses?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses?.slice(startIndex, startIndex + itemsPerPage);

  const filterOptions = [
    { value: 'all', label: 'All Expenses', count: displayExpenses?.length },
    { value: 'pending', label: 'Pending', count: displayExpenses?.filter(e => e?.status?.toLowerCase() === 'pending')?.length },
    { value: 'approved', label: 'Approved', count: displayExpenses?.filter(e => e?.status?.toLowerCase() === 'approved')?.length },
    { value: 'rejected', label: 'Rejected', count: displayExpenses?.filter(e => e?.status?.toLowerCase() === 'rejected')?.length },
    { value: 'in-progress', label: 'In Progress', count: displayExpenses?.filter(e => e?.status?.toLowerCase() === 'in-progress')?.length }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Expense History</h3>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filterOptions?.map((option) => (
              <button
                key={option?.value}
                onClick={() => {
                  onFilterChange(option?.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  currentFilter === option?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option?.label} ({option?.count})
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary mx-auto animate-spin mb-4" />
            <p className="text-gray-600">Loading expenses...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  <span>Date</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('merchant')}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  <span>Merchant</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  <span>Amount</span>
                  <Icon name="ArrowUpDown" size={12} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedExpenses?.map((expense) => (
              <tr
                key={expense?.id}
                onClick={() => onExpenseClick(expense)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(expense?.expense_date || expense?.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{expense?.description || expense?.merchant || expense?.employee_name || 'Expense'}</div>
                  <div className="text-sm text-gray-500">{expense?.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatAmount(expense?.amount, expense?.original_currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense?.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(expense?.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Eye"
                    iconPosition="left"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onExpenseClick(expense);
                    }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {paginatedExpenses?.map((expense) => (
          <div
            key={expense?.id}
            onClick={() => onExpenseClick(expense)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-900">{expense?.description || expense?.merchant || expense?.employee_name || 'Expense'}</div>
              {getStatusBadge(expense?.status)}
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold text-gray-900">
                {formatAmount(expense?.amount, expense?.original_currency)}
              </div>
              <div className="text-sm text-gray-500">{formatDate(expense?.expense_date || expense?.date)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">{expense?.category}</div>
              <div className="text-sm text-gray-500">{expense?.id}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredExpenses?.length)} of {filteredExpenses?.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                iconName="ChevronLeft"
                iconPosition="left"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                iconName="ChevronRight"
                iconPosition="right"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Empty State */}
      {!isLoading && filteredExpenses?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Receipt" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-500 mb-4">
            {currentFilter === 'all' ? "You haven't submitted any expenses yet." 
              : `No ${currentFilter} expenses found.`}
          </p>
          {currentFilter !== 'all' && (
            <Button
              variant="outline"
              onClick={() => onFilterChange('all')}
            >
              View All Expenses
            </Button>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ExpenseHistoryTable;