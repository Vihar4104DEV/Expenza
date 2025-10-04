import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const TeamExpenseOverview = ({
  teamData = {
    totalExpenses: 156,
    totalAmount: 45750.25,
    thisMonth: 23450.75,
    avgPerEmployee: 2875.50,
    topSpenders: []
  },
  recentExpenses = [],
  onViewAllExpenses = () => {},
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })?.format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-warning bg-warning/10',
      approved: 'text-success bg-success/10',
      rejected: 'text-error bg-error/10'
    };
    return colors?.[status] || colors?.pending;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'recent', label: 'Recent', icon: 'Clock' },
    { id: 'top-spenders', label: 'Top Spenders', icon: 'TrendingUp' }
  ];

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Team Expenses</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAllExpenses}
          iconName="ExternalLink"
          iconPosition="right"
          iconSize={14}
        >
          View All
        </Button>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`
              flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === tab?.id
                ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {teamData?.totalExpenses}
                </p>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(teamData?.totalAmount)}
                </p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(teamData?.thisMonth)}
                </p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
              <div className="text-center p-3 bg-success/5 rounded-lg">
                <p className="text-lg font-semibold text-success">
                  {formatCurrency(teamData?.avgPerEmployee)}
                </p>
                <p className="text-sm text-muted-foreground">Avg/Employee</p>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Approval Rate</span>
                <span className="text-success font-medium">87%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg Processing Time</span>
                <span className="text-foreground font-medium">2.3 days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Policy Compliance</span>
                <span className="text-success font-medium">94%</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="space-y-3">
            {recentExpenses?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Receipt" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent expenses</p>
              </div>
            ) : (
              recentExpenses?.slice(0, 5)?.map((expense) => (
                <div key={expense?.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="User" size={14} color="white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {expense?.employee?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expense?.merchant} • {formatCurrency(expense?.amount)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${getStatusColor(expense?.status)}
                    `}>
                      {expense?.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'top-spenders' && (
          <div className="space-y-3">
            {teamData?.topSpenders?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="TrendingUp" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No spending data available</p>
              </div>
            ) : (
              teamData?.topSpenders?.map((spender, index) => (
                <div key={spender?.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${index === 0 ? 'bg-warning text-warning-foreground' :
                        index === 1 ? 'bg-muted text-muted-foreground' :
                        index === 2 ? 'bg-warning/30 text-warning': 'bg-muted/50 text-muted-foreground'}
                    `}>
                      {index + 1}
                    </span>
                    {spender?.avatar ? (
                      <Image
                        src={spender?.avatar}
                        alt={spender?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="User" size={14} color="white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {spender?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {spender?.expenseCount} expenses
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(spender?.totalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamExpenseOverview;