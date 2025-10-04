import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import AddUserModal from './AddUserModal';

const UsersTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const mockUsers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      role: "employee",
      department: "Marketing",
      manager: "Michael Chen",
      status: "active",
      lastLogin: "2025-10-03T14:30:00Z",
      joinDate: "2024-03-15"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@company.com",
      role: "manager",
      department: "Marketing",
      manager: "David Wilson",
      status: "active",
      lastLogin: "2025-10-04T09:15:00Z",
      joinDate: "2023-08-20"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@company.com",
      role: "employee",
      department: "Engineering",
      manager: "Alex Thompson",
      status: "active",
      lastLogin: "2025-10-04T11:45:00Z",
      joinDate: "2024-01-10"
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david.wilson@company.com",
      role: "admin",
      department: "Finance",
      manager: null,
      status: "active",
      lastLogin: "2025-10-04T08:00:00Z",
      joinDate: "2022-05-12"
    },
    {
      id: 5,
      name: "Alex Thompson",
      email: "alex.thompson@company.com",
      role: "manager",
      department: "Engineering",
      manager: "David Wilson",
      status: "inactive",
      lastLogin: "2025-09-28T16:20:00Z",
      joinDate: "2023-11-05"
    }
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Administrator' }
  ];

  const filteredUsers = mockUsers?.filter(user => {
    const matchesSearch = user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         user?.department?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesRole = roleFilter === 'all' || user?.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers?.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(paginatedUsers?.map(user => user?.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers?.filter(id => id !== userId));
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-error/10 text-error',
      manager: 'bg-warning/10 text-warning',
      employee: 'bg-primary/10 text-primary'
    };
    return colors?.[role] || 'bg-muted text-muted-foreground';
  };

  const getStatusColor = (status) => {
    return status === 'active' ?'bg-success/10 text-success' :'bg-muted text-muted-foreground';
  };

  const formatLastLogin = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date?.toLocaleDateString();
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} for users:`, selectedUsers);
    // Implement bulk actions
    setSelectedUsers([]);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search users by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={roleOptions}
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="Filter by role"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {selectedUsers?.length > 0 && (
            <>
              <Button
                variant="outline"
                iconName="UserCheck"
                iconPosition="left"
                onClick={() => handleBulkAction('activate')}
              >
                Activate ({selectedUsers?.length})
              </Button>
              <Button
                variant="outline"
                iconName="UserX"
                iconPosition="left"
                onClick={() => handleBulkAction('deactivate')}
              >
                Deactivate
              </Button>
            </>
          )}
          <Button
            variant="default"
            iconName="UserPlus"
            iconPosition="left"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            Add User
          </Button>
        </div>
      </div>
      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="w-12 p-4">
                  <Checkbox
                    checked={selectedUsers?.length === paginatedUsers?.length && paginatedUsers?.length > 0}
                    onChange={(e) => handleSelectAll(e?.target?.checked)}
                  />
                </th>
                <th className="text-left p-4 font-medium text-foreground">User</th>
                <th className="text-left p-4 font-medium text-foreground">Role</th>
                <th className="text-left p-4 font-medium text-foreground">Department</th>
                <th className="text-left p-4 font-medium text-foreground">Manager</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Last Login</th>
                <th className="text-right p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedUsers?.map((user) => (
                <tr key={user?.id} className="hover:bg-muted/30 transition-colors duration-150">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedUsers?.includes(user?.id)}
                      onChange={(e) => handleSelectUser(user?.id, e?.target?.checked)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                          {user?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{user?.name}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                      {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-foreground">{user?.department}</td>
                  <td className="p-4 text-foreground">{user?.manager || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user?.status)}`}>
                      {user?.status?.charAt(0)?.toUpperCase() + user?.status?.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {formatLastLogin(user?.lastLogin)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Edit"
                        onClick={() => console.log('Edit user:', user?.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="MoreHorizontal"
                        onClick={() => console.log('More actions:', user?.id)}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers?.length)} of {filteredUsers?.length} users
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
      {filteredUsers?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || roleFilter !== 'all' ?'Try adjusting your search or filter criteria.' :'Get started by adding your first user.'}
          </p>
          {(!searchTerm && roleFilter === 'all') && (
            <Button
              variant="default"
              iconName="UserPlus"
              iconPosition="left"
              onClick={() => setIsAddUserModalOpen(true)}
            >
              Add User
            </Button>
          )}
        </div>
      )}
      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={(user) => {
          console.log('User added:', user);
          setIsAddUserModalOpen(false);
        }}
      />
    </div>
  );
};

export default UsersTab;