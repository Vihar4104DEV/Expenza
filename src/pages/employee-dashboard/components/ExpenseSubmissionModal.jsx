import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useToastContext } from '../../../components/shared/ToastProvider';
import expenseService from '../../../services/expenseService';

const ExpenseSubmissionModal = ({ isOpen, onClose, onSubmit }) => {
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState('ocr');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    category: '',
    description: '',
    currency: 'USD'
  });
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);

  const categoryOptions = [
    { value: 'Travel', label: 'Travel' },
    { value: 'Food', label: 'Food' },
    { value: 'Accommodation', label: 'Accommodation' },
    { value: 'Office', label: 'Office' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Other', label: 'Other' }
  ];

  const currencyOptions = [
    { value: 'INR', label: ' Indian Rupee' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' }
  ];

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = e?.dataTransfer?.files;
    if (files && files?.[0]) {
      handleFileUpload(files?.[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file?.type?.match(/image\/(jpeg|jpg|png|bmp|tiff)|application\/pdf/)) {
      setErrors({ file: 'Please upload a JPG, PNG, BMP, TIFF, or PDF file' });
      toast.error('Invalid file type. Please upload an image or PDF.');
      return;
    }

    if (file?.size > 10 * 1024 * 1024) {
      setErrors({ file: 'File size must be less than 10MB' });
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setErrors({});

    try {
      // Call OCR API
      const response = await expenseService.uploadReceiptOCR(file, {
        category: formData.category || undefined,
        description: formData.description || undefined
      });

      if (response.success && response.data) {
        const { expense, ocr_result } = response.data;
        
        // Extract OCR data
        const extractedData = {
          amount: expense.amount || ocr_result?.extracted_data?.total_amount || '',
          date: expense.expense_date || ocr_result?.extracted_data?.date || '',
          category: expense.category || formData.category || 'Other',
          currency: expense.original_currency || ocr_result?.extracted_data?.currency || 'USD',
          confidence: ocr_result?.confidence_score || 0,
          merchantName: expense.ocr_merchant_name || ocr_result?.extracted_data?.merchant_name || ''
        };
        
        setOcrData(extractedData);
        setFormData(prev => ({
          ...prev,
          ...extractedData,
          description: expense.description || prev.description
        }));
        
        toast.success(`Receipt processed! Confidence: ${Math.round(extractedData.confidence * 100)}%`);
      } else {
        throw new Error(response.message || 'OCR processing failed');
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.error(error.message || 'Failed to process receipt. Please enter details manually.');
      setActiveTab('manual'); // Switch to manual entry
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.amount || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    if (!formData?.date) {
      newErrors.date = 'Please select a date';
    }
    if (!formData?.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (validateForm()) {
      const submissionData = {
        ...formData,
        file: uploadedFile,
        ocrData: ocrData,
        submittedAt: new Date()?.toISOString()
      };
      
      onSubmit(submissionData);
      onClose();
      
      // Reset form
      setFormData({
        amount: '',
        date: '',
        category: '',
        description: '',
        currency: 'USD'
      });
      setUploadedFile(null);
      setOcrData(null);
      setActiveTab('ocr');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Submit New Expense</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('ocr')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${
                  activeTab === 'ocr' ?'border-primary text-primary' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon name="Camera" size={16} />
                  <span>OCR Upload</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${
                  activeTab === 'manual' ?'border-primary text-primary' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon name="Edit" size={16} />
                  <span>Manual Entry</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'ocr' && (
              <div className="space-y-6">
                {/* File Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-150 ${
                    dragActive
                      ? 'border-primary bg-primary/5' :'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => e?.target?.files?.[0] && handleFileUpload(e?.target?.files?.[0])}
                    className="hidden"
                  />
                  
                  {isProcessing ? (
                    <div className="space-y-4">
                      <Icon name="Loader2" size={48} className="text-primary mx-auto animate-spin" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Processing Receipt...</p>
                        <p className="text-sm text-gray-500">Extracting data using OCR technology</p>
                      </div>
                    </div>
                  ) : uploadedFile ? (
                    <div className="space-y-4">
                      <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Receipt Uploaded Successfully</p>
                        <p className="text-sm text-gray-500">{uploadedFile?.name}</p>
                        {ocrData && (
                          <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800 mb-2">
                              OCR Confidence: {Math.round(ocrData?.confidence * 100)}%
                            </p>
                            <div className="text-sm text-green-700 space-y-1">
                              <p>Amount: {ocrData?.currency} {ocrData?.amount}</p>
                              {ocrData?.merchantName && <p>Merchant: {ocrData?.merchantName}</p>}
                              <p>Date: {ocrData?.date}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Icon name="Upload" size={48} className="text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Upload Receipt</p>
                        <p className="text-sm text-gray-500">
                          Drag and drop your receipt here, or click to browse
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Supports JPG, PNG, PDF (max 10MB)
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef?.current?.click()}
                        iconName="Upload"
                        iconPosition="left"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>

                {errors?.file && (
                  <p className="text-sm text-red-600">{errors?.file}</p>
                )}
              </div>
            )}

            {/* Form Fields (shown for both tabs) */}
            {(activeTab === 'manual' || (activeTab === 'ocr' && ocrData)) && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData?.amount}
                    onChange={(e) => handleInputChange('amount', e?.target?.value)}
                    error={errors?.amount}
                    required
                  />
                  
                  <Select
                    label="Currency"
                    options={currencyOptions}
                    value={formData?.currency}
                    onChange={(value) => handleInputChange('currency', value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date"
                    type="date"
                    value={formData?.date}
                    onChange={(e) => handleInputChange('date', e?.target?.value)}
                    error={errors?.date}
                    required
                  />
                  
                  <Select
                    label="Category"
                    options={categoryOptions}
                    value={formData?.category}
                    onChange={(value) => handleInputChange('category', value)}
                    error={errors?.category}
                    required
                    placeholder="Select category"
                  />
                </div>

                <Input
                  label="Description"
                  type="text"
                  placeholder="Enter expense description (e.g., Taxi fare for client meeting)"
                  value={formData?.description}
                  onChange={(e) => handleInputChange('description', e?.target?.value)}
                  error={errors?.description}
                  required
                />
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={activeTab === 'ocr' && !ocrData}
              iconName="Send"
              iconPosition="left"
            >
              Submit Expense
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSubmissionModal;