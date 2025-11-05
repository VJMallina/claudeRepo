# SaveInvest API

Backend API service for the SaveInvest application - an automated savings and investment platform.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Progressive KYC**: 3-tier KYC system (Level 0, 1, 2)
- **Savings Wallet**: Automated savings from UPI transactions
- **Auto-Invest Rules**: Smart investment automation based on user-defined rules
- **Investment Management**: Portfolio tracking with NAV updates
- **PDF Generation**: Automated account statements and investment receipts
- **Email Notifications**: Daily summaries and investment confirmations
- **Goals Tracking**: Savings goals with progress monitoring
- **Transaction History**: Comprehensive transaction logging

## Tech Stack

- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **Payment Gateway**: Razorpay integration
- **PDF Generation**: PDFKit
- **Email Delivery**: Nodemailer
- **Scheduling**: @nestjs/schedule (Cron jobs)
- **Testing**: Jest with 200+ test cases

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- SMTP server credentials (Gmail, SendGrid, AWS SES, etc.)

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Update .env with your credentials
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

## Environment Configuration

Key environment variables (see `.env.example` for full list):

### Database
- `DATABASE_URL`: PostgreSQL connection string

### JWT Authentication
- `JWT_SECRET`: Secret key for access tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `JWT_EXPIRES_IN`: Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiry (default: 7d)

