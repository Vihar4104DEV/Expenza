import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import TopNavigationBar from '../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';
import { formatCurrency } from '../utils/formatters';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get current user from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        name: user.name,
        email: user.email,
        role: user.role?.toLowerCase() || 'manager',
        department: user.company?.name || 'Department',
        teamSize: 4,
        employee_id: user.employee_id
      };
    }
    return {
      name: 'Manager User',
      email: 'manager@company.com',
      role: 'manager',
      department: 'Department',
      teamSize: 4
    };
  };

  const currentUser = getUserData();

  const handleLogout = () => {
    navigate('/');
  };

  // Mock data - Manager sees only their team's data (Engineering)
  const monthlyData = [
    { month: 'Jan', amount: 12500, count: 45 },
    { month: 'Feb', amount: 15200, count: 52 },
    { month: 'Mar', amount: 13800, count: 48 },
    { month: 'Apr', amount: 16500, count: 58 },
    { month: 'May', amount: 14200, count: 51 },
    { month: 'Jun', amount: 17800, count: 62 }
  ];

  const categoryData = [
    { name: 'Travel', value: 35000, color: '#2563EB' },
    { name: 'Meals', value: 18000, color: '#10B981' },
    { name: 'Office Supplies', value: 12000, color: '#F59E0B' },
    { name: 'Transportation', value: 8500, color: '#EF4444' },
    { name: 'Lodging', value: 15500, color: '#8B5CF6' }
  ];

  // Top spenders - Only Engineering team members
  const topSpenders = [
    { name: 'Mike Chen', amount: 10800, count: 38, department: 'Engineering' },
    { name: 'Alex Rodriguez', amount: 8500, count: 35, department: 'Engineering' },
    { name: 'Lisa Wang', amount: 7800, count: 28, department: 'Engineering' },
    { name: 'John Smith', amount: 6500, count: 25, department: 'Engineering' }
  ];

  const stats = [
    {
      title: 'Team Total Expenses',
      value: '$34,600',
      change: '+12.5%',
      icon: 'DollarSign',
      color: 'blue'
    },
    {
      title: 'Team Members',
      value: '4',
      change: 'Active',
      icon: 'Users',
      color: 'green'
    },
    {
      title: 'Total Transactions',
      value: '126',
      change: '+8.1%',
      icon: 'Receipt',
      color: 'purple'
    },
    {
      title: 'Pending Approvals',
      value: '8',
      change: 'This week',
      icon: 'Clock',
      color: 'yellow'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={5} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Team Reports & Analytics</h1>
                <p className="text-gray-600 mt-2">Track and analyze your Engineering team's expense trends</p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisQuarter">This Quarter</option>
                  <option value="thisYear">This Year</option>
                </select>
                <Button
                  variant="default"
                  iconName="Download"
                  iconPosition="left"
                >
                  Export Report
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon name={stat.icon} size={24} className={`text-${stat.color}-600`} />
                  </div>
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expense Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value, 'INR')} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} name="Amount" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value, 'INR')} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Count Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10B981" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Spenders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Team Member Expenses</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/team-expenses')}>View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Transactions</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {topSpenders.map((spender, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{spender.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{spender.department}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-gray-900">{spender.count}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(spender.amount, 'INR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNavigation user={currentUser} notificationCount={5} />
    </div>
  );
};

export default ReportsPage;
