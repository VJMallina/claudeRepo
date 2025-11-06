# Product Requirements Document (PRD)
## Automated Savings & Investment Platform

**Version:** 1.0
**Date:** October 21, 2025
**Status:** Draft
**Owner:** Product Team

---

## Executive Summary

### Product Vision
Build India's first automated micro-savings platform that helps users save effortlessly by automatically setting aside a percentage of every UPI transaction into a savings wallet, which can be seamlessly invested in curated financial instruments.

### Problem Statement
- Indians struggle to save consistently due to lack of discipline
- Traditional savings require conscious effort and planning
- Small amounts are often spent instead of saved
- Investment seems complex and intimidating for beginners
- No seamless bridge between daily spending and long-term wealth creation

### Solution
An intelligent mobile app that:
1. Automatically saves a user-defined percentage (1-50%) from every UPI payment
2. Accumulates savings in a digital wallet with real-time tracking
3. Enables one-tap investment into vetted, low-risk financial products
4. Gamifies savings with goals, streaks, and milestones
5. Provides insights into spending, saving, and investment patterns

### Success Metrics (Year 1)
- **100,000** registered users
- **50,000** monthly active users
- **₹50 Crore** in total savings accumulated
- **₹25 Crore** in total investments made
- **4.5+** App Store rating
- **60%** user retention (6-month cohort)
- **30%** conversion to investment

---

## Target Audience

### Primary Personas

#### Persona 1: Young Professional (Rahul)
- **Age:** 25-32
- **Income:** ₹6-12 LPA
- **Location:** Tier 1 cities (Mumbai, Delhi, Bangalore)
- **Behavior:**
  - Makes 20-30 UPI payments/month
  - Wants to save but lacks discipline
  - Tech-savvy, uses multiple fintech apps
  - Interested in investing but doesn't know where to start
- **Pain Points:**
  - "I earn well but never have savings at month-end"
  - "Investment seems too complicated"
  - "Small amounts disappear without tracking"
- **Goals:**
  - Save for vacation, gadgets, emergency fund
  - Build wealth for future
  - Automate finances

#### Persona 2: Early-Career Professional (Priya)
- **Age:** 22-28
- **Income:** ₹3-8 LPA
- **Location:** Tier 1 & 2 cities
- **Behavior:**
  - Frequent online shopper
  - Uses food delivery, cab services daily
  - Wants financial independence
  - Follows personal finance influencers
- **Pain Points:**
  - "I overspend on small things"
  - "Don't have enough to invest in traditional options"
  - "Want to build savings habit"
- **Goals:**
  - Emergency fund
  - Financial literacy
  - Grow wealth

#### Persona 3: First-time Investor (Amit)
- **Age:** 28-40
- **Income:** ₹8-20 LPA
- **Location:** Pan-India
- **Behavior:**
  - Has savings in bank account (low interest)
  - Scared of stock market
  - Wants safe investment options
  - Values convenience
- **Pain Points:**
  - "My savings earn negligible interest"
  - "Don't trust market volatility"
  - "Too busy to research investments"
- **Goals:**
  - Better returns than savings account
  - Low-risk investments
  - Hassle-free wealth management

### Secondary Personas
- College students (18-22) with part-time income
- Gig economy workers seeking financial stability
- Small business owners wanting personal savings

---

## Market Analysis

### Market Size (India)
- **Digital payments market:** $10 Trillion by 2026
- **UPI transactions:** 100+ Billion transactions/year (2024)
- **Fintech users:** 500+ Million
- **Investment apps market:** Growing at 25% CAGR

### Competitive Landscape

| Competitor | Strengths | Weaknesses | Our Differentiation |
|------------|-----------|------------|---------------------|
| **CRED** | Rewards, UX | No auto-save | Automated savings focus |
| **Jupiter** | Neo-banking | Complex features | Simpler, focused MVP |
| **Fi Money** | Goals-based | Limited UPI | Better UPI integration |
| **Paytm** | Large user base | Cluttered UI | Clean, purpose-built |
| **Google Pay** | Ubiquitous | No savings focus | Savings-first approach |

### Our Unique Value Proposition
1. **Invisible Savings:** Set it once, save forever
2. **Micro-Investment:** Invest as low as ₹100
3. **Curated Products:** No analysis paralysis, 2-3 vetted options
4. **Seamless Journey:** Save → Invest in 2 taps
5. **Behavioral Nudges:** Gamification, streaks, milestones

---

## Product Requirements

### MVP Scope (Phase 1: Months 1-4)

#### In Scope
1. **Authentication & KYC**
   - Mobile OTP registration
   - PIN & biometric login
   - PAN/Aadhaar KYC
   - Bank account linking

2. **UPI Payments**
   - QR code scanning
   - UPI ID payments
   - Transaction history
   - Auto-save on payment success

