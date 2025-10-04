import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';

const ApprovalModal = ({
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
  expense = null,
  type = 'approve', // 'approve' or 'reject'
  className = ''
}) => {
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvalReasons = [
    { value: 'policy-compliant', label: 'Policy Compliant' },
    { value: 'valid-business', label: 'Valid Business Expense' },
    { value: 'proper-documentation', label: 'Proper Documentation' },
    { value: 'within-budget', label: 'Within Budget Limits' },
    { value: 'pre-approved', label: 'Pre-approved Expense' }
  ];

  const rejectionReasons = [
    { value: 'policy-violation', label: 'Policy Violation' },
    { value: 'insufficient-documentation', label: 'Insufficient Documentation' },
    { value: 'duplicate-expense', label: 'Duplicate Expense' },
    { value: 'exceeds-limit', label: 'Exceeds Spending Limit' },
    { value: 'personal-expense', label: 'Personal Expense' },
    { value: 'missing-receipt', label: 'Missing Receipt' },
    { value: 'invalid-merchant', label: 'Invalid Merchant' },
    { value: 'other', label: 'Other (specify in comments)' }
  ];

  const reasonOptions = type === 'approve' ? approvalReasons : rejectionReasons;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        expenseId: expense?.id,
        type,
        reason,
        comments: comments?.trim(),
        timestamp: new Date()?.toISOString()
      });
      handleClose();
    } catch (error) {
      console.error('Error processing approval:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComments('');
    setReason('');
    setIsSubmitting(false);
    onClose();
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })?.format(amount);
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`
        bg-popover border border-border rounded-lg shadow-lg w-full max-w-md
        animate-in scale-in
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className={`
              p-2 rounded-lg
              ${type === 'approve' ? 'bg-success/10' : 'bg-error/10'}
            `}>
              <Icon 
                name={type === 'approve' ? 'Check' : 'X'} 
                size={20} 
                className={type === 'approve' ? 'text-success' : 'text-error'} 
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-popover-foreground">
                {type === 'approve' ? 'Approve Expense' : 'Reject Expense'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {expense?.id} • {expense?.employee?.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            iconName="X"
            iconSize={16}
          />
        </div>

        {/* Expense Summary */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-lg font-semibold text-popover-foreground">
              {formatCurrency(expense?.amount, expense?.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Merchant</span>
            <span className="text-sm text-popover-foreground">{expense?.merchant}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Category</span>
            <span className="text-sm text-popover-foreground">{expense?.category}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Select
            label={`${type === 'approve' ? 'Approval' : 'Rejection'} Reason`}
            options={reasonOptions}
            value={reason}
            onChange={setReason}
            required
            error={!reason ? 'Please select a reason' : ''}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-popover-foreground">
              Comments {type === 'reject' ? '(Required)' : '(Optional)'}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e?.target?.value)}
              placeholder={`Add ${type === 'approve' ? 'approval' : 'rejection'} comments...`}
              required={type === 'reject'}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {comments?.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={type === 'approve' ? 'default' : 'destructive'}
              disabled={!reason || isSubmitting || (type === 'reject' && !comments?.trim())}
              loading={isSubmitting}
              className={`flex-1 ${
                type === 'approve' ?'bg-success hover:bg-success/90 text-success-foreground' :''
              }`}
            >
              {type === 'approve' ? 'Approve Expense' : 'Reject Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalModal;