import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import TopNavigationBar from '../components/ui/TopNavigationBar';
import MobileBottomNavigation from '../components/ui/MobileBottomNavigation';
import StatusBadge from '../components/shared/StatusBadge';
import CurrencyDisplay from '../components/shared/CurrencyDisplay';
import ApprovalTimeline from '../components/shared/ApprovalTimeline';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';
import { useToastContext } from '../components/shared/ToastProvider';
import { formatDate, formatRelativeTime } from '../utils/formatters';

const ExpenseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Get current user from localStorage
  const getUserData = () => {
    const role = localStorage.getItem('userRole') || 'employee';
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    return {
      name: role === 'admin' ? 'Admin User' : role === 'manager' ? 'Manager User' : 'Employee User',
      email: role === 'admin' ? 'admin@company.com' : role === 'manager' ? 'manager@company.com' : 'employee@company.com',
      role: role
    };
  };

  const currentUser = getUserData();

  const handleCancelExpense = async () => {
    setIsCancelling(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsCancelling(false);
      setShowCancelDialog(false);
      toast.success('Expense cancelled successfully');
      navigate('/expenses');
    }, 1000);
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setExpense(getMockExpense(id));
      setLoading(false);
    }, 500);
  }, [id]);

  const handleLogout = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading expense details...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Expense Not Found</h2>
          <p className="text-gray-600 mb-6">The expense you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigationBar user={currentUser} notificationCount={3} onLogout={handleLogout} />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              iconName="ArrowLeft"
              iconPosition="left"
              className="mb-4"
            >
              Back
            </Button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Expense Details
                </h1>
                <p className="text-gray-600">
                  Submitted {formatRelativeTime(expense.submittedAt)}
                </p>
              </div>
              <StatusBadge status={expense.status} size="lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Expense Information Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Expense Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Expense ID</span>
                    <span className="font-medium text-gray-900">{expense.id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Amount</span>
                    <CurrencyDisplay
                      amount={expense.amount}
                      currency={expense.currency}
                      convertedAmount={expense.convertedAmount}
                      companyCurrency={expense.companyCurrency}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">{expense.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-900">{formatDate(expense.date)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Merchant</span>
                    <span className="font-medium text-gray-900">{expense.merchant}</span>
                  </div>
                  
                  <div className="py-3">
                    <span className="text-gray-600 block mb-2">Description</span>
                    <p className="text-gray-900">{expense.description}</p>
                  </div>
                </div>
              </motion.div>

              {/* Receipt Card */}
              {expense.receipt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Receipt
                  </h2>
                  <div className="relative group cursor-pointer" onClick={() => setShowReceiptModal(true)}>
                    <img
                      src={expense.receipt}
                      alt="Receipt"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Icon name="ZoomIn" size={32} className="text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Click to view full size</span>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                    >
                      Download
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Approval Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <ApprovalTimeline
                  steps={expense.approvalSteps}
                  currentStep={expense.currentApprovalStep}
                />
              </motion.div>

              {/* Actions */}
              {expense.status === 'pending' && currentUser.role === 'employee' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      iconName="Edit"
                      iconPosition="left"
                      onClick={() => navigate(`/expense/${id}/edit`)}
                    >
                      Edit Expense
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      iconName="Trash2"
                      iconPosition="left"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancel Expense
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNavigation user={currentUser} notificationCount={3} />

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowReceiptModal(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100"
            >
              <Icon name="X" size={24} />
            </button>
            <img
              src={expense.receipt}
              alt="Receipt"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelExpense}
        title="Cancel Expense?"
        description="Are you sure you want to cancel this expense? This action cannot be undone."
        confirmLabel="Yes, Cancel Expense"
        cancelLabel="No, Keep It"
        variant="danger"
        icon="AlertTriangle"
        isLoading={isCancelling}
      />
    </div>
  );
};

// Mock data function
const getMockExpense = (id) => {
  return {
    id: id || 'EXP-001',
    amount: 125.50,
    currency: 'INR',
    convertedAmount: 10450.75,
    companyCurrency: 'INR',
    category: 'Meals & Entertainment',
    date: '2025-10-01',
    merchant: 'Starbucks Coffee',
    description: 'Client meeting coffee and breakfast discussion about Q4 strategy',
    submittedAt: '2025-10-01T10:30:00Z',
    status: 'pending',
    receipt: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    currentApprovalStep: 1,
    approvalSteps: [
      {
        title: 'Manager Approval',
        role: 'Manager',
        approver: 'David Wilson',
        status: 'completed',
        approvedAt: '2025-10-01T14:30:00Z',
        comment: 'Approved for business meeting'
      },
      {
        title: 'Finance Review',
        role: 'Finance',
        approver: 'Michael Chen',
        status: 'pending'
      },
      {
        title: 'Director Approval',
        role: 'Director',
        approver: 'Not assigned',
        status: 'pending'
      }
    ]
  };
};

export default ExpenseDetailPage;
