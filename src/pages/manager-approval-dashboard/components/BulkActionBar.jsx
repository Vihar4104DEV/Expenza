import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionBar = ({
  selectedCount = 0,
  totalCount = 0,
  onSelectAll = () => {},
  onDeselectAll = () => {},
  onBulkApprove = () => {},
  onBulkReject = () => {},
  onBulkExport = () => {},
  isAllSelected = false,
  className = ''
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className={`
      flex items-center justify-between p-4 bg-muted/50 border border-border rounded-lg mb-4
      transition-all duration-200
      ${hasSelection ? 'bg-primary/5 border-primary/20' : ''}
      ${className}
    `}>
      {/* Selection Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={isAllSelected ? onDeselectAll : onSelectAll}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm font-medium text-foreground">
            {hasSelection ? (
              `${selectedCount} of ${totalCount} selected`
            ) : (
              `Select all ${totalCount} expenses`
            )}
          </span>
        </div>

        {hasSelection && (
          <div className="flex items-center space-x-1 text-primary">
            <Icon name="CheckCircle" size={16} />
            <span className="text-sm font-medium">
              {selectedCount} expense{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center space-x-2">
        {hasSelection ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkExport}
              iconName="Download"
              iconPosition="left"
              iconSize={14}
            >
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkReject}
              iconName="X"
              iconPosition="left"
              iconSize={14}
              className="text-error border-error hover:bg-error hover:text-error-foreground"
            >
              Reject ({selectedCount})
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={onBulkApprove}
              iconName="Check"
              iconPosition="left"
              iconSize={14}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              Approve ({selectedCount})
            </Button>
          </>
        ) : (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Info" size={16} />
            <span className="text-sm">
              Select expenses to perform bulk actions
            </span>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      {hasSelection && (
        <div className="hidden lg:flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
              A
            </kbd>
            <span>Approve</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
              R
            </kbd>
            <span>Reject</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionBar;