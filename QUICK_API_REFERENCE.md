# Quick API Reference - Copy & Paste Ready

## Import Services
```javascript
import { authService, userService, expenseService, companyService, approvalService } from './services';
```

## Common Patterns

### 1. Login Flow
```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await authService.login({ email, password });
    if (response.status === 1) {
      // User data stored in localStorage automatically
      navigate('/dashboard');
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 2. Load Expenses
```javascript
const loadExpenses = async () => {
  setIsLoading(true);
  try {
    const response = await expenseService.getExpenses({
      page: 1,
      pageSize: 50,
      status: 'Pending'
    });
    const expenses = response?.results || [];
    setExpenses(expenses);
  } catch (error) {
    toast.error('Failed to load expenses');
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Create Expense
```javascript
const createExpense = async (formData) => {
  try {
    const response = await expenseService.createExpense({
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      receiptImage: formData.file // Optional
    });
    
    if (response.status === 1) {
      toast.success('Expense created successfully!');
      loadExpenses(); // Refresh list
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 4. Approve/Reject Expense
```javascript
const handleApproval = async (expenseId, decision, comments) => {
  try {
    const response = await expenseService.approveRejectExpense(expenseId, {
      decision, // 'Approved' or 'Rejected'
      comments
    });
    
    if (response.status === 1) {
      toast.success(`Expense ${decision.toLowerCase()}!`);
      loadPendingApprovals();
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 5. Get Current User
```javascript
useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const response = await userService.getCurrentUser();
      if (response.status === 1) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user');
    }
  };
  
  fetchCurrentUser();
}, []);
```

### 6. Get Pending Approvals (Manager)
```javascript
const loadPendingApprovals = async () => {
  try {
    const response = await approvalService.getPendingApprovals();
    const pending = response?.results || response?.data || [];
    setPendingApprovals(pending);
  } catch (error) {
    toast.error('Failed to load approvals');
  }
};
```

### 7. Create User (Admin)
```javascript
const createUser = async (userData) => {
  try {
    const response = await userService.createUser({
      name: userData.name,
      email: userData.email,
      role: userData.role, // 'Employee', 'Manager', 'Admin'
      password: userData.password,
      department: userData.department,
      managerId: userData.managerId // Required for Employee
    });
    
    if (response.status === 1) {
      toast.success('User created successfully!');
      loadUsers();
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 8. Get Approval Dashboard
```javascript
const loadDashboard = async () => {
  try {
    const response = await approvalService.getApprovalDashboard();
    if (response.status === 1) {
      setDashboardData(response.data);
      // response.data includes:
      // - pending_approvals
      // - statistics
      // - recent_approvals
      // - team_expenses
    }
  } catch (error) {
    console.error('Failed to load dashboard');
  }
};
```

### 9. Upload Receipt with OCR
```javascript
const handleReceiptUpload = async (file) => {
  setIsProcessing(true);
  try {
    const response = await expenseService.uploadReceiptOCR(file, {
      category: 'Travel', // Optional
      description: 'Business expense' // Optional
    });
    
    if (response.success && response.data) {
      const { expense, ocr_result } = response.data;
      // Pre-fill form with OCR data
      setFormData({
        amount: expense.amount,
        date: expense.expense_date,
        category: expense.category,
        currency: expense.original_currency
      });
      toast.success('Receipt processed successfully!');
    }
  } catch (error) {
    toast.error('Failed to process receipt');
  } finally {
    setIsProcessing(false);
  }
};
```

### 10. Get Company Statistics (Admin)
```javascript
const loadCompanyStats = async (companyId) => {
  try {
    const response = await companyService.getCompanyStatistics(companyId);
    if (response.status === 1) {
      setStats(response.data);
      // response.data includes:
      // - total_users
      // - total_expenses
      // - pending_approvals
      // - etc.
    }
  } catch (error) {
    console.error('Failed to load statistics');
  }
};
```

## Response Handling Pattern

```javascript
// Standard pattern for all API calls
const apiCall = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await someService.someMethod(params);
    
    // Check status
    if (response.status === 1) {
      // Success
      setData(response.data);
      toast.success(response.message);
    } else {
      // API returned error
      setError(response.message);
      toast.error(response.message);
    }
  } catch (error) {
    // Network or other error
    setError(error.message);
    toast.error(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

## Pagination Handling

```javascript
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const pageSize = 10;

const loadData = async (page) => {
  const response = await expenseService.getExpenses({
    page,
    pageSize
  });
  
  // DRF pagination format
  const data = response?.results || [];
  const count = response?.count || 0;
  
  setData(data);
  setTotalPages(Math.ceil(count / pageSize));
  setCurrentPage(page);
};

// Next page
const handleNextPage = () => {
  if (currentPage < totalPages) {
    loadData(currentPage + 1);
  }
};

// Previous page
const handlePrevPage = () => {
  if (currentPage > 1) {
    loadData(currentPage - 1);
  }
};
```

## Filter & Search Pattern

```javascript
const [filters, setFilters] = useState({
  status: '',
  category: '',
  search: ''
});

const loadFilteredExpenses = async () => {
  const params = {
    page: 1,
    pageSize: 50
  };
  
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.search) params.search = filters.search;
  
  const response = await expenseService.getExpenses(params);
  setExpenses(response?.results || []);
};

// Call when filters change
useEffect(() => {
  loadFilteredExpenses();
}, [filters]);
```

## Error Boundary Pattern

```javascript
const SafeComponent = () => {
  const [error, setError] = useState(null);
  
  if (error) {
    return (
      <div className="error-state">
        <p>Something went wrong: {error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }
  
  return <YourComponent onError={setError} />;
};
```

## Authentication Check

```javascript
// In protected routes
useEffect(() => {
  if (!authService.isAuthenticated()) {
    navigate('/login');
  }
}, []);

// Get user role
const userRole = authService.getUserRole(); // 'employee', 'manager', 'admin'

// Get current user data
const currentUser = authService.getCurrentUser();
```

## File Upload Pattern

```javascript
const handleFileUpload = async (file) => {
  // Validate file
  if (!file.type.match(/image\/(jpeg|jpg|png|pdf)/)) {
    toast.error('Invalid file type');
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    toast.error('File too large (max 10MB)');
    return;
  }
  
  // Upload
  const formData = {
    amount: 100,
    currency: 'USD',
    category: 'Travel',
    description: 'Business expense',
    date: '2025-01-15',
    receiptImage: file
  };
  
  await expenseService.createExpense(formData);
};
```

## Bulk Operations

```javascript
const bulkApprove = async (expenseIds) => {
  try {
    const response = await approvalService.bulkApproveExpenses({
      expenseIds,
      decision: 'Approved',
      comments: 'Bulk approval'
    });
    
    if (response.status === 1) {
      toast.success(`${expenseIds.length} expenses approved!`);
      loadExpenses();
    }
  } catch (error) {
    toast.error('Bulk approval failed');
  }
};
```

## Real-time Updates Pattern

```javascript
// Poll for updates every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    loadPendingApprovals();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

## Quick Wins for Hackathon

1. **Connect Dashboard Stats**: Use `getApprovalDashboard()` for manager dashboard
2. **Real Expense List**: Replace mock data with `getExpenses()`
3. **Working Approvals**: Use `approveRejectExpense()` for approval flow
4. **User Management**: Use `getUsers()` and `createUser()` for admin panel
5. **OCR Integration**: Use `uploadReceiptOCR()` for receipt scanning

All services are ready - just import and use! 🚀
