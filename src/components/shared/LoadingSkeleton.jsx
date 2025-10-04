import React from 'react';
import { cn } from '../../utils/cn';

const LoadingSkeleton = ({ 
  variant = 'text', // 'text' | 'card' | 'table' | 'circle' | 'rectangle'
  count = 1,
  className 
}) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded';

  const variants = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    table: 'h-12 w-full',
    circle: 'h-12 w-12 rounded-full',
    rectangle: 'h-24 w-full'
  };

  const skeletonClass = cn(baseClass, variants[variant], className);

  if (count === 1) {
    return <div className={skeletonClass} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} />
      ))}
    </div>
  );
};

// Specific skeleton components
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-300 rounded animate-pulse" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
