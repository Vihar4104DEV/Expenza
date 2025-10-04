import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TopNavigationBar from '../../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../../components/ui/MobileBottomNavigation';
import { useToastContext } from '../../components/shared/ToastProvider';
import expenseService from '../../services/expenseService';
import { getSupportedCurrencies } from '../../utils/currency';

const EditExpensePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'INR',
    category: '',
    merchant: '',
    date: '',
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

  useEffect(() => {
    // Simulate fetching expense data
    setTimeout(() => {
      const mockExpense = {
        id: id,
        amount: '125.50',
        currency: 'INR',
        category: 'meals',
        merchant: 'Starbucks Coffee',
        date: '2025-10-01',
        description: 'Client meeting coffee and breakfast',
        status: 'pending'
      };
      
      setFormData(mockExpense);
      setLoading(false);
    }, 500);
  }, [id]);

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
      toast.success('Expense updated successfully!');
      navigate(`/expense/${id}`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading expense...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={3} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(`/expense/${id}`)}
              iconName="ArrowLeft"
              iconPosition="left"
              className="mb-4"
            >
              Back to Details
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
            <p className="text-gray-600 mt-2">Update your expense details</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Form Fields */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    Changes will be saved and the expense will remain in pending status for approval.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/expense/${id}`)}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <MobileBottomNavigation user={currentUser} notificationCount={3} />
    </div>
  );
};

export default EditExpensePage;
