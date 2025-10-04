import React from 'react';
import Icon from '../../../components/AppIcon';

const PendingQueueStats = ({ 
  stats = {
    totalPending: 12,
    urgent: 3,
    thisWeek: 8,
    teamTotal: 45
  },
  className = '' 
}) => {
  const statCards = [
    {
      id: 'pending',
      label: 'Pending Approvals',
      value: stats?.totalPending,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: '+2 from yesterday'
    },
    {
      id: 'urgent',
      label: 'Urgent Reviews',
      value: stats?.urgent,
      icon: 'AlertTriangle',
      color: 'text-error',
      bgColor: 'bg-error/10',
      trend: 'Requires immediate attention'
    },
    {
      id: 'thisWeek',
      label: 'This Week',
      value: stats?.thisWeek,
      icon: 'Calendar',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '67% of total pending'
    },
    {
      id: 'teamTotal',
      label: 'Team Total',
      value: stats?.teamTotal,
      icon: 'Users',
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: 'All time submissions'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
      {statCards?.map((stat) => (
        <div
          key={stat?.id}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            {stat?.id === 'urgent' && stat?.value > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
                <span className="text-xs text-error font-medium">URGENT</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-foreground">{stat?.value}</span>
              {stat?.id === 'pending' && stat?.value > 10 && (
                <Icon name="TrendingUp" size={16} className="text-warning" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground">{stat?.label}</p>
            <p className="text-xs text-muted-foreground">{stat?.trend}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingQueueStats;