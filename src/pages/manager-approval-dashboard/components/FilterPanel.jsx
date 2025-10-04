import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterPanel = ({
  filters = {
    employee: '',
    dateRange: 'all',
    category: '',
    amountMin: '',
    amountMax: '',
    urgency: '',
    status: 'pending'
  },
  onFiltersChange = () => {},
  onClearFilters = () => {},
  employeeOptions = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'meals', label: 'Meals & Entertainment' },
    { value: 'travel', label: 'Travel & Transportation' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'software', label: 'Software & Subscriptions' },
    { value: 'marketing', label: 'Marketing & Advertising' },
    { value: 'training', label: 'Training & Development' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High Priority' },
    { value: 'normal', label: 'Normal' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All Statuses' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters)?.filter(([key, value]) => {
      if (key === 'status' && value === 'pending') return false; // Default status
      if (key === 'dateRange' && value === 'all') return false; // Default date range
      return value && value !== '';
    })?.length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-muted-foreground" />
          <h3 className="font-medium text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
              iconSize={14}
            >
              Clear
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            iconSize={16}
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Employee"
            options={[
              { value: '', label: 'All Employees' },
              ...employeeOptions
            ]}
            value={filters?.employee}
            onChange={(value) => handleFilterChange('employee', value)}
            searchable
          />
          
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={filters?.dateRange}
            onChange={(value) => handleFilterChange('dateRange', value)}
          />
          
          <Select
            label="Status"
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => handleFilterChange('status', value)}
          />
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select
                label="Category"
                options={categoryOptions}
                value={filters?.category}
                onChange={(value) => handleFilterChange('category', value)}
              />
              
              <Select
                label="Priority"
                options={urgencyOptions}
                value={filters?.urgency}
                onChange={(value) => handleFilterChange('urgency', value)}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Amount Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min amount"
                    value={filters?.amountMin}
                    onChange={(e) => handleFilterChange('amountMin', e?.target?.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max amount"
                    value={filters?.amountMax}
                    onChange={(e) => handleFilterChange('amountMax', e?.target?.value)}
                  />
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters?.dateRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="From Date"
                  value={filters?.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
                />
                <Input
                  type="date"
                  label="To Date"
                  value={filters?.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;