### SMTP/Email Configuration
- `SMTP_HOST`: SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT`: SMTP port (default: 587)
- `SMTP_USER`: SMTP username/email
- `SMTP_PASS`: SMTP password or app-specific password
- `SMTP_FROM`: From email address

### Payment Gateway
- `RAZORPAY_KEY_ID`: Razorpay key ID
- `RAZORPAY_KEY_SECRET`: Razorpay secret key

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "mobile": "+919876543210"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Savings Wallet Endpoints

#### Get Wallet Balance
```http
GET /api/savings-wallet
Authorization: Bearer {access_token}
```

#### Add Funds
```http
POST /api/savings-wallet/add
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "amount": 1000,
  "method": "UPI"
}
```

### Investment Endpoints

#### Purchase Investment
```http
POST /api/investments/purchase
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "productId": "product-uuid",
  "amount": 5000
}
```

#### Get Portfolio
```http
GET /api/investments/portfolio
Authorization: Bearer {access_token}
```

#### Redeem Investment
```http
POST /api/investments/redeem/:investmentId
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "units": 10.5
}
```

### PDF/Statement Endpoints

#### Get Daily Statement
```http
GET /api/statements/daily?date=2025-01-15
Authorization: Bearer {access_token}
```

#### Get Monthly Statement
```http
GET /api/statements/monthly?year=2025&month=1
Authorization: Bearer {access_token}
```

#### Download Investment Receipt
```http
GET /api/statements/investment-receipt/:investmentId
Authorization: Bearer {access_token}
```

#### Manual Daily Statement Trigger (Admin)
```http
POST /api/statements/send-daily
Authorization: Bearer {admin_access_token}
```

### Auto-Invest Rules Endpoints

#### Create Auto-Invest Rule
```http
POST /api/auto-invest
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "productId": "product-uuid",
  "triggerType": "TRANSACTION_PERCENTAGE",
  "triggerValue": 10,
  "minAmount": 100,
  "maxAmount": 5000,
  "frequency": "DAILY"
}
```

#### Get Active Rules
```http
GET /api/auto-invest
Authorization: Bearer {access_token}
```

## Automated Features

### Daily Account Statements

Automatically generates and emails comprehensive account statements to users daily at 9 PM.

**Statement includes:**
- Savings wallet balance and transactions
- Investment portfolio summary
- Daily gains/losses
- Transaction history for the day

**Cron Schedule:** `0 21 * * *` (9 PM daily)

**Configuration:**
- Enable/disable: `ENABLE_DAILY_STATEMENTS=true`
- Custom schedule: `DAILY_STATEMENT_CRON="0 21 * * *"`

### Monthly Account Statements

Sends monthly statements on the 1st of each month at 10 AM.

**Statement includes:**
- Complete monthly transaction history
- Investment performance summary
- Month-over-month growth
- Tax-related information

**Cron Schedule:** `0 10 1 * *` (10 AM on 1st of month)

**Configuration:**
- Enable/disable: `ENABLE_MONTHLY_STATEMENTS=true`
- Custom schedule: `MONTHLY_STATEMENT_CRON="0 10 1 * *"`

### Investment Receipts

Automatically sends investment confirmation emails with PDF receipts immediately after each investment purchase.

**Receipt includes:**
- Investment details (product, amount, units, NAV)
- Transaction ID and timestamp
- Updated savings wallet balance
- User information

**Features:**
- Async processing (doesn't block investment response)
- Professional email template with branding
- PDF attachment for record-keeping
- In-app notification

**Configuration:**
- Enable/disable: `ENABLE_INVESTMENT_RECEIPTS=true`

## Project Structure

```
services/api/
├── src/
│   ├── auth/                 # Authentication module
│   ├── users/                # User management
│   ├── kyc/                  # KYC verification
│   ├── savings-wallet/       # Savings wallet operations
│   ├── investments/          # Investment management
│   ├── auto-invest/          # Auto-invest rules engine
│   ├── products/             # Investment products
│   ├── goals/                # Savings goals
│   ├── transactions/         # Transaction history
│   ├── notifications/        # Push notifications
│   ├── pdf/                  # PDF generation & statements
│   │   ├── pdf.service.ts              # Core PDF generation
│   │   ├── account-statement.service.ts # Statement generation
│   │   ├── scheduled-statements.service.ts # Cron jobs
│   │   ├── investment-receipt.service.ts # Receipt generation
│   │   ├── pdf.controller.ts           # PDF endpoints
│   │   └── pdf.module.ts               # Module configuration
│   ├── prisma/               # Prisma ORM integration
│   ├── app.module.ts         # Main application module
│   └── main.ts               # Application entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── test/                     # E2E tests
├── .env.example              # Environment template
├── package.json
└── README.md
```

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

## Key Modules

### PDF Module

Handles all PDF generation and email delivery functionality.

**Services:**
- `PdfService`: Core PDF generation with PDFKit
- `AccountStatementService`: Daily/monthly statement generation
- `ScheduledStatementsService`: Cron jobs for automated delivery
- `InvestmentReceiptService`: Investment receipt generation

**Email Templates:**
- Professional HTML templates with branding
- Responsive design for all devices
- Investment confirmation with success banner
- Account statement summary with tables

### Investments Module

Manages investment portfolio and transactions.

**Features:**
- Purchase investments from savings wallet
- Redeem investments (full or partial)
- NAV tracking and updates
- Portfolio value calculation
- Integration with PDF module for receipts

### Auto-Invest Module

Automated investment rules engine.

**Trigger Types:**
- `TRANSACTION_PERCENTAGE`: % of each transaction
- `BALANCE_THRESHOLD`: When wallet reaches threshold
- `SCHEDULED`: Time-based investments
- `FIXED_AMOUNT`: Fixed amount on schedule

### Savings Wallet Module

Manages user savings wallet with auto-save functionality.

**Features:**
- Add funds via UPI/Bank
- Auto-save from transactions
- Withdraw to bank account
- Transaction history
- Balance tracking

## Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Google account
2. Generate an app-specific password: https://myaccount.google.com/apppasswords
3. Update .env:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### SendGrid Setup

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### AWS SES Setup

```
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Update all environment variables
- [ ] Set strong JWT secrets
- [ ] Configure production database
- [ ] Set up SMTP/email service
- [ ] Configure payment gateway (Razorpay)
- [ ] Enable CORS for production domain
- [ ] Set NODE_ENV=production
- [ ] Run database migrations
- [ ] Test email delivery
- [ ] Test cron jobs
- [ ] Set up monitoring/logging

### Database Migrations

```bash
# Production migration
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## API Statistics

- **Total Endpoints**: 69
- **Modules**: 12
- **Test Coverage**: 85%+
- **Database Tables**: 15
- **Scheduled Jobs**: 2 (daily + monthly statements)

## Support

For issues or questions:
- Email: dev@saveinvest.app
- GitHub Issues: [repository-link]

## License

Proprietary - All rights reserved