3. **Savings Wallet**
   - Configurable save percentage (1-50%)
   - Real-time balance tracking
   - Manual deposits/withdrawals
   - Savings analytics

4. **Basic Investments**
   - 2-3 liquid/debt mutual funds
   - One-tap invest from wallet
   - Portfolio view
   - NAV updates

5. **Notifications**
   - Transaction alerts
   - Savings milestones
   - Security alerts

6. **Analytics**
   - Basic dashboard
   - Spending/savings trends

#### Out of Scope (Post-MVP)
- ❌ Bill payments
- ❌ Peer-to-peer transfers
- ❌ Credit line
- ❌ Cryptocurrency
- ❌ Insurance products
- ❌ Tax filing integration
- ❌ Family accounts
- ❌ Social features

---

## Functional Requirements

### 1. User Authentication & Authorization

#### 1.1 Registration
- **Input:** Mobile number (10 digits)
- **Process:**
  - Validate Indian mobile number format
  - Send 6-digit OTP via SMS
  - OTP validity: 120 seconds
  - Max 3 OTP attempts, then 5-minute cooldown
- **Output:** User account created, JWT token issued

#### 1.2 Profile Creation
- **Required Fields:**
  - Full Name (min 3 chars, max 50 chars)
  - Email (validated format)
  - Date of Birth (age ≥ 18 years)
- **Optional Fields:**
  - Profile Photo (max 5MB, JPG/PNG)

#### 1.3 PIN Management
- **Requirements:**
  - 4-6 digit PIN
  - Cannot be sequential (1234, 9876)
  - Cannot be repetitive (1111, 5555)
  - Encrypted using bcrypt (10 rounds)
  - Max 3 failed attempts → 30-minute lock

#### 1.4 Biometric Authentication
- **Supported:** Fingerprint, Face ID/Face Unlock
- **Fallback:** PIN if biometric fails
- **Storage:** Biometric template never leaves device

#### 1.5 Progressive KYC Process

**Progressive KYC** allows users to access features incrementally as they complete verification steps. This reduces onboarding friction while ensuring compliance.

##### KYC Levels & Feature Access:

| Level | Verification Required | Features Unlocked | Transaction Limits |
|-------|----------------------|-------------------|-------------------|
| **Level 0** | None (Basic registration) | • Payments up to ₹10,000<br>• Savings wallet<br>• View investment products | Max ₹10,000/transaction |
| **Level 1** | PAN card verification | • Unlimited payments<br>• Higher transaction limits<br>• Premium features | Unlimited |
| **Level 2** | PAN + Aadhaar + Liveness + Bank | • Investment purchases<br>• Withdrawals<br>• Full platform access | Unlimited |

##### Onboarding Flow:

1. **Initial Registration** (Level 0)
   - Mobile OTP verification
   - Profile creation (Name, Email, DOB)
   - PIN setup (4-6 digits)
   - Biometric enrollment (optional)
   - → **User lands on Dashboard**

2. **KYC Prompt Banner** (Skippable)
   - "Complete KYC to unlock all features"
   - Shows completion progress: 0/3 steps
   - Can skip and do later

3. **Triggered KYC Enforcement**
   - **Payment > ₹10,000**: Force Level 1 KYC (PAN verification)
   - **Investment attempt**: Force Level 2 KYC (Full verification)
   - **Withdrawal attempt**: Requires verified bank account

##### Level 1 KYC: PAN Verification
- **Input**: PAN number (ABCDE1234F format), Name as per PAN
- **Process**:
  - Real-time validation with NSDL/Income Tax API
  - Duplicate PAN check across platform
  - Name matching
- **Duration**: Instant (< 5 seconds)
- **Outcome**: KYC Level upgraded to 1

##### Level 2 KYC: Full Verification
- **Step 1: Aadhaar Verification**
  - Aadhaar number input (12 digits)
  - OTP sent to Aadhaar-linked mobile
  - OTP verification (120 seconds validity)
  - Integration: DigiLocker API
  - Duplicate Aadhaar check

- **Step 2: Liveness Detection**
  - Selfie capture or short video (3-5 seconds)
  - Liveness checks:
    - ✓ Blink detection
    - ✓ Smile detection
    - ✓ Head turn detection (if video)
    - ✓ Quality score (lighting, blur, face visibility)
  - Face matching with Aadhaar photo
  - Confidence score: Must be > 70%
  - Integration: AWS Rekognition / Azure Face API / FaceIO

- **Step 3: Bank Account Verification**
  - Bank account details input
  - IFSC code validation
  - Account holder name (must match PAN name)
  - Penny drop verification (₹1 test deposit)
  - Integration: Razorpay/Cashfree Bank Verification API

