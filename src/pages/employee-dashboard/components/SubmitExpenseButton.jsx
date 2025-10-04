import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SubmitExpenseButton = ({ onClick = () => {} }) => {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 lg:p-8 border border-blue-100">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Icon name="Plus" size={32} color="white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Submit New Expense
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Upload receipts with OCR scanning or manually enter expense details for quick approval processing
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={onClick}
            iconName="Receipt"
            iconPosition="left"
            className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Submit Expense
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitExpenseButton;