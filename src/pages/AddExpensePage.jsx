import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TopNavigationBar from '../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';
import { useToastContext } from '../components/shared/ToastProvider';
import expenseService from '../services/expenseService';
import { getSupportedCurrencies } from '../utils/currency';

const AddExpensePage = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('ocr'); // 'ocr' or 'manual'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'INR',
    category: '',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receipt: null
  });

  const [errors, setErrors] = useState({});

  const currentUser = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'employee'
  };

  const categories = expenseService.getCategories();

  const currencies = getSupportedCurrencies().map(curr => ({
    value: curr.code,
    label: `${curr.code} - ${curr.name}`
  }));

  const handleLogout = () => {
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setOcrProcessing(true);
      
      // Simulate OCR processing
      setTimeout(() => {
        // Mock OCR results
        setFormData(prev => ({
          ...prev,
          amount: '125.50',
          merchant: 'Starbucks Coffee',
          date: '2025-10-01',
          category: 'meals'
        }));
        setOcrProcessing(false);
      }, 2000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Expense submitted successfully!');
      navigate('/expenses');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={3} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              iconName="ArrowLeft"
              iconPosition="left"
              className="mb-4"
            >
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Submit New Expense</h1>
            <p className="text-gray-600 mt-2">Upload a receipt or enter details manually</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('ocr')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'ocr'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Camera" size={20} />
                  <span>Upload Receipt (OCR)</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'manual'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Edit" size={20} />
                  <span>Enter Manually</span>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* OCR Tab */}
            {activeTab === 'ocr' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Receipt</h2>
                
                {!uploadedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <Icon name="Upload" size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drag & drop receipt image
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: JPG, PNG, PDF (Max 10MB)
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon name="CheckCircle" size={24} className="text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Receipt uploaded successfully!</p>
                          <p className="text-sm text-green-700">{uploadedFile.name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          setFormData(prev => ({
                            ...prev,
                            amount: '',
                            merchant: '',
                            date: new Date().toISOString().split('T')[0],
                            category: ''
                          }));
                        }}
                        iconName="X"
                      />
                    </div>

                    {ocrProcessing && (
                      <div className="flex items-center justify-center space-x-3 p-6">
                        <Icon name="Loader2" size={24} className="animate-spin text-blue-600" />
                        <span className="text-gray-700">Scanning receipt...</span>
                      </div>
                    )}
                  </div>
                )}

                {uploadedFile && !ocrProcessing && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-900">
                        Auto-filled fields below. Please review and correct if needed.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Form Fields */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6"
            >
              <h2 className="text-lg font-semibold text-gray-900">Expense Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    error={errors.amount}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="currency"
                    value={formData.currency}
                    onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    options={currencies}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, category: value }));
                      if (errors.category) {
                        setErrors(prev => ({ ...prev, category: '' }));
                      }
                    }}
                    options={categories}
                    placeholder="Select category"
                    error={errors.category}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    error={errors.date}
                    disabled={isSubmitting}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Merchant */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant/Vendor
                  </label>
                  <Input
                    name="merchant"
                    placeholder="e.g., Starbucks, Delta Airlines"
                    value={formData.merchant}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Provide details about this expense..."
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length} / 500 characters (min 10)
                  </p>
                </div>
              </div>

              {/* Manual Receipt Upload */}
              {activeTab === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
                iconName={isSubmitting ? 'Loader2' : 'Check'}
                iconPosition="left"
                iconClassName={isSubmitting ? 'animate-spin' : ''}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Expense'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <MobileBottomNavigation user={currentUser} notificationCount={3} />
    </div>
  );
};

export default AddExpensePage;