- **Duration**: 5-10 minutes for user input, instant API verification
- **Outcome**: KYC Level upgraded to 2, investments unlocked

##### Bank Account Management:
- Users can add multiple bank accounts
- First verified account becomes primary
- Can set any verified account as primary for withdrawals
- Bank selection during withdrawal (defaults to primary)
- All accounts must pass penny drop verification

##### Security & Compliance:
- PAN number stored in plain text (required for tax reporting)
- Aadhaar number encrypted (AES-256)
- Bank account number encrypted (AES-256)
- Masked display in UI (e.g., ****1234)
- Liveness photos stored securely (S3 with encryption)
- Auto-KYC status progression: PENDING → IN_PROGRESS → APPROVED
- Manual admin review for edge cases

##### Error Handling:
- Clear error messages with next steps
- Example: "KYC Level 1 required for payments above ₹10,000. Verify your PAN card to unlock."
- Progressive disclosure: Don't overwhelm users with all steps upfront
- Allow partial completion and resume later

##### API Integrations Required:
- **PAN**: NSDL PAN Verification API / Income Tax Department API
- **Aadhaar**: DigiLocker eKYC API (Government of India)
- **Liveness**: AWS Rekognition / Azure Face API / FaceIO
- **Bank Verification**: Razorpay Fund Account Validation / Cashfree Penny Drop

##### SLA:
- Real-time verification for PAN and Aadhaar (< 10 seconds)
- Bank verification: 24-48 hours (penny drop settlement time)
- Liveness detection: Instant (< 5 seconds)

---

### 2. UPI Payment Integration

#### 2.1 Payment Gateway
- **Primary:** Razorpay UPI
- **Backup:** Cashfree
- **Features Required:**
  - QR code payment
  - UPI ID payment
  - Payment verification
  - Webhooks for status updates
  - Refund handling

#### 2.2 Payment Flow
1. User initiates payment (QR/UPI ID)
2. Amount entered (₹1 - ₹100,000)
3. Auto-save preview displayed
4. UPI PIN authentication
5. Payment processed via gateway
6. Status: Success/Failed/Pending
7. Auto-save triggered on success

#### 2.3 Auto-Save Mechanism
- **Trigger:** Payment success webhook
- **Process:**
  1. Calculate save amount = Payment × (Save % / 100)
  2. Apply min/max transaction rules
  3. Credit to savings wallet
  4. Record transaction
  5. Send notification
- **Execution Time:** < 5 seconds from payment success

#### 2.4 Transaction Limits (Based on KYC Level)
- **KYC Level 0 (No KYC):**
  - Per Transaction: ₹1 - ₹10,000
  - Daily Limit: ₹50,000
  - Monthly Limit: ₹200,000

- **KYC Level 1 (PAN Verified):**
  - Per Transaction: ₹1 - ₹100,000
  - Daily Limit: ₹500,000
  - Monthly Limit: Unlimited

- **KYC Level 2 (Full KYC):**
  - Per Transaction: Unlimited
  - Daily Limit: Unlimited
  - Monthly Limit: Unlimited
  - Additional: Investment access enabled

---

### 3. Savings Wallet

#### 3.1 Wallet Operations
- **Credit Sources:**
  - Auto-save from payments
  - Manual deposits (UPI/Net banking)
  - Investment redemptions
- **Debit Sources:**
  - Withdrawals to bank account (user selectable from linked accounts)
  - Investment purchases
- **Balance Calculation:** Real-time, atomic updates

#### 3.2 Configuration
- **Save Percentage:**
  - Range: 1% - 50%
  - Default: 10%
  - Adjustable anytime
- **Advanced Rules:**
  - Minimum transaction amount (default: ₹10)
  - Maximum save per transaction (optional)
  - Frequency: Every transaction / Weekly / Monthly

#### 3.3 Withdrawals
- **Requirements:**
  - At least one verified bank account (Level 2 KYC required)
  - Sufficient wallet balance
- **Process:**
  1. Select bank account (defaults to primary account)
  2. Enter amount (₹1 - wallet balance)
  3. Add withdrawal reason (optional)
  4. Authenticate with PIN
  5. NEFT/IMPS transfer initiated
- **Bank Account Selection:**
  - User can have multiple verified bank accounts
  - Primary account is default selection
  - Can choose any verified account for withdrawal
  - Cannot withdraw to unverified accounts
- **Processing Time:** 1-2 business days
- **Charges:** Free for first 3/month, ₹5 thereafter

#### 3.4 Interest
- **MVP:** No interest on wallet balance
- **Future:** 3-4% interest like savings account

---

### 4. Investment Features

#### 4.1 Product Selection (MVP)
**Curated Products:**
1. **Liquid Fund** (Primary recommendation)
   - Risk: Low
   - Returns: 4-6% p.a.
   - Liquidity: Instant redemption
   - Minimum: ₹100

2. **Short-Term Debt Fund**
   - Risk: Low-Medium
   - Returns: 6-8% p.a.
   - Liquidity: T+1 days
   - Minimum: ₹500

3. **Digital Gold** (Optional)
   - Risk: Medium
   - Returns: Market-linked
   - Liquidity: Instant
   - Minimum: ₹10

#### 4.2 Investment Process
1. Browse products (list + details view)
2. Select product
3. Enter amount (min to wallet balance)
4. Preview: NAV, estimated units, fees
5. Confirm with PIN
6. Deduct from wallet
7. Place order with AMC/platform
8. Units allocated (T+1 or T+2)

#### 4.3 Portfolio Management
- **View:** All holdings with current value
- **Metrics:**
  - Total invested
  - Current value
  - Absolute returns (₹)
  - Percentage returns (%)
  - XIRR (annualized return)
- **Updates:** NAV updated daily at 9 PM

#### 4.4 Redemption
- **Types:** Full or Partial
- **Process:**
  1. Select holding
  2. Choose units/amount
  3. Preview exit load (if any)
  4. Confirm with PIN
  5. Redemption initiated
  6. Amount credited to wallet (T+1 to T+3)

---

### 5. Savings Goals (Phase 1 - Optional)

#### 5.1 Goal Creation
- **Fields:**
  - Name (max 30 chars)
  - Target amount (₹100 - ₹10,00,000)
  - Target date (1 month to 5 years)
  - Priority (High/Medium/Low)
  - Image/Icon

#### 5.2 Goal Tracking
- **Metrics:**
  - Progress % (current / target × 100)
  - Amount remaining
  - Days remaining
  - Required daily/weekly savings
  - On track / Behind / Ahead status

#### 5.3 Goal Allocation
- **Feature:** Split auto-save across multiple goals
- **Example:**
  - Vacation: 50%
  - Emergency: 30%
  - General: 20%
- **Calculation:** Auto-save amount × allocation %

---

### 6. Analytics & Insights

#### 6.1 Dashboard
- **Key Metrics (Month-to-Date):**
  - Total spent
  - Total saved
  - Savings rate (%)
  - Total invested
  - Portfolio value
  - Number of transactions

#### 6.2 Charts & Trends
- **Spending Trend:** Bar chart (last 6 months)
- **Savings Trend:** Line chart (last 30 days)
- **Asset Allocation:** Pie chart (investment distribution)

#### 6.3 Insights (AI-Generated)
- "You're saving 20% more than last month!"
- "Your savings wallet has ₹2,450. Consider investing."
- "You've saved ₹12,340 lifetime. Great progress!"
- "On track for ₹30,000 annual savings."

---

### 7. Notifications

#### 7.1 Push Notifications
**Categories:**
1. **Transactional** (High Priority)
   - Payment success/failure
   - Auto-save credited
   - Investment successful
   - Redemption complete

2. **Informational** (Medium Priority)
   - Daily summary
   - Weekly savings report
   - NAV updates
   - Goal progress

3. **Motivational** (Low Priority)
   - Milestone achievements
   - Savings streaks
   - Tips & insights

4. **Security** (Critical - Cannot Disable)
   - New device login
   - PIN changed
   - Large transactions

#### 7.2 Notification Timing
- **Instant:** Transactions, security
- **Batched:** Daily summary (8 PM), Weekly (Sunday 9 AM)
- **Quiet Hours:** Respect user-set hours (default: 10 PM - 8 AM)

#### 7.3 Channels
- **Push:** All categories
- **SMS:** Transactions, security, OTP
- **Email:** Weekly/monthly reports, KYC status
- **In-App:** All notifications archived

---

## Non-Functional Requirements

### 1. Performance

| Metric | Requirement | Measurement |
|--------|-------------|-------------|
| App Launch Time | < 2 seconds | Cold start on mid-range device |
| API Response Time (p95) | < 500ms | All read APIs |
| API Response Time (p99) | < 1 second | All APIs |
| Payment Processing | < 3 seconds | Initiation to gateway |
| Auto-save Execution | < 5 seconds | Post-payment success |
| App Size | < 50 MB | iOS + Android |
| Memory Usage | < 150 MB | During active use |
| Battery Impact | < 2% | Per hour of active use |

### 2. Scalability

| Metric | Requirement |
|--------|-------------|
| Concurrent Users | 10,000 |
| Transactions/Minute | 1,000 |
| Database Connections | 500 (with pooling) |
| Storage Growth | 50 GB/10,000 users/month |
| Auto-scaling | Horizontal scaling on CPU > 70% |

### 3. Availability & Reliability

| Metric | Requirement |
|--------|-------------|
| Uptime SLA | 99.9% (43 minutes downtime/month max) |
| Planned Maintenance | < 4 hours/month, off-peak hours |
| Data Backup | Daily automated, 30-day retention |
| Point-in-Time Recovery | Up to 7 days |
| Disaster Recovery RPO | < 1 hour (data loss) |
| Disaster Recovery RTO | < 4 hours (recovery time) |

### 4. Security

#### 4.1 Data Encryption
- **In Transit:** TLS 1.3, SSL pinning
- **At Rest:** AES-256 encryption
- **Sensitive Fields:** Additional encryption layer
  - PIN (bcrypt, 10 rounds)
  - Bank details (encrypted before DB storage)
  - PAN/Aadhaar (masked in logs)

#### 4.2 Authentication & Authorization
- **JWT Tokens:**
  - Access token: 15-minute expiry
  - Refresh token: 7-day expiry
  - Token rotation on refresh
- **API Security:**
  - Rate limiting: 100 req/min per user
  - Request signing for sensitive APIs
  - CORS properly configured

#### 4.3 Compliance
- **PCI DSS Level 1:** For payment data
- **RBI Guidelines:** Payment aggregator norms
- **DPDPA:** Data protection and privacy
- **ISO 27001:** Information security (target)

#### 4.4 Security Measures
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF protection (tokens)
- Input validation (server-side)
- Output encoding
- Secrets management (AWS KMS / HashiCorp Vault)
- Security headers (HSTS, CSP, etc.)

### 5. Accessibility

#### 5.1 WCAG 2.1 Level AA Compliance
- Color contrast ratio ≥ 4.5:1
- All images have alt text
- Touch targets ≥ 44×44 pixels
- Keyboard navigation support

#### 5.2 Screen Reader Support
- VoiceOver (iOS)
- TalkBack (Android)
- Proper ARIA labels
- Semantic HTML

#### 5.3 Localization
- **Languages (MVP):** English, Hindi
- **Future:** Tamil, Telugu, Kannada, Bengali, Marathi
- **Number Format:** Indian (₹1,00,000)
- **Date Format:** DD/MM/YYYY

### 6. Platform Requirements

#### 6.1 Mobile App
- **iOS:** 14.0 and above
- **Android:** 8.0 (API 26) and above
- **Devices:**
  - Screen sizes: 4.7" to 6.7"
  - Resolutions: 720p to 1440p

#### 6.2 Backend
- **Technology:** Node.js 18 LTS / Go 1.20+
- **Database:** PostgreSQL 14+
- **Cache:** Redis 7+
- **Message Queue:** RabbitMQ / AWS SQS
- **Object Storage:** AWS S3 / GCS

#### 6.3 Infrastructure
- **Cloud:** AWS / GCP / Azure
- **Container Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** Datadog / New Relic
- **Logging:** ELK Stack / Loki

---

## User Experience Requirements

### 1. Onboarding Flow
**Time to First Value:** < 3 minutes

1. Welcome screen (5 sec)
2. Registration (60 sec)
3. Profile creation (30 sec)
4. PIN setup (20 sec)
5. Tutorial (30 sec, skippable)
6. Auto-save configuration (20 sec)
7. First payment (user-driven)

**Drop-off Prevention:**
- Progress indicator at each step
- Save partial data
- Resume from last step
- Skip optional steps

### 2. Design Principles

#### 2.1 Visual Design
- **Color Palette:**
  - Primary: Green (savings, growth)
  - Secondary: Blue (trust, security)
  - Accent: Orange (actions, CTAs)
  - Neutral: Grays for text
- **Typography:**
  - Headings: Inter Bold
  - Body: Inter Regular
  - Numbers: Tabular figures for alignment
- **Iconography:** Custom icon set, consistent style

#### 2.2 Interaction Design
- **Feedback:**
  - Instant visual feedback on all taps
  - Haptic feedback on important actions
  - Loading states for async operations
  - Success/error animations
- **Gestures:**
  - Pull-to-refresh for lists
  - Swipe for secondary actions
  - Pinch-to-zoom for charts (optional)

#### 2.3 Information Architecture
```
Home (Dashboard)
├── Pay (QR/UPI ID)
├── Transactions (History + Details)
├── Savings
│   ├── Wallet
│   ├── Goals
│   └── Settings
├── Investments
│   ├── Portfolio
│   ├── Explore Products
│   └── Auto-Invest
├── Analytics
└── Profile & Settings
    ├── Personal Info
    ├── KYC Status
    ├── Security
    ├── Notifications
    └── Help & Support
```

### 3. Error Handling

#### 3.1 User-Facing Errors
- **Tone:** Friendly, helpful, non-technical
- **Components:**
  - Clear explanation of what went wrong
  - What user can do next
  - Support contact (if needed)

