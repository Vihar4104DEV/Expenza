import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const MonthlyInsightsPanel = ({ insights = {} }) => {
  const mockMonthlyData = [
    { month: 'Aug', amount: 1250 },
    { month: 'Sep', amount: 1890 },
    { month: 'Oct', amount: 2100 },
    { month: 'Nov', amount: 1650 },
    { month: 'Dec', amount: 2300 },
    { month: 'Jan', amount: 1950 }
  ];

  const mockCategoryData = [
    { name: 'Travel', value: 2500, color: '#2563EB' },
    { name: 'Meals', value: 1200, color: '#10B981' },
    { name: 'Office Supplies', value: 800, color: '#F59E0B' },
    { name: 'Transportation', value: 600, color: '#EF4444' },
    { name: 'Lodging', value: 1100, color: '#8B5CF6' }
  ];

  const monthlyData = insights?.monthlyData || mockMonthlyData;
  const categoryData = insights?.categoryData || mockCategoryData;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    })?.format(amount);
  };

  const totalSpending = categoryData?.reduce((sum, item) => sum + item?.value, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label}: ${formatAmount(payload?.[0]?.value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      const percentage = ((data?.value / totalSpending) * 100)?.toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data?.name}</p>
          <p className="text-sm text-gray-600">{formatAmount(data?.value)} ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Monthly Spending Trends */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Spending Trends</h3>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Icon name="TrendingUp" size={16} />
            <span>Last 6 months</span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="#2563EB" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Average: {formatAmount(monthlyData?.reduce((sum, item) => sum + item?.amount, 0) / monthlyData?.length)}
          </div>
          <div className="text-gray-600">
            Total: {formatAmount(monthlyData?.reduce((sum, item) => sum + item?.amount, 0))}
          </div>
        </div>
      </div>
      {/* Category Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Icon name="PieChart" size={16} />
            <span>Current month</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-48 h-48 mb-4 lg:mb-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 lg:ml-6">
            <div className="space-y-3">
              {categoryData?.map((category, index) => {
                const percentage = ((category?.value / totalSpending) * 100)?.toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{category?.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatAmount(category?.value)}
                      </div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Spending</span>
                <span className="text-lg font-bold text-gray-900">{formatAmount(totalSpending)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyInsightsPanel;