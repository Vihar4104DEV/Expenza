# Backend Data Mapping - Fixed

## Issue Resolved
The frontend was not displaying expenses because it was looking for `response.data.expenses` but the backend returns Django REST Framework's paginated response with `response.results`.

## Changes Made

### 1. Employee Dashboard (`src/pages/employee-dashboard/index.jsx`)
**Fixed:** `loadExpenses()` function now handles DRF paginated response:
```javascript
// Before: response.data.expenses
// After: response?.results || response?.data?.expenses || []
```

**Added fields mapped from backend:**
- `employee_name` - Direct from backend
- `amount_display` - Backend formatted amount with currency
- `original_currency` - Currency code (INR, USD, etc.)
- `expense_date` - Date of expense
- `status` - Pending, Approved, Rejected, In-Progress
- `created_at` - Timestamp

### 2. Expense Service (`src/services/expenseService.js`)
**Updated all endpoints to use:** `/expenses/expenses/` prefix
- ✅ GET `/expenses/expenses/` - List expenses
- ✅ POST `/expenses/expenses/` - Create expense
- ✅ GET `/expenses/expenses/{id}/` - Get expense detail
- ✅ PATCH `/expenses/expenses/{id}/` - Update expense
- ✅ DELETE `/expenses/expenses/{id}/` - Delete expense
- ✅ GET `/expenses/expenses/{id}/track/` - Track expense
- ✅ POST `/expenses/expenses/ocr/upload/` - OCR upload

**Fixed:** `getExpenseStats()` to handle DRF response

### 3. API Configuration (`src/services/api.js`)
**Added:** `ngrok-skip-browser-warning: '69420'` header for ngrok tunnels

## Backend Response Format

### List Expenses Response
```json
{
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": "uuid",
            "employee_name": "Testing Normal User",
            "amount": "5007.00",
            "original_currency": "INR",
            "converted_amount": "5007.00",
            "amount_display": "5007.00 INR",
            "category": "Travel",
            "expense_date": "2025-10-03",
            "status": "Pending",
            "created_at": "2025-10-04T10:19:03.332546Z"
        }
    ]
}
```

### Create Expense Request
```json
{
    "amount": 5000.00,
    "original_currency": "INR",
    "category": "Travel",
    "description": "Taxi fare for client meeting",
    "expense_date": "2025-01-15"
}
```

## Testing Checklist

### ✅ Expense List
1. Navigate to employee dashboard
2. Check if expenses load from API
3. Verify all fields display correctly:
   - Amount with currency
   - Category
   - Date
   - Status badge
   - Description

### ✅ Expense Creation
1. Click "Submit New Expense"
2. Fill in form:
   - Amount: 5000
   - Currency: INR
   - Category: Travel
   - Description: Test expense
   - Date: Today
3. Submit and verify:
   - Success toast appears
   - Expense list refreshes
   - New expense appears in list

### ✅ Status Filtering
1. Check filter buttons work:
   - All Expenses
   - Pending
   - Approved
   - Rejected
   - In Progress

### ✅ OCR Upload (if configured)
1. Click OCR tab in submission modal
2. Upload receipt image
3. Verify extracted data populates form

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/expenses/expenses/?page=1&page_size=50` | List expenses |
| POST | `/expenses/expenses/` | Create expense |
| GET | `/expenses/expenses/{id}/` | Get expense detail |
| PATCH | `/expenses/expenses/{id}/` | Update expense |
| DELETE | `/expenses/expenses/{id}/` | Delete expense |
| GET | `/expenses/expenses/{id}/track/` | Track approval |
| POST | `/expenses/expenses/ocr/upload/` | OCR processing |

## Environment Variables
```env
VITE_API_BASE_URL=https://ed715e1b04a4.ngrok-free.app/api
```

## Notes
- Default currency changed from INR to USD in forms (can be changed back if needed)
- Status comparison is now case-insensitive
- Expense table shows `description` field instead of `merchant` (which doesn't exist in backend)
- All API calls include `ngrok-skip-browser-warning` header
