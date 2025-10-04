# Expenza - Expense Management System

A full-stack expense management application built with Django REST Framework and React, featuring comprehensive expense tracking, approval workflows, and AI-powered capabilities.

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Project Overview

Expenza is a modern expense management platform designed to streamline expense tracking, approval workflows, and financial reporting for organizations. The application provides a robust API backend with a sleek, user-friendly frontend interface.

## 🛠️ Tech Stack

### Backend (`expenza/`)
- **Framework:** Django 5.2.5 with Django REST Framework 3.16.1
- **Authentication:** JWT (Simple JWT 5.5.1)
- **Database:** MySQL with support for PostgreSQL
- **Task Queue:** Celery 5.5.3 with Redis 5.2.0
- **Payment Processing:** Stripe 12.5.1
- **AI/ML:** LangChain 0.3.27, OpenAI 1.107.2, Pinecone 7.3.0
- **File Storage:** Azure Blob Storage, AWS S3, Google Cloud Storage
- **PDF Generation:** ReportLab 4.4.4, xhtml2pdf 0.2.17
- **Notifications:** Twilio 9.7.2, Firebase Admin 7.1.0
- **API Documentation:** drf-spectacular 0.28.0
- **OCR:** Tesseract.js integration
- **Other:** CORS support, API logging, Background tasks

### Frontend (`expenza_frontend/`)
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.0
- **Styling:** TailwindCSS 3.4.6 with custom plugins
- **State Management:** Redux Toolkit 2.6.1
- **Routing:** React Router DOM 6.0.2
- **UI Components:** 
  - Radix UI primitives
  - Lucide React icons
  - Framer Motion for animations
- **Form Management:** React Hook Form 7.55.0 with Zod validation
- **Charts:** Recharts 2.15.2, D3.js 7.9.0
- **HTTP Client:** Axios 1.8.4
- **OCR:** Tesseract.js 5.1.0

---

## 📂 Repository Structure

This project is organized into two main directories:

```
ODOO_IITG/
├── expenza/                      # Backend (Django REST Framework)
│   ├── apps/                     # Django applications
│   │   ├── authentication/       # User authentication & authorization
│   │   ├── users/                # User management
│   │   ├── companies/            # Company/organization management
│   │   ├── expenses/             # Expense tracking & management
│   │   ├── approvals/            # Approval workflow system
│   │   ├── core/                 # Core utilities & middleware
│   │   ├── audit/                # Audit logging
│   │   └── rbac/                 # Role-based access control
│   ├── expenza/                  # Main Django project settings
│   │   ├── settings/             # Environment-based settings
│   │   ├── config/               # Configuration modules
│   │   └── urls.py               # Main URL configuration
│   ├── requirements/             # Python dependencies
│   │   ├── base.txt              # Base requirements
│   │   ├── development.txt       # Development dependencies
│   │   └── production.txt        # Production dependencies
│   ├── templates/                # Email & PDF templates
│   ├── static/                   # Static files
│   ├── media/                    # User uploaded files
│   ├── fixtures/                 # Test data & fixtures
│   ├── scripts/                  # Utility scripts
│   └── manage.py                 # Django management script
│
└── expenza_frontend/             # Frontend (React + Vite)
    ├── src/                      # Source code
    │   ├── components/           # Reusable React components
    │   ├── pages/                # Page components
    │   ├── services/             # API services & integrations
    │   ├── store/                # Redux store configuration
    │   ├── hooks/                # Custom React hooks
    │   ├── utils/                # Utility functions
    │   └── assets/               # Images, fonts, etc.
    ├── public/                   # Public static assets
    ├── package.json              # NPM dependencies
    ├── vite.config.js            # Vite configuration
    └── tailwind.config.js        # TailwindCSS configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Python:** 3.10 or higher
- **Node.js:** 16.x or higher
- **MySQL/PostgreSQL:** For database
- **Redis:** For Celery task queue (optional for development)
- **Git:** For version control

### Backend Setup

#### 1. Clone the Repository and Switch to Backend Branch

```bash
git clone <repository-url>
cd expenza
git checkout backend
```

#### 2. Create and Activate Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install Dependencies

For development:
```bash
pip install -r requirements/development.txt
```

For production:
```bash
pip install -r requirements/production.txt
```

#### 4. Environment Configuration

Create a `.env` file in the `expenza/` directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration (see [Environment Configuration](#environment-configuration) section below).

#### 5. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load fixtures (optional)
python manage.py loaddata fixtures/initial_data.json
```

#### 6. Run Development Server

```bash
# Set environment to development
set ENV=development  # Windows
export ENV=development  # macOS/Linux

# Run server
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

#### 7. Run Celery Workers (Optional)

In a separate terminal:

```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Start Celery worker
celery -A celery_app worker -l info

# Start Celery beat (for scheduled tasks)
celery -A celery_app beat -l info
```

---

### Frontend Setup

#### 1. Switch to Frontend Branch

```bash
cd expenza_frontend
git checkout frontend-api-intgration
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Configuration

Create a `.env` file in the `expenza_frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Expenza
```

#### 4. Run Development Server

```bash
npm start
```

The application will be available at `http://localhost:5173/` (default Vite port)

#### 5. Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

#### 6. Preview Production Build

```bash
npm run serve
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `expenza/` directory with the following variables:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ENV=development
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=expenza_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306
DB_ENGINE=django.db.backends.mysql

# JWT Configuration
JWT_TOKEN_SECRET=your-jwt-secret
JWT_TOKEN_ISSUER=expenza

# Redis Configuration (for Celery)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=your-twilio-number

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SUBSCRIPTION_WEBHOOK_SECRET=your-webhook-secret

# Storage Configuration (Optional)
STORAGE_TYPE=local  # local, s3, azure, gcs
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket-name

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-key
PINECONE_API_KEY=your-pinecone-key

# Encryption
ENCRYPTION_PASSWORD=your-encryption-password
SALT_STR_KEY=your-salt-key

# Notification Bypass (for testing)
NOTIFICATION_BYPASS=False

# Frontend URLs
FRONTEND_URL=http://localhost:5173
SUCCESS_SUBSCRIPTION_URL=http://localhost:5173/subscription/success
CANCEL_SUBSCRIPTION_URL=http://localhost:5173/subscription/cancel
UPDATE_SUCCESS_SUBSCRIPTION_URL=http://localhost:5173/subscription/update-success
UPDATE_CANCEL_SUBSCRIPTION_URL=http://localhost:5173/subscription/update-cancel
```

### Frontend Environment Variables

Create a `.env` file in the `expenza_frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Expenza
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

---

## 📖 API Documentation

The API documentation is available through multiple resources:

1. **OpenAPI/Swagger UI:** Access at `http://localhost:8000/api/schema/swagger-ui/` when the server is running
2. **ReDoc:** Access at `http://localhost:8000/api/schema/redoc/`
3. **Postman Collection:** Import `Expenza_API_Collection.postman_collection.json` located in the `expenza/` directory
4. **API Documentation:** See `API_DOCUMENTATION.md` and `EXPENSE_API_GUIDE.md` for detailed guides

### Quick API Reference

- **Authentication:** `/api/auth/`
- **Users:** `/api/users/`
- **Companies:** `/api/companies/`
- **Expenses:** `/api/expenses/`
- **Approvals:** `/api/approvals/`

---

## ✨ Features

### Backend Features

- **User Management**
  - User registration and authentication with JWT
  - Role-based access control (RBAC)
  - Multi-company support
  - User profile management

- **Expense Management**
  - Create, read, update, delete expenses
  - Expense categorization
  - Receipt upload with OCR support
  - Multi-currency support
  - Bulk expense operations

- **Approval Workflows**
  - Configurable approval chains
  - Multi-level approvals
  - Email and SMS notifications
  - Approval delegation

- **Reporting & Analytics**
  - Expense reports generation (PDF)
  - Dashboard analytics
  - Custom date range filtering
  - Export to CSV/Excel

- **AI-Powered Features**
  - Receipt OCR and data extraction
  - Expense categorization suggestions
  - Fraud detection patterns
  - Natural language query support

- **Integrations**
  - Stripe payment processing
  - Cloud storage (AWS S3, Azure, GCS)
  - Email notifications (SMTP)
  - SMS notifications (Twilio)
  - Firebase push notifications

### Frontend Features

- **Modern UI/UX**
  - Responsive design with TailwindCSS
  - Smooth animations with Framer Motion
  - Accessible components with Radix UI

- **Dashboard**
  - Overview of expenses
  - Interactive charts and graphs
  - Recent activity feed

- **Expense Management**
  - Create and edit expenses
  - Upload receipts with drag-and-drop
  - OCR receipt scanning
  - Filter and search capabilities

- **User Management**
  - Profile settings
  - Company management
  - Team member invitations

- **Reports**
  - Generate expense reports
  - Download as PDF
  - Custom date ranges

---

## 🌿 Branch Information

This project uses separate branches for backend and frontend development:

- **Backend Branch:** `backend`
  - Contains the Django REST Framework application
  - Located in the `expenza/` directory
  - Switch to this branch for backend development

- **Frontend Branch:** `frontend-api-intgration`
  - Contains the React + Vite application
  - Located in the `expenza_frontend/` directory
  - Switch to this branch for frontend development

### Working with Branches

```bash
# Switch to backend branch
git checkout backend

# Switch to frontend branch
git checkout frontend-api-intgration

# Create a new feature branch from backend
git checkout -b feature/backend-feature backend

# Create a new feature branch from frontend
git checkout -b feature/frontend-feature frontend-api-intgration
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch from the appropriate branch (`backend` or `frontend-api-intgration`)
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass
6. Submit a pull request

### Development Workflow

1. **Backend Development:**
   ```bash
   git checkout backend
   git pull origin backend
   git checkout -b feature/your-feature-name
   # Make changes
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

2. **Frontend Development:**
   ```bash
   git checkout frontend-api-intgration
   git pull origin frontend-api-intgration
   git checkout -b feature/your-feature-name
   # Make changes
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

### Code Style

- **Backend:** Follow PEP 8 Python style guide
- **Frontend:** Follow ESLint configuration
- Use meaningful commit messages
- Write descriptive pull request descriptions

---

## 📚 Additional Documentation

- **API Documentation:** `API_DOCUMENTATION.md`
- **API Setup Guide:** `API_SETUP.md`
- **Expense API Guide:** `EXPENSE_API_GUIDE.md`
- **Postman Collection Guide:** `POSTMAN_COLLECTION_README.md`
- **User Creation Guide:** `USER_CREATION_GUIDE.md`
- **Quick Start Guide:** `QUICK_START_GUIDE.md`
- **Quick Reference:** `QUICK_REFERENCE.md`

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error:**
- Verify database credentials in `.env`
- Ensure MySQL/PostgreSQL service is running
- Check database exists: `CREATE DATABASE expenza_db;`

**Celery Not Working:**
- Ensure Redis is running
- Check Redis connection in `.env`
- Verify Celery worker is running

**Import Errors:**
- Ensure virtual environment is activated
- Reinstall requirements: `pip install -r requirements/development.txt`

### Frontend Issues

**API Connection Error:**
- Verify `VITE_API_BASE_URL` in `.env`
- Ensure backend server is running
- Check CORS configuration in backend

**Build Errors:**
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

---

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API guides

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Django REST Framework for the robust backend framework
- React team for the excellent frontend library
- All open-source contributors whose libraries make this project possible

---

**Happy Coding! 🚀**
