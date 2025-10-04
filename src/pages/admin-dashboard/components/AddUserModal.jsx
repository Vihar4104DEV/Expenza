import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee',
    department: '',
    manager: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Administrator' }
  ];

  const departmentOptions = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'operations', label: 'Operations' }
  ];

  const managerOptions = [
    { value: 'michael.chen', label: 'Michael Chen (Marketing)' },
    { value: 'alex.thompson', label: 'Alex Thompson (Engineering)' },
    { value: 'david.wilson', label: 'David Wilson (Finance)' },
    { value: 'sarah.martinez', label: 'Sarah Martinez (HR)' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData?.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.department) {
      newErrors.department = 'Department is required';
    }

    if (formData?.role === 'employee' && !formData?.manager) {
      newErrors.manager = 'Manager is required for employees';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser = {
        id: Date.now(),
        name: `${formData?.firstName} ${formData?.lastName}`,
        email: formData?.email,
        role: formData?.role,
        department: departmentOptions?.find(d => d?.value === formData?.department)?.label,
        manager: formData?.manager ? managerOptions?.find(m => m?.value === formData?.manager)?.label : null,
        status: 'active',
        lastLogin: new Date()?.toISOString(),
        joinDate: new Date()?.toISOString()?.split('T')?.[0]
      };
      
      onUserAdded(newUser);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'employee',
        department: '',
        manager: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'employee',
        department: '',
        manager: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-0  bg-black/50">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="UserPlus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Add New User</h2>
              <p className="text-sm text-muted-foreground">Create a new user account</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={handleClose}
            disabled={isSubmitting}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                placeholder="Enter first name"
                value={formData?.firstName}
                onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                error={errors?.firstName}
                required
                disabled={isSubmitting}
              />
              
              <Input
                label="Last Name"
                type="text"
                placeholder="Enter last name"
                value={formData?.lastName}
                onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                error={errors?.lastName}
                required
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              error={errors?.email}
              description="This will be used for login and notifications"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Role & Department */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Role & Department</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Role"
                options={roleOptions}
                value={formData?.role}
                onChange={(value) => handleInputChange('role', value)}
                error={errors?.role}
                required
                disabled={isSubmitting}
              />
              
              <Select
                label="Department"
                options={departmentOptions}
                value={formData?.department}
                onChange={(value) => handleInputChange('department', value)}
                error={errors?.department}
                placeholder="Select department"
                required
                disabled={isSubmitting}
              />
            </div>

            {formData?.role === 'employee' && (
              <Select
                label="Manager"
                options={managerOptions}
                value={formData?.manager}
                onChange={(value) => handleInputChange('manager', value)}
                error={errors?.manager}
                placeholder="Select manager"
                description="Choose the direct manager for this employee"
                required
                disabled={isSubmitting}
              />
            )}
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Security</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                error={errors?.password}
                description="Minimum 8 characters"
                required
                disabled={isSubmitting}
              />
              
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                value={formData?.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
                error={errors?.confirmPassword}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            loading={isSubmitting}
            iconName="UserPlus"
            iconPosition="left"
          >
            {isSubmitting ? 'Creating User...' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;