## Frontend
# Expenza - Expense Management Platform

A modern, professional expense management platform with multi-level approvals, OCR receipt scanning, and conditional workflows.

## Features

### Core Features
- **Smart Approval Workflows**: Sequential and conditional approval rules
- **OCR Receipt Scanning**: Auto-extract expense details from receipts using AI
- **Multi-Currency Support**: Handle expenses in any currency with real-time conversion
- **Multi-Level Approvals**: Configurable approval chains with percentage and specific approver rules
- **Real-time Updates**: Live status tracking and notifications

### User Roles
1. **Employee Dashboard**
   - Submit expenses with OCR receipt upload or manual entry
   - Track expense status and approval timeline
   - View spending insights and analytics
   - Filter and search expense history

2. **Manager Approval Dashboard**
   - Review and approve/reject team expenses
   - Bulk approval actions
   - Filter by urgency, amount, and category
   - View team expense overview

3. **Admin Dashboard**
   - User management with role assignment
   - Configure approval workflows
   - View all expenses across organization
   - System-wide statistics and reporting

## Tech Stack

- **Frontend**: React 18.2
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **OCR**: Tesseract.js
- **Date Handling**: date-fns
- **Build Tool**: Vite 5.0

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Expenza
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

The application will open at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run serve
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Select, etc.)
│   ├── shared/          # Shared components (StatusBadge, CurrencyDisplay, etc.)
│   └── AppIcon.jsx      # Icon wrapper component
├── pages/
│   ├── LandingPage.jsx              # Landing page with hero and features
│   ├── auth/                        # Authentication pages
│   │   ├── LoginModal.jsx
│   │   └── SignupModal.jsx
│   ├── admin-dashboard/             # Admin dashboard and components
│   ├── employee-dashboard/          # Employee dashboard and components
│   └── manager-approval-dashboard/  # Manager dashboard and components
├── hooks/
│   ├── useAuth.js       # Authentication hook
│   ├── useCurrency.js   # Currency conversion hook
│   ├── useExpenses.js   # Expense management hook
│   └── useToast.js      # Toast notification hook
├── utils/
│   ├── cn.js            # Tailwind class merger
│   ├── currency.js      # Currency utilities
│   └── formatters.js    # Formatting utilities
├── styles/              # Global styles
├── App.jsx              # Root component
└── Routes.jsx           # Route configuration
```

## Demo Accounts

Use these credentials to test different user roles:

- **Admin**: admin@company.com (any password)
- **Manager**: manager@company.com (any password)
- **Employee**: employee@company.com (any password)

## Key Features Implementation

### OCR Receipt Scanning
- Drag & drop or click to upload receipt images
- Automatic extraction of amount, date, and merchant
- Manual correction of extracted data
- Confidence score display

### Multi-Currency Support
- Real-time exchange rates from exchangerate-api.com
- Automatic currency conversion to company currency
- Display both original and converted amounts
- 1-hour cache for exchange rates

### Approval Workflows
- Sequential approval (Step 1 → Step 2 → Step 3)
- Percentage-based approval (e.g., 60% must approve)
- Specific approver auto-approval (e.g., CFO approval)
- Hybrid workflows combining multiple rules

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Bottom navigation for mobile devices
- Touch-friendly UI elements

## API Integration

The application uses the following external APIs:

1. **Exchange Rates**: https://api.exchangerate-api.com/v4/latest/{BASE}
2. **Countries**: https://restcountries.com/v3.1/all?fields=name,currencies

## Color Scheme

- **Primary**: Blue (#2563EB)
- **Secondary**: Indigo (#4F46E5)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: Light Gray (#F9FAFB)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@Expenza.com or open an issue in the repository.