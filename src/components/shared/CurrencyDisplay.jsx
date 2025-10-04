import React from 'react';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/formatters';

const CurrencyDisplay = ({ 
  amount, 
  currency = 'USD',
  convertedAmount,
  companyCurrency,
  showConverted = true,
  size = 'md',
  className 
}) => {
  const sizeConfig = {
    sm: {
      primary: 'text-sm',
      secondary: 'text-xs'
    },
    md: {
      primary: 'text-base',
      secondary: 'text-sm'
    },
    lg: {
      primary: 'text-lg',
      secondary: 'text-base'
    },
    xl: {
      primary: 'text-2xl',
      secondary: 'text-lg'
    }
  };

  const styles = sizeConfig[size];

  const showConversion = showConverted && 
    convertedAmount && 
    companyCurrency && 
    currency !== companyCurrency;

  return (
    <div className={cn('space-y-0.5', className)}>
      <div className={cn('font-semibold text-gray-900', styles.primary)}>
        {formatCurrency(amount, currency)}
      </div>
      {showConversion && (
        <div className={cn('text-gray-600', styles.secondary)}>
          {formatCurrency(convertedAmount, companyCurrency)}
          <span className="text-gray-500 ml-1">(Company Currency)</span>
        </div>
      )}
    </div>
  );
};

export default CurrencyDisplay;
