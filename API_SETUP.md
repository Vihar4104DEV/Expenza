# Expense Management System API Setup

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements/base.txt
```

### 2. Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser
```bash
python manage.py createsuperuser
```

### 4. Run Server
```bash
python manage.py runserver
```

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/refresh-token/` - Refresh JWT token
- `POST /api/v1/auth/logout/` - User logout

### Companies
- `GET /api/v1/companies/` - List companies
- `POST /api/v1/companies/` - Create company
- `POST /api/v1/companies/create_with_admin/` - Create company with admin

### Users
- `GET /api/v1/users/` - List users
- `POST /api/v1/users/` - Create user
- `GET /api/v1/users/me/` - Get current user
- `PUT /api/v1/users/change_password/` - Change password

### Expenses
- `GET /api/v1/expenses/` - List expenses
- `POST /api/v1/expenses/` - Create expense
- `POST /api/v1/expenses/{id}/approve/` - Approve/reject expense
- `POST /api/v1/expenses/{id}/escalate/` - Escalate expense

### Approvals
- `GET /api/v1/approvals/workflows/` - List workflows
- `POST /api/v1/approvals/workflows/` - Create workflow
- `GET /api/v1/approvals/approvals/pending/` - Get pending approvals
- `POST /api/v1/approvals/approvals/bulk-approve/` - Bulk approve expenses

## Key Features

### 1. Multi-Tenant Architecture
- Each company has isolated data
- Users belong to a specific company
- Cross-company data access is prevented

### 2. Role-Based Access Control
- **Admin**: Full system access
- **Manager**: Team management and approval
- **Employee**: Expense submission and viewing

### 3. Flexible Approval Workflows
- **Sequential**: Step-by-step approval
- **Percentage**: Percentage-based approval
- **Specific Approver**: Auto-approval by specific user
- **Hybrid**: Combination of rules

### 4. Currency Support
- Multi-currency expense submission
- Automatic currency conversion
- Company default currency display

### 5. OCR Integration Ready
- Receipt image upload
- OCR data extraction endpoints
- Automated expense creation

## Sample API Usage

### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@company.com",
    "password": "password123",
    "password_confirm": "password123",
    "employee_id": "EMP001"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "password123"
  }'
```

### 2. Create Expense
```bash
curl -X POST http://localhost:8000/api/v1/expenses/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50,
    "original_currency": "USD",
    "category": "Travel",
    "description": "Business trip expense",
    "expense_date": "2024-01-15"
  }'
```

### 3. Approve Expense
```bash
curl -X POST http://localhost:8000/api/v1/expenses/{expense_id}/approve/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "Approved",
    "comments": "Approved for reimbursement"
  }'
```

## Database Models

### Core Models
- **Company**: Multi-tenant company entity
- **User**: System users with roles
- **Expense**: Employee expense claims
- **ApprovalWorkflow**: Approval flow definitions
- **WorkflowApprover**: Approvers in workflows
- **ExpenseApproval**: Approval decisions

### Key Relationships
- Company → Users (One-to-Many)
- User → Expenses (One-to-Many)
- User → Manager (Self-referential)
- Workflow → Approvers (One-to-Many)
- Expense → Approvals (One-to-Many)

## Configuration

### Environment Variables
```bash
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=your-database-url
JWT_TOKEN_SECRET=your-jwt-secret
```

### Settings Files
- `expenza/settings/base.py` - Base settings
- `expenza/settings/development.py` - Development settings
- `expenza/settings/production.py` - Production settings

## Testing

### Run Tests
```bash
python manage.py test
```

### API Testing
Use tools like Postman or curl to test the API endpoints.

## Deployment

### Docker
```bash
docker-compose up -d
```

### Production
1. Set environment variables
2. Run migrations
3. Collect static files
4. Deploy with Gunicorn

## Support

For questions or issues, refer to the API documentation or contact the development team.
