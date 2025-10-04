import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import WorkflowCard from './WorkflowCard';
import WorkflowModal from './WorkflowModal';

const ApprovalWorkflowsTab = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'

  const mockWorkflows = [
    {
      id: 1,
      name: "Standard Employee Workflow",
      type: "sequential",
      description: "Default approval workflow for employee expenses under $500",
      isActive: true,
      rules: {
        maxAmount: 500,
        currency: "INR",
        categories: ["meals", "travel", "supplies"]
      },
      steps: [
        {
          id: 1,
          type: "manager",
          name: "Direct Manager Approval",
          required: true,
          autoApprove: false
        },
        {
          id: 2,
          type: "finance",
          name: "Finance Review",
          required: true,
          autoApprove: false,
          condition: "amount > 200"
        }
      ],
      stats: {
        totalProcessed: 1247,
        averageTime: "2.3 days",
        approvalRate: 94
      },
      createdAt: "2024-01-15",
      updatedAt: "2025-09-20"
    },
    {
      id: 2,
      name: "High-Value Expense Workflow",
      type: "percentage",
      description: "Multi-level approval for expenses over $500",
      isActive: true,
      rules: {
        minAmount: 500,
        currency: "INR",
        categories: ["all"]
      },
      steps: [
        {
          id: 1,
          type: "manager",
          name: "Direct Manager",
          required: true,
          percentage: 100
        },
        {
          id: 2,
          type: "department_head",
          name: "Department Head",
          required: true,
          percentage: 100
        },
        {
          id: 3,
          type: "finance",
          name: "Finance Director",
          required: true,
          percentage: 100
        }
      ],
      stats: {
        totalProcessed: 342,
        averageTime: "4.1 days",
        approvalRate: 87
      },
      createdAt: "2024-02-10",
      updatedAt: "2025-08-15"
    },
    {
      id: 3,
      name: "Travel Expense Workflow",
      type: "specific",
      description: "Specialized workflow for travel-related expenses",
      isActive: true,
      rules: {
        maxAmount: 2000,
        currency: "INR",
        categories: ["travel", "accommodation", "meals"]
      },
      steps: [
        {
          id: 1,
          type: "manager",
          name: "Direct Manager",
          required: true,
          approver: "manager"
        },
        {
          id: 2,
          type: "travel_admin",
          name: "Travel Administrator",
          required: true,
          approver: "sarah.martinez@company.com"
        }
      ],
      stats: {
        totalProcessed: 856,
        averageTime: "1.8 days",
        approvalRate: 96
      },
      createdAt: "2024-03-05",
      updatedAt: "2025-10-01"
    },
    {
      id: 4,
      name: "Emergency Expense Workflow",
      type: "hybrid",
      description: "Fast-track approval for urgent business expenses",
      isActive: false,
      rules: {
        maxAmount: 1000,
        currency: "INR",
        categories: ["emergency", "urgent"]
      },
      steps: [
        {
          id: 1,
          type: "auto",
          name: "Auto-Approval",
          required: false,
          condition: "amount <= 100"
        },
        {
          id: 2,
          type: "manager",
          name: "Manager (Parallel)",
          required: true,
          parallel: true
        },
        {
          id: 3,
          type: "finance",
          name: "Finance (Parallel)",
          required: true,
          parallel: true
        }
      ],
      stats: {
        totalProcessed: 89,
        averageTime: "0.5 days",
        approvalRate: 98
      },
      createdAt: "2024-06-12",
      updatedAt: "2025-07-30"
    }
  ];

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleToggleWorkflow = (workflowId) => {
    console.log('Toggle workflow:', workflowId);
    // Implement workflow toggle logic
  };

  const handleDuplicateWorkflow = (workflow) => {
    console.log('Duplicate workflow:', workflow);
    // Implement workflow duplication logic
  };

  const handleDeleteWorkflow = (workflowId) => {
    console.log('Delete workflow:', workflowId);
    // Implement workflow deletion logic
  };

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
      sequential: 'text-primary',
      percentage: 'text-success',
      specific: 'text-warning',
      hybrid: 'text-secondary'
    };
    return colors?.[type] || 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Approval Workflows</h3>
          <p className="text-sm text-muted-foreground">
            Configure and manage expense approval workflows for your organization
          </p>
        </div>
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={handleCreateWorkflow}
        >
          Create Workflow
        </Button>
      </div>
      {/* Workflow Type Legend */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Workflow Types</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Icon name="ArrowRight" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Sequential</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Percent" size={16} className="text-success" />
            <span className="text-sm text-foreground">Percentage</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="User" size={16} className="text-warning" />
            <span className="text-sm text-foreground">Specific Approver</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Shuffle" size={16} className="text-secondary" />
            <span className="text-sm text-foreground">Hybrid</span>
          </div>
        </div>
      </div>
      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockWorkflows?.map((workflow) => (
          <WorkflowCard
            key={workflow?.id}
            workflow={workflow}
            onEdit={() => handleEditWorkflow(workflow)}
            onView={() => handleViewWorkflow(workflow)}
            onToggle={() => handleToggleWorkflow(workflow?.id)}
            onDuplicate={() => handleDuplicateWorkflow(workflow)}
            onDelete={() => handleDeleteWorkflow(workflow?.id)}
          />
        ))}
      </div>
      {/* Empty State */}
      {mockWorkflows?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Settings" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No workflows configured</h3>
          <p className="text-muted-foreground mb-4">
            Create your first approval workflow to start managing expense approvals.
          </p>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={handleCreateWorkflow}
          >
            Create Workflow
          </Button>
        </div>
      )}
      {/* Workflow Modal */}
      <WorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workflow={selectedWorkflow}
        mode={modalMode}
        onSave={(workflow) => {
          console.log('Workflow saved:', workflow);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default ApprovalWorkflowsTab;