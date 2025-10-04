import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStatsRow = ({ stats = {} }) => {
  const defaultStats = {
    submitted: { amount: 0, count: 0 },
    pending: { amount: 0, count: 0 },
    approved: { amount: 0, count: 0 },
    rejected: { amount: 0, count: 0 }
  };

  const currentStats = { ...defaultStats, ...stats };

  const statItems = [
    {
      key: 'submitted',
      label: 'Submitted',
      icon: 'FileText',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      key: 'pending',
      label: 'Pending',
      icon: 'Clock',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      key: 'approved',
      label: 'Approved',
      icon: 'CheckCircle',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      key: 'rejected',
      label: 'Rejected',
      icon: 'XCircle',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems?.map((item) => {
        const stat = currentStats?.[item?.key];
        return (
          <div
            key={item?.key}
            className={`${item?.bgColor} ${item?.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${item?.bgColor} p-2 rounded-lg`}>
                <Icon name={item?.icon} size={20} className={item?.color} />
              </div>
              <span className="text-sm font-medium text-gray-600">{item?.label}</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {formatAmount(stat?.amount)}
              </div>
              <div className="text-sm text-gray-500">
                {stat?.count} {stat?.count === 1 ? 'expense' : 'expenses'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStatsRow;