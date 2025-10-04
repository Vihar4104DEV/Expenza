import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const WorkflowModal = ({ isOpen, onClose, workflow, mode = 'create', onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'sequential',
    isActive: true,
    rules: {
      minAmount: '',
      maxAmount: '',
      currency: 'USD',
      categories: []
    },
    steps: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workflow && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: workflow?.name,
        description: workflow?.description,
        type: workflow?.type,
        isActive: workflow?.isActive,
        rules: {
          minAmount: workflow?.rules?.minAmount || '',
          maxAmount: workflow?.rules?.maxAmount || '',
          currency: workflow?.rules?.currency || 'USD',
          categories: workflow?.rules?.categories || []
        },
        steps: workflow?.steps || []
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        type: 'sequential',
        isActive: true,
        rules: {
          minAmount: '',
          maxAmount: '',
          currency: 'USD',
          categories: []
        },
        steps: []
      });
    }
    setErrors({});
  }, [workflow, mode, isOpen]);

  const workflowTypeOptions = [
    { value: 'sequential', label: 'Sequential Approval' },
    { value: 'percentage', label: 'Percentage-based' },
    { value: 'specific', label: 'Specific Approver' },
    { value: 'hybrid', label: 'Hybrid Workflow' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'meals', label: 'Meals & Entertainment' },
    { value: 'travel', label: 'Travel' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'supplies', label: 'Office Supplies' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'training', label: 'Training & Development' },
    { value: 'emergency', label: 'Emergency Expenses' }
  ];

  const handleInputChange = (field, value) => {
    if (field?.includes('.')) {
      const [parent, child] = field?.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev?.[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Workflow name is required';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData?.rules?.minAmount && formData?.rules?.maxAmount) {
      if (parseFloat(formData?.rules?.minAmount) >= parseFloat(formData?.rules?.maxAmount)) {
        newErrors['rules.maxAmount'] = 'Maximum amount must be greater than minimum amount';
      }
    }

    if (formData?.steps?.length === 0) {
      newErrors.steps = 'At least one approval step is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (mode === 'view') return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const workflowData = {
        ...formData,
        id: workflow?.id || Date.now(),
        createdAt: workflow?.createdAt || new Date()?.toISOString()?.split('T')?.[0],
        updatedAt: new Date()?.toISOString()?.split('T')?.[0],
        stats: workflow?.stats || {
          totalProcessed: 0,
          averageTime: "0 days",
          approvalRate: 0
        }
      };
      
      onSave(workflowData);
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addApprovalStep = () => {
    const newStep = {
      id: Date.now(),
      type: 'manager',
      name: 'New Approval Step',
      required: true,
      autoApprove: false
    };
    
    setFormData(prev => ({
      ...prev,
      steps: [...prev?.steps, newStep]
    }));
  };

  const removeApprovalStep = (stepId) => {
    setFormData(prev => ({
      ...prev,
      steps: prev?.steps?.filter(step => step?.id !== stepId)
    }));
  };

  const updateApprovalStep = (stepId, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev?.steps?.map(step => 
        step?.id === stepId ? { ...step, [field]: value } : step
      )
    }));
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Create New Workflow';
      case 'edit': return 'Edit Workflow';
      case 'view': return 'Workflow Details';
      default: return 'Workflow';
    }
  };

  const isReadOnly = mode === 'view';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Settings" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{getModalTitle()}</h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'create' ? 'Configure a new approval workflow' : 
                 mode === 'edit' ? 'Modify workflow settings' : 
                 'View workflow configuration'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
            disabled={isSubmitting}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  label="Workflow Name"
                  type="text"
                  placeholder="Enter workflow name"
                  value={formData?.name}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  error={errors?.name}
                  required
                  disabled={isReadOnly || isSubmitting}
                />
                
                <Select
                  label="Workflow Type"
                  options={workflowTypeOptions}
                  value={formData?.type}
                  onChange={(value) => handleInputChange('type', value)}
                  error={errors?.type}
                  required
                  disabled={isReadOnly || isSubmitting}
                />
              </div>

              <Input
                label="Description"
                type="text"
                placeholder="Describe when this workflow should be used"
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                error={errors?.description}
                required
                disabled={isReadOnly || isSubmitting}
              />
            </div>

            {/* Rules Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Rules & Conditions</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Input
                  label="Minimum Amount"
                  type="number"
                  placeholder="0.00"
                  value={formData?.rules?.minAmount}
                  onChange={(e) => handleInputChange('rules.minAmount', e?.target?.value)}
                  error={errors?.['rules.minAmount']}
                  disabled={isReadOnly || isSubmitting}
                />
                
                <Input
                  label="Maximum Amount"
                  type="number"
                  placeholder="1000.00"
                  value={formData?.rules?.maxAmount}
                  onChange={(e) => handleInputChange('rules.maxAmount', e?.target?.value)}
                  error={errors?.['rules.maxAmount']}
                  disabled={isReadOnly || isSubmitting}
                />
                
                <Select
                  label="Currency"
                  options={currencyOptions}
                  value={formData?.rules?.currency}
                  onChange={(value) => handleInputChange('rules.currency', value)}
                  disabled={isReadOnly || isSubmitting}
                />
              </div>

              <Select
                label="Applicable Categories"
                options={categoryOptions}
                value={formData?.rules?.categories}
                onChange={(value) => handleInputChange('rules.categories', value)}
                multiple
                searchable
                placeholder="Select categories"
                description="Choose which expense categories this workflow applies to"
                disabled={isReadOnly || isSubmitting}
              />
            </div>

            {/* Approval Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">Approval Steps</h3>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={addApprovalStep}
                    disabled={isSubmitting}
                  >
                    Add Step
                  </Button>
                )}
              </div>

              {formData?.steps?.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <Icon name="Settings" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No approval steps configured</p>
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      iconName="Plus"
                      iconPosition="left"
                      onClick={addApprovalStep}
                      className="mt-2"
                      disabled={isSubmitting}
                    >
                      Add First Step
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {formData?.steps?.map((step, index) => (
                    <div key={step?.id} className="bg-muted/30 border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium text-foreground">Step {index + 1}</span>
                        </div>
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            iconName="Trash2"
                            onClick={() => removeApprovalStep(step?.id)}
                            disabled={isSubmitting}
                          />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Input
                          label="Step Name"
                          type="text"
                          placeholder="Enter step name"
                          value={step?.name}
                          onChange={(e) => updateApprovalStep(step?.id, 'name', e?.target?.value)}
                          disabled={isReadOnly || isSubmitting}
                        />
                        
                        <Select
                          label="Approver Type"
                          options={[
                            { value: 'manager', label: 'Direct Manager' },
                            { value: 'department_head', label: 'Department Head' },
                            { value: 'finance', label: 'Finance Team' },
                            { value: 'admin', label: 'Administrator' },
                            { value: 'auto', label: 'Auto-Approval' }
                          ]}
                          value={step?.type}
                          onChange={(value) => updateApprovalStep(step?.id, 'type', value)}
                          disabled={isReadOnly || isSubmitting}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors?.steps && (
                <p className="text-sm text-error">{errors?.steps}</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button
              variant="default"
              onClick={handleSubmit}
              loading={isSubmitting}
              iconName="Save"
              iconPosition="left"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Workflow' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowModal;