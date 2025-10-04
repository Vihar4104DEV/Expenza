import React from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';
import { format } from 'date-fns';

const ApprovalTimeline = ({ steps, currentStep, className }) => {
  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const getStepIcon = (step, status) => {
    if (step.status === 'rejected') return 'XCircle';
    if (status === 'completed') return 'CheckCircle';
    if (status === 'current') return 'Clock';
    return 'Circle';
  };

  const getStepColor = (step, status) => {
    if (step.status === 'rejected') return 'text-red-600';
    if (status === 'completed') return 'text-green-600';
    if (status === 'current') return 'text-yellow-600';
    return 'text-gray-400';
  };

  const getLineColor = (index) => {
    if (index < currentStep) return 'bg-green-600';
    return 'bg-gray-300';
  };

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Flow</h3>
      
      <div className="relative">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={index} className="relative pb-8 last:pb-0">
              {/* Connecting Line */}
              {!isLast && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 -ml-px">
                  <div className={cn('h-full', getLineColor(index))} />
                </div>
              )}

              {/* Step Content */}
              <div className="relative flex items-start space-x-4">
                {/* Icon */}
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  step.status === 'rejected' ? 'bg-red-100' :
                  status === 'completed' ? 'bg-green-100' :
                  status === 'current' ? 'bg-yellow-100' :
                  'bg-gray-100'
                )}>
                  <Icon
                    name={getStepIcon(step, status)}
                    size={16}
                    className={getStepColor(step, status)}
                  />
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {step.title || step.role}
                      </p>
                      {step.approver && (
                        <p className="text-sm text-gray-600">{step.approver}</p>
                      )}
                    </div>
                    {step.approvedAt && (
                      <p className="text-xs text-gray-500">
                        {format(new Date(step.approvedAt), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>

                  {/* Status Message */}
                  {status === 'completed' && step.comment && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-2">
                        <Icon name="MessageSquare" size={14} className="text-gray-500 mt-0.5" />
                        <p className="text-xs text-gray-700">{step.comment}</p>
                      </div>
                    </div>
                  )}

                  {status === 'current' && (
                    <p className="mt-1 text-xs text-yellow-700">
                      Waiting for approval...
                    </p>
                  )}

                  {step.status === 'rejected' && step.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start space-x-2">
                        <Icon name="AlertCircle" size={14} className="text-red-600 mt-0.5" />
                        <p className="text-xs text-red-700">{step.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalTimeline;
