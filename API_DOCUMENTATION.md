# Expense Management System API Documentation

## Overview
This API provides comprehensive endpoints for managing expenses, approvals, workflows, and user management in a multi-tenant expense management system.

## Base URL
```
http://localhost:8000/api/v1/
```

## Authentication
All endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Companies API (`/companies/`)

#### List Companies
- **GET** `/companies/`
- **Description**: Get all companies (filtered by user's company)
- **Response**: List of companies with basic information

#### Create Company
- **POST** `/companies/`
- **Description**: Create a new company
- **Body**:
```json
{
  "name": "Company Name",
  "country": "United States",
  "default_currency": "USD"
}
```

#### Create Company with Admin
- **POST** `/companies/create_with_admin/`
- **Description**: Create a company with its first admin user
- **Body**:
```json
{
  "company": {
    "name": "Company Name",
    "country": "United States",
    "default_currency": "USD"
  },
  "admin": {
    "name": "Admin Name",
    "email": "admin@company.com",
    "password": "password123",
    "password_confirm": "password123",
    "employee_id": "EMP001"
  }
}
```

#### Get Company Statistics
- **GET** `/companies/{id}/statistics/`
- **Description**: Get statistics for a company

#### Get Company Users
- **GET** `/companies/{id}/users/`
- **Query Parameters**:
  - `role`: Filter by user role (Admin, Manager, Employee)

### 2. Users API (`/users/`)

#### List Users
- **GET** `/users/`
- **Description**: Get users based on permissions
- **Query Parameters**:
  - `role`: Filter by role
  - `department`: Filter by department
  - `is_manager_approver`: Filter by manager approver status

#### Create User
- **POST** `/users/`
- **Description**: Create a new user
- **Body**:
```json
{
  "company": "company_id",
  "name": "User Name",
  "email": "user@company.com",
  "password": "password123",
  "password_confirm": "password123",
  "employee_id": "EMP002",
  "role": "Employee",
  "manager": "manager_id",
  "is_manager_approver": false
}
```

#### Get Current User
- **GET** `/users/me/`
- **Description**: Get current user details

#### Change Password
- **PUT** `/users/change_password/`
- **Body**:
```json
{
  "old_password": "old_password",
  "new_password": "new_password",
  "new_password_confirm": "new_password"
}
```

#### Get Subordinates
- **GET** `/users/subordinates/`
- **Description**: Get user's subordinates (for managers)

#### Get Team Expenses
- **GET** `/users/team_expenses/`
- **Description**: Get team expenses (for managers)

#### Get Pending Approvals
- **GET** `/users/pending_approvals/`
- **Description**: Get expenses pending approval by user

#### Update User Role
- **PUT** `/users/{id}/update_role/`
- **Body**:
```json
{
  "role": "Manager",
  "manager": "manager_id"
}
```

#### Get Approvers
- **GET** `/users/approvers/`
- **Description**: Get all approvers for the company

### 3. Expenses API (`/expenses/`)

#### List Expenses
- **GET** `/expenses/`
- **Description**: Get expenses based on user permissions
- **Query Parameters**:
  - `status`: Filter by status (Pending, In-Progress, Approved, Rejected)
  - `category`: Filter by category
  - `original_currency`: Filter by currency

#### Create Expense
- **POST** `/expenses/`
- **Body**:
```json
{
  "amount": 100.50,
  "original_currency": "USD",
  "category": "Travel",
  "description": "Business trip expense",
  "expense_date": "2024-01-15",
  "receipt_image": "file_upload"
}
```

#### Get My Expenses
- **GET** `/expenses/my_expenses/`
- **Query Parameters**:
  - `status`: Filter by status

#### Get Pending Approvals
- **GET** `/expenses/pending_approval/`
- **Description**: Get expenses pending approval by current user

#### Approve/Reject Expense
- **POST** `/expenses/{id}/approve/`
- **Body**:
```json
{
  "decision": "Approved",
  "comments": "Approved for reimbursement"
}
```

#### Escalate Expense
- **POST** `/expenses/{id}/escalate/`
- **Body**:
```json
{
  "escalated_to": "user_id",
  "reason": "Escalation reason"
}
```

#### Get Approval History
- **GET** `/expenses/{id}/approval_history/`
- **Description**: Get approval history for an expense

#### Get Expenses by Status
- **GET** `/expenses/by_status/`
- **Query Parameters**:
  - `status`: Required status filter

#### Process Receipt (OCR)
- **POST** `/expenses/process_receipt/`
- **Body**: Form data with receipt image

#### Get Supported Currencies
- **GET** `/expenses/currencies/`
- **Description**: Get list of supported currencies

#### Convert Currency
- **POST** `/expenses/convert_currency/`
- **Body**:
```json
{
  "amount": 100,
  "from_currency": "USD",
  "to_currency": "EUR"
}
```

### 4. Approvals API (`/approvals/`)

#### Workflows

##### List Workflows
- **GET** `/approvals/workflows/`
- **Description**: Get approval workflows for the company

##### Create Workflow
- **POST** `/approvals/workflows/`
- **Body**:
```json
{
  "name": "Standard Approval",
  "rule_type": "Sequential",
  "is_default": true
}
```

##### Create Workflow with Approvers
- **POST** `/approvals/workflows/create-with-approvers/`
- **Body**:
```json
{
  "workflow": {
    "name": "Standard Approval",
    "rule_type": "Sequential",
    "is_default": true
  },
  "approvers": [
    {
      "approver": "user_id_1",
      "sequence": 1,
      "approver_title": "Finance Manager"
    },
    {
      "approver": "user_id_2",
      "sequence": 2,
      "approver_title": "Director"
    }
  ]
}
```

##### Add Approver to Workflow
- **POST** `/approvals/workflows/{id}/add_approver/`
- **Body**:
```json
{
  "approver": "user_id",
  "sequence": 3,
  "approver_title": "CFO"
}
```

##### Update Workflow Approvers
- **PUT** `/approvals/workflows/{id}/update_approvers/`
- **Body**:
```json
{
  "approvers": [
    {
      "approver": "user_id_1",
      "sequence": 1,
      "approver_title": "Finance Manager"
    }
  ]
}
```

##### Reorder Workflow Approvers
- **POST** `/approvals/workflows/{id}/reorder_approvers/`
- **Body**:
```json
{
  "approver_orders": [
    {
      "approver_id": "approver_id_1",
      "sequence": 1
    },
    {
      "approver_id": "approver_id_2",
      "sequence": 2
    }
  ]
}
```

##### Set Default Workflow
- **POST** `/approvals/workflows/{id}/set_default/`
- **Description**: Set workflow as default for the company

##### Get Workflow Statistics
- **GET** `/approvals/workflows/{id}/statistics/`
- **Description**: Get statistics for a workflow

##### Get Default Workflow
- **GET** `/approvals/workflows/default/`
- **Description**: Get default workflow for the company

##### Get Workflow Analytics
- **GET** `/approvals/workflows/{id}/analytics/`
- **Description**: Get detailed analytics for a workflow

#### Workflow Approvers

##### List Workflow Approvers
- **GET** `/approvals/workflow-approvers/`
- **Description**: Get workflow approvers

##### Create Workflow Approver
- **POST** `/approvals/workflow-approvers/`
- **Body**:
```json
{
  "workflow": "workflow_id",
  "approver": "user_id",
  "sequence": 1,
  "approver_title": "Finance Manager"
}
```

#### Expense Approvals

##### List Expense Approvals
- **GET** `/approvals/approvals/`
- **Description**: Get expense approvals based on permissions

##### Get Pending Approvals
- **GET** `/approvals/approvals/pending/`
- **Description**: Get pending approvals for current user

##### Make Approval Decision
- **POST** `/approvals/approvals/{id}/decide/`
- **Body**:
```json
{
  "decision": "Approved",
  "comments": "Approved for reimbursement"
}
```

##### Escalate Approval
- **POST** `/approvals/approvals/{id}/escalate/`
- **Body**:
```json
{
  "escalated_to": "user_id",
  "reason": "Escalation reason"
}
```

##### Get Approval Statistics
- **GET** `/approvals/approvals/statistics/`
- **Description**: Get approval statistics for the company

##### Get Approval History
- **GET** `/approvals/approvals/history/`
- **Query Parameters**:
  - `expense_id`: Required expense ID

#### Specialized Approval APIs

##### Bulk Approve Expenses
- **POST** `/approvals/approvals/bulk-approve/`
- **Body**:
```json
{
  "expense_ids": ["expense_id_1", "expense_id_2"],
  "decision": "Approved",
  "comments": "Bulk approval"
}
```

##### Escalate Expense
- **POST** `/approvals/expenses/{expense_id}/escalate/`
- **Body**:
```json
{
  "escalated_to": "user_id",
  "reason": "Escalation reason"
}
```

##### Get Approval Dashboard
- **GET** `/approvals/dashboard/`
- **Description**: Get approval dashboard data

## Workflow Types

### 1. Sequential Multi-Level
- Expenses go through approvers in sequence
- Each approver must approve before moving to next
- Example: Manager → Finance → Director

### 2. Percentage Rule
- Requires a percentage of approvers to approve
- Example: 60% of approvers must approve

### 3. Specific Approver Rule
- If a specific approver (e.g., CFO) approves, expense is auto-approved
- Bypasses other approvers

### 4. Hybrid Rule
- Combines sequential and conditional rules
- Example: Sequential flow with CFO override

## Expense Categories
- Travel
- Food & Dining
- Accommodation
- Office Supplies
- Transportation
- Client Entertainment
- Other

## Expense Statuses
- Pending: Initial state
- In-Progress: Under approval
- Approved: Approved for reimbursement
- Rejected: Rejected

## User Roles
- **Admin**: Full system access, can manage users and workflows
- **Manager**: Can approve expenses, manage team
- **Employee**: Can submit expenses, view own expenses

## Error Responses

### 400 Bad Request
```json
{
  "error": "Error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You are not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

## Pagination
List endpoints support pagination:
- `page`: Page number
- `page_size`: Number of items per page

## Filtering and Search
Most list endpoints support:
- **Filtering**: Use query parameters to filter results
- **Search**: Use `search` parameter for text search
- **Ordering**: Use `ordering` parameter to sort results

## File Uploads
For receipt images, use multipart/form-data:
```
Content-Type: multipart/form-data
```

## Rate Limiting
API requests are rate limited to prevent abuse. Contact support if you need higher limits.

## Support
For API support and questions, contact the development team.
