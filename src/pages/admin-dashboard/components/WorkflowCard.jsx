import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WorkflowCard = ({ 
  workflow, 
  onEdit, 
  onView, 
  onToggle, 
  onDuplicate, 
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false);

  const getWorkflowTypeIcon = (type) => {
    const icons = {
      sequential: 'ArrowRight',
      percentage: 'Percent',
      specific: 'User',
      hybrid: 'Shuffle'
    };
    return icons?.[type] || 'Settings';
  };

  const getWorkflowTypeColor = (type) => {
    const colors = {
      sequential: 'text-primary bg-primary/10',
      percentage: 'text-success bg-success/10',
      specific: 'text-warning bg-warning/10',
      hybrid: 'text-secondary bg-secondary/10'
    };
    return colors?.[type] || 'text-muted-foreground bg-muted';
  };

  const getWorkflowTypeName = (type) => {
    const names = {
      sequential: 'Sequential',
      percentage: 'Percentage',
      specific: 'Specific Approver',
      hybrid: 'Hybrid'
    };
    return names?.[type] || 'Unknown';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-semibold text-foreground">{workflow?.name}</h4>
            <div className="flex items-center space-x-2">
              {/* Workflow Type Badge */}
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWorkflowTypeColor(workflow?.type)}`}>
                <Icon name={getWorkflowTypeIcon(workflow?.type)} size={12} className="mr-1" />
                {getWorkflowTypeName(workflow?.type)}
              </div>
              
              {/* Status Badge */}
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                workflow?.isActive 
                  ? 'bg-success/10 text-success' :'bg-muted text-muted-foreground'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  workflow?.isActive ? 'bg-success' : 'bg-muted-foreground'
                }`}></div>
                {workflow?.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{workflow?.description}</p>
        </div>
        
        {/* Actions Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            iconName="MoreHorizontal"
            onClick={() => setShowActions(!showActions)}
          />
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-10 animate-in slide-in-from-top">
              <div className="py-1">
                <button
                  onClick={() => {
                    onView();
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  <Icon name="Eye" size={16} className="mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onEdit();
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit Workflow
                </button>
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  <Icon name="Copy" size={16} className="mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    onToggle();
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-150"
                >
                  <Icon name={workflow?.isActive ? "Pause" : "Play"} size={16} className="mr-2" />
                  {workflow?.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <div className="border-t border-border my-1"></div>
                <button
                  onClick={() => {
                    onDelete();
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors duration-150"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Rules Summary */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-foreground mb-2">Rules</h5>
        <div className="flex flex-wrap gap-2">
          {workflow?.rules?.maxAmount && (
            <div className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
              <Icon name="DollarSign" size={12} className="mr-1" />
              Max: {formatCurrency(workflow?.rules?.maxAmount, workflow?.rules?.currency)}
            </div>
          )}
          {workflow?.rules?.minAmount && (
            <div className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
              <Icon name="DollarSign" size={12} className="mr-1" />
              Min: {formatCurrency(workflow?.rules?.minAmount, workflow?.rules?.currency)}
            </div>
          )}
          <div className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
            <Icon name="Tag" size={12} className="mr-1" />
            {workflow?.rules?.categories?.length === 1 && workflow?.rules?.categories?.[0] === 'all' ?'All Categories' 
              : `${workflow?.rules?.categories?.length} Categories`}
          </div>
        </div>
      </div>
      {/* Approval Steps Preview */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-foreground mb-2">Approval Steps</h5>
        <div className="flex items-center space-x-2 overflow-x-auto">
          {workflow?.steps?.map((step, index) => (
            <React.Fragment key={step?.id}>
              <div className="flex-shrink-0 flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg">
                <Icon 
                  name={step?.type === 'manager' ? 'User' : 
                        step?.type === 'finance' ? 'Calculator' :
                        step?.type === 'auto' ? 'Zap' : 'Users'} 
                  size={14} 
                  className="text-muted-foreground" 
                />
                <span className="text-xs text-foreground whitespace-nowrap">{step?.name}</span>
              </div>
              {index < workflow?.steps?.length - 1 && (
                <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{workflow?.stats?.totalProcessed}</div>
          <div className="text-xs text-muted-foreground">Processed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{workflow?.stats?.averageTime}</div>
          <div className="text-xs text-muted-foreground">Avg Time</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-success">{workflow?.stats?.approvalRate}%</div>
          <div className="text-xs text-muted-foreground">Approval Rate</div>
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
        <span>Created: {formatDate(workflow?.createdAt)}</span>
        <span>Updated: {formatDate(workflow?.updatedAt)}</span>
      </div>
    </div>
  );
};

export default WorkflowCard;