**Examples:**
- ❌ "Error 500: Internal Server Error"
- ✅ "Oops! Something went wrong. Please try again. If issue persists, contact support."

#### 3.2 Error Recovery
- Auto-retry for network errors (3 attempts, exponential backoff)
- Cached data for offline viewing
- Queue actions when offline, sync when online

---

## Data Model

### Key Entities

#### 1. User
```
{
  id: UUID,
  mobile: String (unique, indexed),
  email: String (unique),
  name: String,
  dob: Date,
  profilePhoto: String (URL),
  pin: String (hashed),
  biometricEnabled: Boolean,
  kycStatus: Enum (PENDING, APPROVED, REJECTED),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 2. SavingsConfig
```
{
  userId: UUID (FK),
  enabled: Boolean,
  percentage: Number (1-50),
  minTransactionAmount: Number,
  maxSavingsPerTransaction: Number (nullable),
  frequency: Enum (EVERY, DAILY, WEEKLY)
}
```

#### 3. SavingsWallet
```
{
  userId: UUID (FK),
  balance: Decimal (2 precision),
  totalSaved: Decimal,
  totalWithdrawn: Decimal,
  totalInvested: Decimal,
  lastUpdated: Timestamp
}
```

#### 4. Transaction
```
{
  id: UUID,
  userId: UUID (FK),
  type: Enum (PAYMENT, DEPOSIT, WITHDRAWAL),
  amount: Decimal,
  status: Enum (SUCCESS, FAILED, PENDING),
  merchantName: String,
  utr: String,
  paymentGatewayId: String,
  autoSaveAmount: Decimal,
  createdAt: Timestamp
}
```

#### 5. Investment
```
{
  id: UUID,
  userId: UUID (FK),
  productId: UUID (FK),
  amountInvested: Decimal,
  units: Decimal,
  nav: Decimal,
  currentValue: Decimal,
  returns: Decimal,
  status: Enum (ACTIVE, REDEEMED),
  purchaseDate: Date,
  redemptionDate: Date (nullable)
}
```

#### 6. Goal
```
{
  id: UUID,
  userId: UUID (FK),
  name: String,
  targetAmount: Decimal,
  currentAmount: Decimal,
  targetDate: Date,
  priority: Enum (HIGH, MEDIUM, LOW),
  imageUrl: String,
  allocationPercentage: Number,
  status: Enum (ACTIVE, ACHIEVED, ARCHIVED)
}
```

---

## API Specifications

### Base URL
```
Production: https://api.saveinvest.app/v1
Staging: https://api-staging.saveinvest.app/v1
```

### Authentication
```
Header: Authorization: Bearer <JWT_TOKEN>
```

### Key Endpoints

#### Authentication
```
POST /auth/register
POST /auth/send-otp
POST /auth/verify-otp
POST /auth/login
POST /auth/refresh-token
POST /auth/logout
```

#### User Management
```
GET    /users/profile
PUT    /users/profile
POST   /users/kyc
GET    /users/kyc-status
PUT    /users/pin
```

#### Payments
```
POST   /payments/initiate
POST   /payments/verify
GET    /payments/history
GET    /payments/:id
POST   /payments/webhook
POST   /payments/:id/receipt
```

#### Savings
```
GET    /savings/wallet
GET    /savings/config
PUT    /savings/config
GET    /savings/history
POST   /savings/deposit
POST   /savings/withdraw
GET    /savings/analytics
POST   /savings/goals
GET    /savings/goals
PUT    /savings/goals/:id
DELETE /savings/goals/:id
```

#### Investments
```
GET    /investments/products
GET    /investments/products/:id
POST   /investments/purchase
GET    /investments/portfolio
GET    /investments/holdings
GET    /investments/holdings/:id
POST   /investments/redeem
GET    /investments/transactions
POST   /investments/auto-invest
GET    /investments/auto-invest
PUT    /investments/auto-invest/:id
DELETE /investments/auto-invest/:id
```

#### Analytics
```
GET    /analytics/dashboard
GET    /analytics/spending
GET    /analytics/savings
GET    /analytics/investments
```

#### Notifications
```
GET    /notifications
PUT    /notifications/:id/read
GET    /users/notification-preferences
PUT    /users/notification-preferences
```

---

## Third-Party Integrations

### 1. Payment Gateway
- **Provider:** Razorpay
- **Integration:** REST API + Webhooks
- **Features Used:** UPI, Payment verification, Refunds
- **Cost:** ~2% per transaction
- **SLA:** 99.9% uptime

### 2. KYC Services
- **PAN Verification:** NSDL API / Income Tax API
- **Aadhaar:** DigiLocker API
- **Face Matching:** AWS Rekognition / custom ML model
- **Bank Verification:** Penny drop via Razorpay/Cashfree

### 3. Investment Platform
- **Option 1:** BSE Star MF (Direct AMC integration)
- **Option 2:** Kuvera API / INDMoney White-label
- **Option 3:** In-house integration with individual AMCs

### 4. SMS Gateway
- **Provider:** Twilio / AWS SNS / MSG91
- **Use Cases:** OTP, transaction alerts, security
- **Volume:** ~5 SMS per user/month
- **Cost:** ₹0.20 per SMS

### 5. Email Service
- **Provider:** SendGrid / AWS SES
- **Use Cases:** Reports, KYC status, summaries
- **Volume:** ~10 emails per user/month
- **Cost:** Negligible (free tier sufficient)

### 6. Push Notifications
- **Provider:** Firebase Cloud Messaging (FCM)
- **Platforms:** iOS + Android
- **Cost:** Free

### 7. Analytics
- **Provider:** Mixpanel / Amplitude
- **Events:** ~50 events tracked
- **Cost:** Free tier → $999/month (as scale grows)

### 8. Monitoring
- **APM:** Datadog / New Relic
- **Logging:** ELK / Loki
- **Error Tracking:** Sentry
- **Cost:** ~$500/month

---

## Business Model

### Revenue Streams

#### 1. Investment Commissions (Primary)
- **Source:** Mutual fund houses pay 0.25% - 1% trailing commission
- **Example:** User invests ₹10,000 → Annual commission ₹25-100
- **Projected:** ₹25 Cr invested in Year 1 → ₹6.25L - 25L revenue

#### 2. Interest on Float
- **Source:** Savings wallet balance earns interest
- **Example:** Average ₹5 Cr float at 4% = ₹20L/year interest
- **Share with Users:** 50-50 split or full retention (TBD based on regulations)

#### 3. Premium Subscription (Future)
- **Price:** ₹99-199/month or ₹999-1,999/year
- **Features:**
  - Higher investment limits
  - Advanced analytics
  - Tax optimization tools
  - Priority support
- **Target:** 5% conversion → 2,500 users × ₹1,200/year = ₹30L

#### 4. Referral Partnerships
- **Partners:** Insurance, loans, credit cards
- **Commission:** ₹200-1,000 per conversion
- **Volume:** 1,000 conversions/year = ₹5L-10L

#### 5. Advertisement (Minimal)
- **Type:** Non-intrusive, financial products only
- **Placement:** Explore section, insights
- **Revenue:** ₹1-2L/year (de-prioritized)

### Cost Structure

#### Fixed Costs (Monthly)
| Item | Cost |
|------|------|
| Team Salaries (7 members) | ₹15,00,000 |
| Cloud Infrastructure | ₹1,50,000 |
| Third-party Services | ₹1,00,000 |
| Office & Operations | ₹2,00,000 |
| **Total Fixed** | **₹19,50,000** |

#### Variable Costs (Per User)
| Item | Cost |
|------|------|
| Payment Gateway (2% × ₹5,000/month) | ₹100 |
| SMS (5 × ₹0.20) | ₹1 |
| Email | ₹0 (free tier) |
| KYC (one-time) | ₹50 |
| **Total Variable** | **₹151/user** |

### Unit Economics

**Assumptions:**
- Average user makes ₹5,000 in payments/month
- 15% save percentage = ₹750 saved/month
- 50% of savings invested = ₹375 invested/month = ₹4,500/year
- Investment commission: 0.5% = ₹22.50/user/year

**Conclusion:** Need aggregation at scale. 10,000 active investors = ₹2.25L/year from commissions alone.

---

## Go-to-Market Strategy

### Phase 1: Beta Launch (Month 1)
- **Target:** 500 users (employees, friends, family)
- **Goal:** Test core functionality, gather feedback
- **Channels:** Direct invites, WhatsApp groups

### Phase 2: Soft Launch (Months 2-3)
- **Target:** 5,000 users (Bangalore, Mumbai, Delhi)
- **Goal:** Validate product-market fit
- **Channels:**
  - App Store Optimization (ASO)
  - Personal finance Instagram influencers (₹50K budget)
  - Google Ads (₹1L budget)
  - Referral program (₹100 bonus for both)

### Phase 3: Public Launch (Month 4)
- **Target:** 50,000 users (Pan-India)
- **Goal:** Scale user acquisition
- **Channels:**
  - Facebook/Instagram Ads (₹5L/month)
  - YouTube creators (₹2L)
  - PR & Press releases
  - Content marketing (blogs, videos)
  - SEO
  - Partnerships with salary platforms

### Referral Program
- **Incentive:** ₹100 for referrer + ₹100 for referee (credited to savings wallet)
- **Condition:** Referee completes first payment with auto-save
- **Limit:** Max ₹1,000 per user
- **Virality Target:** K-factor > 0.5

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Payment gateway downtime | Medium | High | Secondary gateway (Cashfree), retry logic |
| Database failure | Low | Critical | Daily backups, multi-AZ deployment, replicas |
| Security breach | Low | Critical | Penetration testing, bug bounty, encryption |
| App crashes | Medium | High | Robust error handling, monitoring, rollback |
| Scalability issues | Medium | Medium | Load testing, auto-scaling, performance monitoring |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user adoption | Medium | Critical | MVP validation, user research, pivot if needed |
| High churn | Medium | High | Engagement features, notifications, customer support |
| Regulatory changes | Medium | High | Legal consultation, compliance monitoring |
| Competition | High | Medium | Unique features, superior UX, community building |
| Revenue shortfall | Medium | High | Multiple revenue streams, cost optimization |

### Compliance Risks

| Risk | Mitigation |
|------|------------|
| RBI regulations | Consult fintech lawyers, obtain necessary licenses |
| Data protection laws | DPDPA compliance, privacy by design |
| Investment advisory | Clear disclaimers, SEBI guidelines (if needed) |
| Tax implications | Transparent reporting, CA consultation |

---

## Success Criteria

### MVP Launch (Month 4)

#### Product Metrics
- ✅ All P0 features delivered
- ✅ App Store rating ≥ 4.0
- ✅ Crash rate < 1%
- ✅ Payment success rate > 95%
- ✅ Auto-save execution rate > 99%

#### User Metrics
- ✅ 1,000 registered users
- ✅ 500 monthly active users
- ✅ 30% activation rate (completed first payment)
- ✅ 20% enabled auto-save
- ✅ 5% made first investment
- ✅ Churn < 30% (first month)

#### Business Metrics
- ✅ ₹10 Lakh in total payments processed
- ✅ ₹1 Lakh in total savings accumulated
- ✅ ₹25,000 in total investments made
- ✅ CAC < ₹500
- ✅ 80% of users acquired organically (post-beta)

### Year 1 Goals

- 100,000 registered users
- 50,000 monthly active users
- ₹50 Crore in total savings
- ₹25 Crore in total investments
- 4.5+ App Store rating
- 60% user retention (6-month cohort)
- ₹1 Crore revenue
- Break-even on variable costs

---

## Development Timeline

### Months 1-2: Foundation
- Week 1-2: Infrastructure setup, team onboarding
- Week 3-4: Authentication & user management
- **Milestone:** Users can register and login

### Months 3-4: Core Features
- Week 5: KYC integration
- Week 6-7: UPI payment integration
- Week 8-9: Auto-save & savings wallet
- **Milestone:** Users can make payments and auto-save

### Months 5-6: Investments
- Week 10-11: Investment product integration
- Week 12: Portfolio management
- **Milestone:** Users can invest from savings

### Months 7-8: Polish & Launch
- Week 13: Notifications & analytics
- Week 14-15: Testing, security audit
- Week 16: Beta launch
- Week 17-18: Soft launch & iteration
- Week 19: Public launch
- **Milestone:** MVP live in production

---

## Appendix

### A. Glossary
- **Auto-Save:** Automated transfer of a percentage of payment to savings wallet
- **NAV:** Net Asset Value (price per unit of mutual fund)
- **KYC:** Know Your Customer (identity verification)
- **UPI:** Unified Payments Interface
- **UTR:** Unique Transaction Reference
- **XIRR:** Extended Internal Rate of Return (annualized return considering timing)
- **SIP:** Systematic Investment Plan
- **AMC:** Asset Management Company

### B. Acronyms
- **MVP:** Minimum Viable Product
- **PRD:** Product Requirements Document
- **BDD:** Behavior-Driven Development
- **P0/P1/P2:** Priority levels (0 = Must Have, 1 = Should Have, 2 = Nice to Have)
- **KPI:** Key Performance Indicator
- **CAC:** Customer Acquisition Cost
- **LTV:** Lifetime Value
- **CAGR:** Compound Annual Growth Rate
- **RPO/RTO:** Recovery Point/Time Objective

### C. References
- [RBI Payment Aggregator Guidelines](https://www.rbi.org.in/)
- [NPCI UPI Guidelines](https://www.npci.org.in/what-we-do/upi)
- [SEBI Investment Advisor Regulations](https://www.sebi.gov.in/)
- [DPDPA - Digital Personal Data Protection Act](https://www.meity.gov.in/)
- [PCI DSS Standards](https://www.pcisecuritystandards.org/)

### D. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 21 Oct 2025 | Product Team | Initial draft |

---

## Approval & Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | | | |
| Engineering Lead | | | |
| Design Lead | | | |
| CTO | | | |
| CEO | | | |

---

**END OF DOCUMENT**
