# User Flows & Process Documentation

## 1. User Authentication & Authorization Flows

### 1.1 User Registration Flow

```
START → Mobile App Launch (First Time)
  ↓
Welcome Screen
  ↓
Tap "Get Started"
  ↓
Enter Mobile Number
  ↓
[Mobile Input Validation]
  ├─ Invalid → Show Error → Return to Input
  └─ Valid → Continue
      ↓
Tap "Send OTP"
  ↓
[Backend: Generate OTP & Send SMS]
  ↓
OTP Entry Screen (6-digit)
  ├─ Auto-detect SMS (Android)
  └─ Manual Entry
      ↓
Enter OTP
  ↓
[OTP Validation]
  ├─ Invalid → Show Error → Allow Resend
  └─ Valid → Continue
      ↓
Create Profile Screen
  ├─ Enter Full Name (required)
  ├─ Enter Email (required)
  ├─ Enter Date of Birth (required)
  └─ Upload Photo (optional)
      ↓
Tap "Continue"
  ↓
Create PIN Screen
  ↓
Enter 4-6 Digit PIN
  ↓
Re-enter PIN for Confirmation
  ↓
[PIN Validation]
  ├─ Mismatch → Show Error → Re-enter
  └─ Match → Continue
      ↓
Biometric Setup Screen
  ├─ Enable Biometric → Register Fingerprint/Face
  └─ Skip → Continue
      ↓
[Backend: Create User Account]
  ↓
Onboarding Tutorial (5 screens)
  ├─ Swipe through features
  └─ Tap "Get Started"
      ↓
KYC Prompt Screen
  ├─ "Complete Now" → Go to KYC Flow
  └─ "Later" → Home Dashboard (Limited Access)
      ↓
END
```

**API Calls:**
- `POST /auth/register` - Create user account
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /users/profile` - Create profile
- `POST /auth/set-pin` - Set PIN

**Success Criteria:**
- User account created
- JWT token issued
- User redirected to home/KYC

**Error Handling:**
- OTP expired (120 seconds) → Allow resend
- OTP attempts exceeded (3) → Temporary block (5 minutes)
- Network error → Retry mechanism
- Server error → Show error message with support contact

---

### 1.2 User Login Flow

```
START → App Launch (Returning User)
  ↓
Splash Screen (Check session)
  ↓
[Session Valid?]
  ├─ Yes → Home Dashboard
  └─ No → Login Screen
      ↓
Login Options:
  ├─ Option 1: PIN Login
  │   ↓
  │   Enter PIN
  │   ↓
  │   [PIN Validation]
  │   ├─ Correct → Home Dashboard
  │   └─ Incorrect → Show Error
  │       ├─ Attempts < 3 → Retry
  │       └─ Attempts = 3 → Account Locked (30 min)
  │
  ├─ Option 2: Biometric Login
  │   ↓
  │   Fingerprint/Face Scan
  │   ↓
  │   [Biometric Validation]
  │   ├─ Success → Home Dashboard
  │   └─ Failed → Fallback to PIN
  │
  └─ Option 3: OTP Login
      ↓
      Enter Mobile Number
      ↓
      Tap "Send OTP"
      ↓
      Enter OTP
      ↓
      [OTP Validation]
      ├─ Valid → Home Dashboard
      └─ Invalid → Show Error → Retry
      ↓
END
```

**API Calls:**
- `POST /auth/login` - Login with PIN
- `POST /auth/send-otp` - Send OTP for login
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/refresh-token` - Refresh JWT token
- `GET /users/profile` - Fetch user data

**Security Features:**
- PIN attempts limited (3)
- Account lockout after failed attempts
- Device fingerprinting
- Session timeout (30 minutes inactive)

---

### 1.3 KYC Flow

```
START → KYC Entry Point
  ├─ From: Registration
  ├─ From: Home Dashboard
  └─ From: Investment Attempt (Mandatory)
      ↓
KYC Introduction Screen
  ↓
Tap "Start KYC"
  ↓
Step 1: PAN Card Verification
  ├─ Enter PAN Number (Manual)
  │   ↓
  │   [PAN Format Validation]
  │   └─ Call PAN Verification API
  └─ Upload PAN Card Image
      ↓
[Backend: Verify PAN with NSDL/Income Tax]
  ├─ Valid → Continue
  └─ Invalid → Show Error → Retry
      ↓
Step 2: Aadhaar Verification
  ├─ Option 1: DigiLocker (Recommended)
  │   ↓
  │   Redirect to DigiLocker
  │   ↓
  │   User Login & Authorize
  │   ↓
  │   Fetch Aadhaar XML
  │   ↓
  │   Auto-fill Details
  │
  └─ Option 2: Manual Entry
      ↓
      Enter Aadhaar Number
      ↓
      Send OTP to Aadhaar-linked Mobile
      ↓
      Verify OTP
      ↓
[Backend: eKYC Verification]
  ↓
Step 3: Address Verification
  ├─ Use Aadhaar Address (Auto-filled)
  └─ Edit if needed
      ↓
Step 4: Live Photo/Selfie
  ↓
Open Camera
  ↓
Capture Photo
  ↓
[Face Match with PAN/Aadhaar Photo]
  ├─ Match → Continue
  └─ No Match → Retry (max 3 attempts)
      ↓
Step 5: Bank Account Verification
  ↓
Enter Bank Details:
  ├─ Account Number
  ├─ IFSC Code
  ├─ Account Holder Name
  └─ Account Type
      ↓
[Backend: Penny Drop Verification]
  ├─ Deposit ₹1
  └─ Verify account ownership
      ↓
Review All Details Screen
  ↓
Tap "Submit KYC"
  ↓
[Backend: Submit to KYC Agency]
  ↓
KYC Under Review Screen
  ↓
[Wait for Approval: 24-48 hours]
  ↓
KYC Status:
  ├─ Approved → Full Access Unlocked
  ├─ Rejected → Show Reason → Retry
  └─ Pending → Wait
      ↓
END
```

**API Calls:**
- `POST /users/kyc/pan` - Submit PAN
- `POST /users/kyc/aadhaar` - Submit Aadhaar
- `POST /users/kyc/photo` - Upload selfie
- `POST /users/kyc/bank` - Verify bank account
- `POST /users/kyc/submit` - Final submission
- `GET /users/kyc-status` - Check KYC status

**KYC States:**
- Not Started
- In Progress
- Under Review
- Approved
- Rejected

---

## 2. UPI Payment Flows

### 2.1 Make UPI Payment Flow

```
START → Home Dashboard
  ↓
Tap "Pay" or "Send Money"
  ↓
Payment Method Selection:
  ├─ Scan QR Code
  ├─ Enter UPI ID
  ├─ Enter Mobile Number
  └─ Select from Contacts
      ↓
[Flow: Scan QR Code]
  ↓
Open Camera
  ↓
Scan Merchant QR
  ↓
[QR Data Parsed]
  ├─ UPI ID extracted
  └─ Amount pre-filled (if in QR)
      ↓
Payment Details Screen:
  ├─ Merchant Name (from UPI ID)
  ├─ Amount (editable if not fixed)
  ├─ Note/Description (optional)
  └─ Current Savings Percentage Display
      ↓
Auto-Save Preview Card:
  ├─ "You're paying: ₹1,000"
  ├─ "You'll save: ₹100 (10%)"
  └─ "New savings balance: ₹2,100"
      ↓
Select Payment Account:
  ├─ Bank Account 1 (Default)
  ├─ Bank Account 2
  └─ UPI ID selection
      ↓
Tap "Pay ₹1,000"
  ↓
Authentication:
  ├─ Option 1: Enter UPI PIN
  └─ Option 2: Biometric (if enabled)
      ↓
[Backend: Initiate Payment]
  ↓
Payment Processing Screen
  ├─ Show loading animation
  └─ "Processing your payment..."
      ↓
[Payment Gateway API Call]
  ↓
[UPI Network Processing]
  ↓
Payment Result:
  ├─ SUCCESS
  │   ↓
  │   Success Screen
  │   ├─ ✓ Payment Successful
  │   ├─ Amount: ₹1,000
  │   ├─ To: Merchant Name
  │   ├─ UTR: XXXXXXXXXXXX
  │   ├─ Timestamp
  │   ├─ "₹100 added to savings!"
  │   └─ Actions:
  │       ├─ Download Receipt
  │       ├─ Share Receipt
  │       └─ Done → Home
  │   ↓
  │   [Backend: Trigger Auto-Save]
  │   ↓
  │   [Credit ₹100 to Savings Wallet]
  │   ↓
  │   Push Notification: "₹100 saved!"
  │
  ├─ FAILED
  │   ↓
  │   Failure Screen
  │   ├─ ✗ Payment Failed
  │   ├─ Reason: [Error Message]
  │   └─ Actions:
  │       ├─ Retry Payment
  │       ├─ Contact Support
  │       └─ Back to Home
  │
  └─ PENDING
      ↓
      Pending Screen
      ├─ ⏳ Payment Pending
      ├─ "This may take a few minutes"
      └─ [Backend: Webhook monitoring]
          ↓
          Final Status Update
          ↓
END
```

**API Calls:**
- `POST /payments/initiate` - Start payment
- `POST /payments/verify` - Verify payment status
- `GET /payments/:id` - Get payment details
- `POST /payments/webhook` - Receive payment gateway updates

**Auto-Save Trigger:**
- Payment Success → Event Emitted
- Savings Service Listens → Calculate Savings
- Credit to Wallet → Send Notification

---

### 2.2 Transaction History Flow

```
START → Home Dashboard
  ↓
Tap "Transactions" or "History"
  ↓
Transaction List Screen:
  ├─ Search Bar (top)
  ├─ Filter Button
  └─ Transaction Cards (chronological)
      ↓
Filter Options:
  ├─ Date Range
  │   ├─ Today
  │   ├─ Last 7 days
  │   ├─ Last 30 days
  │   └─ Custom range
  ├─ Type
  │   ├─ Sent
  │   ├─ Received
  │   ├─ Savings
  │   └─ Investments
  ├─ Status
  │   ├─ Success
  │   ├─ Failed
  │   └─ Pending
  └─ Amount Range
      ├─ < ₹100
      ├─ ₹100 - ₹1,000
      └─ > ₹1,000
      ↓
Apply Filters → Filtered List
  ↓
Tap on Transaction Card
  ↓
Transaction Detail Screen:
  ├─ Transaction ID
  ├─ UTR Number
  ├─ Timestamp
  ├─ Amount
  ├─ From/To
  ├─ Payment Method
  ├─ Status
  ├─ Associated Savings (if any)
  │   └─ "₹100 saved from this transaction"
  └─ Actions:
      ├─ Download Receipt (PDF)
      ├─ Share Receipt
      ├─ Report Issue
      └─ Repeat Payment (if merchant)
      ↓
END
```

**API Calls:**
- `GET /payments/history?filters={}` - Get transaction list
- `GET /payments/:id` - Get transaction details
- `POST /payments/:id/receipt` - Generate receipt

---

## 3. Automated Savings Flows

### 3.1 Configure Savings Percentage Flow

```
START → Home Dashboard
  ↓
Tap "Savings" or "Settings"
  ↓
Savings Configuration Screen:
  ├─ Current Savings Percentage: 10%
  ├─ Enable/Disable Toggle
  └─ Configure Button
      ↓
Tap "Configure"
  ↓
Savings Settings Screen:
  ↓
1. Percentage Slider
   ├─ Range: 1% - 50%
   ├─ Visual Preview
   │   └─ "On ₹1,000: Save ₹100"
   └─ Drag to adjust
       ↓
2. Minimum Transaction Amount
   ├─ "Auto-save only if payment > ₹X"
   ├─ Input field
   └─ Default: ₹10
       ↓
3. Maximum Savings Per Transaction
   ├─ "Cap savings at ₹X per transaction"
   ├─ Input field
   └─ Optional
       ↓
4. Savings Frequency
   ├─ ○ Every transaction (Default)
   ├─ ○ Daily (once per day)
   └─ ○ Weekly (once per week)
       ↓
Preview Card:
  ├─ "With these settings:"
  ├─ "₹1,000 payment → ₹100 saved"
  ├─ "₹50 payment → ₹0 saved (below minimum)"
  └─ "₹10,000 payment → ₹500 saved (capped)"
      ↓
Tap "Save Settings"
  ↓
[Backend: Update User Config]
  ↓
Success Message: "Settings updated!"
  ↓
Return to Dashboard
  ↓
END
```

**API Calls:**
- `GET /savings/config` - Get current config
- `PUT /savings/config` - Update config

**Config Object:**
```json
{
  "enabled": true,
  "percentage": 10,
  "minTransactionAmount": 10,
  "maxSavingsPerTransaction": 500,
  "frequency": "every_transaction"
}
```

---

### 3.2 Savings Wallet Flow

```
START → Home Dashboard
  ↓
Tap "Savings Wallet"
  ↓
Savings Wallet Screen:
  ├─ Balance Card
  │   ├─ Current Balance: ₹2,450
  │   ├─ Total Saved (Lifetime): ₹12,340
  │   ├─ This Month: ₹850
  │   └─ Savings Streak: 15 days 🔥
  │
  ├─ Quick Actions
  │   ├─ [Add Money]
  │   ├─ [Invest Now]
  │   └─ [Withdraw]
  │
  ├─ Analytics Section
  │   ├─ Savings Trend Graph (7/30 days)
  │   ├─ Average Per Transaction
  │   └─ Projected Annual Savings
  │
  └─ Recent Savings Transactions
      ├─ Auto-saved ₹100 (from payment)
      ├─ Manual deposit ₹500
      └─ Invested ₹1,000
      ↓
Tap "Add Money"
  ↓
Add Money to Savings:
  ├─ Enter Amount
  ├─ Select Payment Method
  │   ├─ UPI
  │   ├─ Bank Transfer
  │   └─ Auto-debit (recurring)
  └─ Tap "Add"
      ↓
[Payment Flow]
  ↓
Success → Balance Updated
  ↓
Tap "Withdraw"
  ↓
Withdraw Money:
  ├─ Enter Amount
  ├─ Select Bank Account
  ├─ Note: "Withdrawal in 1-2 business days"
  └─ Tap "Withdraw"
      ↓
[Backend: Initiate Withdrawal]
  ↓
Confirmation → Balance Reduced
  ↓
END
```

**API Calls:**
- `GET /savings/wallet` - Get wallet balance & stats
- `GET /savings/history` - Get savings transactions
- `POST /savings/deposit` - Add money
- `POST /savings/withdraw` - Withdraw money
- `GET /savings/analytics` - Get analytics data

---

### 3.3 Savings Goals Flow

```
START → Savings Wallet
  ↓
Tap "Create Goal"
  ↓
Create Goal Screen:
  ↓
1. Goal Name
   └─ Input: "Vacation Fund"
       ↓
2. Target Amount
   └─ Input: ₹50,000
       ↓
3. Target Date
   └─ Date Picker: 31/12/2025
       ↓
4. Goal Image
   ├─ Select from gallery
   └─ Choose icon
       ↓
5. Priority
   ├─ ○ High
   ├─ ● Medium
   └─ ○ Low
       ↓
Preview:
  ├─ Goal: Vacation Fund
  ├─ Target: ₹50,000 by Dec 2025
  ├─ Time remaining: 250 days
  ├─ Required daily savings: ₹200
  └─ Based on current rate: On track ✓
      ↓
Tap "Create Goal"
  ↓
[Backend: Create Goal]
  ↓
Goal Created!
  ↓
Goal Tracking Screen:
  ├─ Progress Bar (25% - ₹12,500 / ₹50,000)
  ├─ Days Remaining: 250
  ├─ Amount Remaining: ₹37,500
  ├─ Daily Target: ₹200
  ├─ Current Pace: ₹150/day (Below target)
  │
  └─ Actions:
      ├─ Add Money to Goal
      ├─ Edit Goal
      └─ Delete Goal
      ↓
Allocate Savings to Goals:
  ├─ "Split auto-savings across goals"
  ├─ Vacation Fund: 50%
  ├─ Emergency Fund: 30%
  └─ General Savings: 20%
      ↓
[Auto-save triggers]
  ↓
₹100 saved → Allocated:
  ├─ Vacation: ₹50
  ├─ Emergency: ₹30
  └─ General: ₹20
      ↓
Goal progress updated in real-time
  ↓
When goal reached:
  ↓
🎉 Goal Achieved Notification
  ├─ Congratulations screen
  ├─ Confetti animation
  └─ Options:
      ├─ Withdraw to bank
      ├─ Invest
      └─ Create new goal
      ↓
END
```

**API Calls:**
- `POST /savings/goals` - Create goal
- `GET /savings/goals` - List all goals
- `PUT /savings/goals/:id` - Update goal
- `DELETE /savings/goals/:id` - Delete goal
- `PUT /savings/goals/allocations` - Set goal allocations

---

## 4. Investment Flows

### 4.1 Browse & Select Investment Flow

```
START → Home Dashboard
  ↓
Tap "Invest" or "Investments"
  ↓
Investment Dashboard:
  ├─ Portfolio Overview (if exists)
  │   ├─ Total Invested: ₹5,000
  │   ├─ Current Value: ₹5,250
  │   └─ Returns: +₹250 (+5%)
  │
  └─ Available Balance in Savings: ₹2,450
      ↓
Tap "Explore Products" or "Invest Now"
  ↓
Investment Products List:
  ├─ Filter/Sort Bar
  │   ├─ Risk Level (Low/Medium/High)
  │   ├─ Category (Liquid/Debt/Equity)
  │   └─ Returns (Sort by)
  │
  └─ Product Cards
      ├─ Liquid Fund A
      │   ├─ Risk: Low
      │   ├─ Returns: 4.5% p.a.
      │   ├─ Minimum: ₹100
      │   └─ Liquidity: Instant
      │
      ├─ Debt Fund B
      │   ├─ Risk: Low-Medium
      │   ├─ Returns: 7.2% p.a.
      │   ├─ Minimum: ₹500
      │   └─ Lock-in: None
      │
      └─ Digital Gold
          ├─ Risk: Medium
          ├─ Current Price: ₹6,250/g
          ├─ Minimum: ₹10
          └─ Liquidity: Instant
      ↓
Tap on Product Card
  ↓
Product Detail Screen:
  ├─ Fund Name & Logo
  ├─ NAV: ₹12.45
  ├─ Returns
  │   ├─ 1 Year: 5.2%
  │   ├─ 3 Year: 6.1%
  │   └─ 5 Year: 7.8%
  ├─ Performance Graph
  ├─ Fund Details
  │   ├─ Category
  │   ├─ Risk Level
  │   ├─ Fund Size
  │   ├─ Expense Ratio
  │   └─ Exit Load
  ├─ About Fund (description)
  └─ Actions:
      ├─ [Invest Now]
      └─ [Add to Watchlist]
      ↓
END (Continue to Investment Purchase Flow)
```

**API Calls:**
- `GET /investments/products` - List available products
- `GET /investments/products/:id` - Product details
- `GET /investments/products/:id/performance` - Historical data

---

### 4.2 Purchase Investment Flow

```
START → Product Detail Screen
  ↓
Tap "Invest Now"
  ↓
Investment Amount Screen:
  ├─ Available in Savings: ₹2,450
  ├─ Minimum Investment: ₹500
  └─ Enter Amount: [Input Field]
      ↓
Enter ₹1,000
  ↓
[Validation]
  ├─ < Minimum → Error: "Minimum ₹500"
  ├─ > Available → Error: "Insufficient balance"
  └─ Valid → Continue
      ↓
Investment Preview:
  ├─ Fund: Liquid Fund A
  ├─ Amount: ₹1,000
  ├─ NAV: ₹12.45
  ├─ Estimated Units: 80.32
  ├─ Payment from: Savings Wallet
  ├─ New Savings Balance: ₹1,450
  └─ Note: "NAV updated at end of day"
      ↓
Tap "Confirm Investment"
  ↓
Authentication:
  ├─ Enter PIN
  └─ Or Biometric
      ↓
[Backend: Process Investment]
  ├─ Deduct from savings wallet
  ├─ Call Investment Platform API
  └─ Create transaction record
      ↓
Processing Screen
  ├─ "Processing your investment..."
  └─ Loading animation
      ↓
Investment Status:
  ├─ SUCCESS
  │   ↓
  │   Success Screen
  │   ├─ ✓ Investment Successful
  │   ├─ Amount: ₹1,000
  │   ├─ Fund: Liquid Fund A
  │   ├─ Units: 80.32 (estimated)
  │   ├─ Order ID: XXXXX
  │   └─ "Units will be credited in 1-2 days"
  │       ↓
  │   Actions:
  │   ├─ View Portfolio
  │   ├─ Invest More
  │   └─ Done
  │
  └─ FAILED
      ↓
      Error Screen
      ├─ Reason
      ├─ Amount refunded to savings
      └─ Actions:
          ├─ Retry
          └─ Contact Support
      ↓
Push Notification: "Investment successful!"
  ↓
END
```

**API Calls:**
- `POST /investments/purchase` - Buy investment
- `POST /investments/verify` - Verify purchase
- `GET /investments/orders/:id` - Check order status

---

### 4.3 Portfolio Management Flow

```
START → Investments Tab
  ↓
Portfolio Screen:
  ├─ Summary Cards
  │   ├─ Total Invested: ₹5,000
  │   ├─ Current Value: ₹5,250
  │   ├─ Total Returns: +₹250
  │   ├─ Returns %: +5%
  │   └─ Today's Change: +₹15 (+0.3%)
  │
  ├─ Asset Allocation (Pie Chart)
  │   ├─ Liquid Funds: 40%
  │   ├─ Debt Funds: 40%
  │   └─ Digital Gold: 20%
  │
  └─ Holdings List
      ├─ Liquid Fund A
      │   ├─ Invested: ₹2,000
      │   ├─ Current: ₹2,100
      │   ├─ Returns: +₹100 (+5%)
      │   └─ Units: 160.64
      │
      ├─ Debt Fund B
      │   ├─ Invested: ₹2,000
      │   ├─ Current: ₹2,080
      │   └─ Returns: +₹80 (+4%)
      │
      └─ Digital Gold
          ├─ Invested: ₹1,000
          ├─ Current: ₹1,070
          └─ Returns: +₹70 (+7%)
      ↓
Tap on Holding
  ↓
Holding Detail Screen:
  ├─ Fund Name
  ├─ Current Value: ₹2,100
  ├─ Invested Amount: ₹2,000
  ├─ Returns: +₹100 (+5%)
  ├─ Units Held: 160.64
  ├─ Average NAV: ₹12.45
  ├─ Current NAV: ₹13.07
  ├─ Performance Graph
  ├─ Purchase History
  │   ├─ 01/10/2025: ₹1,000 (80.32 units)
  │   └─ 15/10/2025: ₹1,000 (80.32 units)
  │
  └─ Actions:
      ├─ [Invest More]
      └─ [Redeem]
      ↓
Tap "Redeem"
  ↓
Redemption Screen:
  ├─ Available Units: 160.64
  ├─ Current NAV: ₹13.07
  ├─ Redemption Options:
  │   ├─ ○ Full Redemption (₹2,100)
  │   └─ ● Partial Redemption
  │       └─ Enter Units or Amount
  │
  └─ Enter Amount: ₹1,000
      ↓
Redemption Preview:
  ├─ Units to Redeem: ~76.5
  ├─ Amount: ₹1,000
  ├─ Exit Load: ₹0
  ├─ Amount to Receive: ₹1,000
  ├─ Credit to: Savings Wallet
  └─ Processing Time: 1-3 business days
      ↓
Tap "Confirm Redemption"
  ↓
Authentication (PIN/Biometric)
  ↓
[Backend: Process Redemption]
  ↓
Redemption Initiated
  ├─ Order ID: XXXXX
  ├─ Status: Pending
  └─ "You'll receive funds in 1-3 days"
      ↓
[After Processing]
  ↓
Amount Credited to Savings Wallet
  ↓
Push Notification: "₹1,000 credited to savings"
  ↓
END
```

**API Calls:**
- `GET /investments/portfolio` - Get portfolio summary
- `GET /investments/holdings` - List all holdings
- `GET /investments/holdings/:id` - Holding details
- `POST /investments/redeem` - Redeem investment
- `GET /investments/transactions` - Transaction history

---

### 4.4 Auto-Invest Flow (SIP from Savings)

```
START → Savings Wallet
  ↓
Tap "Auto-Invest" or "Setup SIP"
  ↓
Auto-Invest Setup Screen:
  ↓
1. Select Investment Product
   └─ Choose from list: Liquid Fund A
       ↓
2. Investment Trigger
   ├─ ○ When savings reach ₹X
   │   └─ Input: ₹1,000
   ├─ ○ Every X days
   │   └─ Input: 7 days
   └─ ● Monthly on date
       └─ Select: 1st of month
       ↓
3. Investment Amount
   ├─ ○ Fixed Amount: ₹500
   └─ ● Percentage of savings: 50%
       ↓
4. Auto-invest Settings
   ├─ ☑ Auto-invest enabled
   ├─ Start Date: 01/11/2025
   └─ End Date: Optional
       ↓
Preview:
  ├─ "On 1st of every month"
  ├─ "Invest 50% of savings wallet"
  ├─ "In: Liquid Fund A"
  └─ "Estimated: ₹500-1,000/month"
      ↓
Tap "Enable Auto-Invest"
  ↓
[Backend: Create Auto-Invest Rule]
  ↓
Confirmation: "Auto-invest enabled!"
  ↓
[Scheduled Job Runs Monthly]
  ↓
Auto-Invest Execution:
  ├─ Check savings balance
  ├─ Calculate amount (50%)
  ├─ Minimum threshold met?
  │   ├─ Yes → Execute investment
  │   └─ No → Skip (notify user)
  ↓
Investment Executed
  ↓
Push Notification: "₹750 auto-invested in Liquid Fund A"
  ↓
END
```

**API Calls:**
- `POST /investments/auto-invest` - Create auto-invest rule
- `GET /investments/auto-invest` - Get active rules
- `PUT /investments/auto-invest/:id` - Update rule
- `DELETE /investments/auto-invest/:id` - Disable rule

---

## 5. Analytics & Insights Flows

### 5.1 Financial Dashboard

```
START → Home Screen
  ↓
Dashboard Overview:
  ├─ Summary Cards
  │   ├─ This Month's Spending: ₹25,000
  │   ├─ Saved This Month: ₹2,500
  │   ├─ Savings Rate: 10%
  │   └─ Total Portfolio: ₹5,250
  │
  ├─ Quick Stats
  │   ├─ Transactions: 42 this month
  │   ├─ Savings Streak: 15 days
  │   └─ Best Month: Sept (₹3,200 saved)
  │
  ├─ Spending Trend Graph
  │   └─ Bar chart (last 6 months)
  │
  ├─ Savings Trend Graph
  │   └─ Line chart (last 30 days)
  │
  └─ Insights Cards
      ├─ "You're saving 20% more than last month! 🎉"
      ├─ "Consider investing ₹2,450 from savings"
      └─ "On track for ₹30,000 annual savings"
      ↓
Tap "View Detailed Analytics"
  ↓
Analytics Screen:
  ├─ Time Period Selector
  │   ├─ This Week
  │   ├─ This Month
  │   ├─ Last 3 Months
  │   └─ This Year
  │
  ├─ Spending Analysis
  │   ├─ Total Spent
  │   ├─ Average Transaction
  │   ├─ Largest Transaction
  │   └─ Number of Transactions
  │
  ├─ Savings Analysis
  │   ├─ Total Saved
  │   ├─ Savings Rate (% of spending)
  │   ├─ Average per Transaction
  │   └─ Consistency Score
  │
  ├─ Investment Performance
  │   ├─ Total Invested
  │   ├─ Current Value
  │   ├─ Absolute Returns
  │   ├─ XIRR (annualized return)
  │   └─ Best Performing Fund
  │
  └─ Goals Progress
      ├─ Vacation Fund: 65% complete
      └─ Emergency Fund: 40% complete
      ↓
END
```

**API Calls:**
- `GET /analytics/dashboard` - Dashboard data
- `GET /analytics/spending?period=month` - Spending data
- `GET /analytics/savings?period=month` - Savings data
- `GET /analytics/investments` - Investment performance

---

### 5.2 Reports Generation Flow

```
START → Analytics or Profile
  ↓
Tap "Generate Report"
  ↓
Report Configuration:
  ├─ Report Type
  │   ├─ ○ Transaction Report
  │   ├─ ● Savings Report
  │   ├─ ○ Investment Report
  │   └─ ○ Tax Report (P&L)
  │
  ├─ Date Range
  │   ├─ Last 30 days
  │   ├─ Last 3 months
  │   ├─ Financial Year
  │   └─ Custom Range
  │
  └─ Format
      ├─ ○ PDF
      └─ ● Excel (CSV)
      ↓
Tap "Generate"
  ↓
[Backend: Generate Report]
  ↓
Processing Screen
  ↓
Report Ready Screen:
  ├─ Report Name: "Savings_Oct2025.pdf"
  ├─ File Size: 245 KB
  └─ Actions:
      ├─ [Download]
      ├─ [Share via Email]
      └─ [Share via WhatsApp]
      ↓
Download/Share
  ↓
END
```

**API Calls:**
- `POST /reports/generate` - Generate report
- `GET /reports/:id/download` - Download report

---

## 6. Notifications & Alerts Flows

### 6.1 Notification System

```
[Notification Triggers]

1. Transaction Notifications
   ├─ Payment Successful
   │   ↓
   │   Push: "✓ Paid ₹1,000 to XYZ Merchant"
   │   In-App: Badge on Transactions
   │
   ├─ Payment Failed
   │   ↓
   │   Push: "✗ Payment of ₹1,000 failed"
   │   In-App: Alert banner
   │
   └─ Money Received
       ↓
       Push: "💰 You received ₹500 from John"
       In-App: Notification center

2. Savings Notifications
   ├─ Auto-Save Executed
   │   ↓
   │   Push: "🎉 ₹100 saved automatically!"
   │
   ├─ Milestone Reached
   │   ↓
   │   Push: "🏆 You've saved ₹10,000 total!"
   │
   ├─ Goal Progress
   │   ↓
   │   Push: "Vacation Fund: 75% complete!"
   │
   └─ Savings Streak
       ↓
       Push: "🔥 15-day savings streak!"

3. Investment Notifications
   ├─ Investment Successful
   │   ↓
   │   Push: "✓ Invested ₹1,000 in Liquid Fund A"
   │
   ├─ Redemption Complete
   │   ↓
   │   Push: "₹1,000 credited to savings wallet"
   │
   ├─ NAV Update (Daily)
   │   ↓
   │   Push: "Your portfolio: +₹50 today (+1%)"
   │
   └─ Auto-Invest Executed
       ↓
       Push: "₹750 auto-invested monthly"

4. Security Notifications
   ├─ New Device Login
   │   ↓
   │   Push: "⚠️ New login from OnePlus 11"
   │   SMS: "Login detected. Not you? Contact support"
   │
   ├─ PIN Changed
   │   ↓
   │   Push: "Your PIN was changed"
   │
   └─ Large Transaction
       ↓
       Push: "⚠️ Large payment: ₹50,000 to XYZ"

5. KYC Notifications
   ├─ KYC Approved
   │   ↓
   │   Push: "✓ KYC approved! Full access unlocked"
   │
   └─ KYC Rejected
       ↓
       Push: "KYC rejected. Please resubmit"

6. Marketing Notifications (Optional)
   ├─ New Investment Products
   ├─ Special Offers
   └─ Tips & Insights
       ↓
       Push: "💡 Tip: Increase savings % by 2% this month!"
```

### 6.2 Notification Preferences Flow

```
START → Settings
  ↓
Tap "Notifications"
  ↓
Notification Settings Screen:
  ├─ Push Notifications
  │   ├─ Transaction Alerts [ON]
  │   ├─ Savings Updates [ON]
  │   ├─ Investment Updates [ON]
  │   ├─ Security Alerts [ON] (Cannot disable)
  │   ├─ Goals Progress [ON]
  │   └─ Promotional [OFF]
  │
  ├─ Email Notifications
  │   ├─ Weekly Summary [ON]
  │   ├─ Monthly Report [ON]
  │   ├─ Investment Updates [OFF]
  │   └─ Promotional [OFF]
  │
  ├─ SMS Notifications
  │   ├─ Transaction Alerts [ON]
  │   ├─ Security Alerts [ON]
  │   └─ OTP Only [Option]
  │
  └─ Quiet Hours
      ├─ Enable [ON]
      ├─ From: 10:00 PM
      └─ To: 8:00 AM
      ↓
Toggle settings
  ↓
[Backend: Update Preferences]
  ↓
Changes Saved
  ↓
END
```

**API Calls:**
- `GET /users/notification-preferences` - Get preferences
- `PUT /users/notification-preferences` - Update preferences

---

## 7. Complete User Journeys

### 7.1 First-Time User Journey (Day 1)

```
DAY 1 - Complete Onboarding Journey
═══════════════════════════════════

09:00 AM - Discovery
  ↓
User discovers app (Ad/Friend/App Store)
  ↓
Downloads app
  ↓
───────────────────────────────────
09:05 AM - Registration
  ↓
Opens app → Welcome screen
  ↓
Tap "Get Started"
  ↓
Enter mobile: +91-98765-43210
  ↓
Receive OTP: 123456
  ↓
Enter OTP → Verified ✓
  ↓
Create profile:
  ├─ Name: Rahul Sharma
  ├─ Email: rahul@email.com
  └─ DOB: 15/01/1995
  ↓
Create PIN: 1234
  ↓
Confirm PIN: 1234
  ↓
Enable Fingerprint ✓
  ↓
───────────────────────────────────
09:10 AM - Onboarding Tutorial
  ↓
Screen 1: "Save automatically on every payment"
  ↓
Screen 2: "Watch your savings grow"
  ↓
Screen 3: "Invest with one tap"
  ↓
Screen 4: "Track your financial goals"
  ↓
Screen 5: "Start saving today!"
  ↓
───────────────────────────────────
09:12 AM - KYC Prompt
  ↓
"Complete KYC to unlock investments"
  ├─ [Complete Now]
  └─ [Later] ← User taps this
  ↓
───────────────────────────────────
09:13 AM - Home Dashboard (First View)
  ↓
Dashboard shows:
  ├─ Savings Balance: ₹0
  ├─ Portfolio: Not set up
  └─ Banner: "Complete KYC to invest"
  ↓
Tap "Set up Auto-Save"
  ↓
───────────────────────────────────
09:15 AM - Configure Savings
  ↓
Savings setup wizard:
  ↓
"How much do you want to save?"
  ├─ Recommended: 10%
  ├─ Adjust slider to: 15%
  └─ Preview: "₹1,000 payment = ₹150 saved"
  ↓
Tap "Save Settings" ✓
  ↓
Success: "Auto-save enabled at 15%!"
  ↓
───────────────────────────────────
10:30 AM - First Payment
  ↓
User wants to pay for coffee
  ↓
Opens app → Tap "Pay"
  ↓
Scan QR code at cafe
  ↓
Amount: ₹200
  ↓
Preview card shows:
  ├─ Payment: ₹200
  └─ You'll save: ₹30 (15%)
  ↓
Tap "Pay ₹200"
  ↓
Enter UPI PIN
  ↓
Processing...
  ↓
SUCCESS ✓
  ├─ ✓ Payment successful
  ├─ ₹200 paid to Cafe Coffee Day
  └─ ✓ ₹30 saved automatically!
  ↓
Notification: "🎉 ₹30 saved!"
  ↓
───────────────────────────────────
10:35 AM - Check Savings Wallet
  ↓
Dashboard updated:
  ├─ Savings Balance: ₹30
  ├─ Transactions: 1
  └─ Saved today: ₹30
  ↓
User excited! 😊
  ↓
───────────────────────────────────
Evening - More Transactions
  ↓
02:00 PM - Lunch: ₹450 → Saved ₹67.50
04:00 PM - Uber: ₹180 → Saved ₹27
07:00 PM - Groceries: ₹1,200 → Saved ₹180
  ↓
End of Day Summary:
  ├─ Total Spent: ₹2,030
  ├─ Total Saved: ₹304.50
  └─ Savings Balance: ₹304.50
  ↓
Notification (9 PM):
"Great job! You saved ₹304.50 today! 🎉"
  ↓
═══════════════════════════════════
END OF DAY 1
```

---

### 7.2 Week 1 Journey - Building Habit

```
DAY 2-7 - Building Savings Habit
═══════════════════════════════════

Daily Pattern:
  ↓
Morning - Check Dashboard
  ├─ View savings balance
  ├─ See yesterday's savings
  └─ Savings streak counter
  ↓
Throughout Day - Make Payments
  ├─ Every payment auto-saves
  ├─ Instant notifications
  └─ Balance grows
  ↓
Evening - Review Progress
  ├─ Check daily summary
  └─ Feel accomplished
  ↓
═══════════════════════════════════

DAY 3 - First Milestone
  ↓
Savings crossed ₹500
  ↓
Notification:
"🏆 Milestone! You've saved ₹500!"
  ↓
User feels motivated
  ↓
═══════════════════════════════════

DAY 5 - KYC Completion
  ↓
User decides to complete KYC for investing
  ↓
Opens app → Tap "Complete KYC"
  ↓
Submit PAN: ABCDE1234F
  ↓
Aadhaar via DigiLocker
  ↓
Take selfie
  ↓
Bank verification: ****4567
  ↓
Submit KYC
  ↓
"KYC under review (24-48 hours)"
  ↓
═══════════════════════════════════

DAY 7 - Week Summary
  ↓
Savings Balance: ₹1,250
  ↓
Notification (Evening):
"Week 1 Complete! 🎉
 - Saved: ₹1,250
 - Transactions: 18
 - 7-day streak! 🔥
 Keep it up!"
  ↓
User very satisfied 😊
  ↓
═══════════════════════════════════
END OF WEEK 1
```

---

### 7.3 Week 2-4 Journey - First Investment

```
DAY 10 - KYC Approved
  ↓
Notification:
"✓ KYC Approved! You can now invest"
  ↓
Opens app
  ↓
Banner: "Start investing your ₹2,000 savings!"
  ↓
Tap banner → Investment products
  ↓
═══════════════════════════════════

DAY 12 - First Investment
  ↓
Savings Balance: ₹2,450
  ↓
User explores investment products
  ↓
Selects: "Liquid Fund A"
  ├─ Low risk
  ├─ 4.5% returns
  └─ Instant liquidity
  ↓
Invest ₹2,000
  ↓
Confirm → Enter PIN
  ↓
SUCCESS ✓
  ↓
"Congratulations on your first investment! 🎉"
  ↓
Portfolio created:
  ├─ Invested: ₹2,000
  └─ Savings left: ₹450
  ↓
═══════════════════════════════════

DAY 15 - Set Investment Goal
  ↓
User creates goal:
  ├─ Name: "Vacation Fund"
  ├─ Target: ₹50,000
  └─ Date: Dec 2025
  ↓
Goal created ✓
  ↓
Allocate savings:
  └─ 80% to Vacation Fund
  ↓
═══════════════════════════════════

DAY 20 - Setup Auto-Invest
  ↓
Savings reached ₹1,500 again
  ↓
Notification:
"Your savings: ₹1,500. Want to auto-invest?"
  ↓
User taps → Setup auto-invest
  ↓
Rule: "When savings reach ₹1,500,
       invest 70% in Liquid Fund A"
  ↓
Enabled ✓
  ↓
═══════════════════════════════════

DAY 28 - Month 1 Complete
  ↓
Monthly Summary Notification:
"Your Month 1 Report:
 💰 Saved: ₹5,850
 📈 Invested: ₹4,000
 💼 Portfolio: ₹4,025 (+₹25)
 🎯 Vacation Goal: 8% complete

 Amazing progress! 🎉"
  ↓
User shares on social media 📱
  ↓
═══════════════════════════════════
END OF MONTH 1
```

---

### 7.4 Returning User Journey (Steady State)

```
TYPICAL DAY - Experienced User
═══════════════════════════════════

Morning (8:00 AM)
  ↓
Open app (Biometric)
  ↓
Quick glance at dashboard:
  ├─ Savings: ₹1,850
  ├─ Portfolio: ₹18,250
  └─ Yesterday: +₹120 saved
  ↓
Close app
  ↓
───────────────────────────────────

Throughout Day
  ↓
Make payments as usual
  ├─ Morning coffee: ₹200
  ├─ Lunch: ₹350
  ├─ Online shopping: ₹2,500
  └─ Dinner: ₹800
  ↓
Auto-save happens silently
  ↓
Notifications muted (user knows it works)
  ↓
───────────────────────────────────

Evening (8:00 PM)
  ↓
Check app again
  ↓
Dashboard:
  ├─ Saved today: ₹577.50
  ├─ New balance: ₹2,427.50
  ├─ 45-day streak! 🔥
  └─ Portfolio: ₹18,280 (+₹30)
  ↓
Auto-invest triggered:
"₹1,700 auto-invested (savings > ₹1,500)"
  ↓
New savings: ₹727.50
  ↓
Satisfied → Close app
  ↓
───────────────────────────────────

Weekly (Sunday)
  ↓
Check detailed analytics
  ├─ This week: ₹2,340 saved
  ├─ Portfolio performance
  └─ Goal progress: 35% complete
  ↓
Adjust savings %: 15% → 18%
  ↓
───────────────────────────────────

Monthly (1st)
  ↓
Review monthly report
  ├─ Generate PDF
  └─ Download for records
  ↓
Check investment performance
  ├─ XIRR: 6.2%
  └─ Happy with returns 😊
  ↓
═══════════════════════════════════
```

---

## 8. Error Handling & Edge Cases

### 8.1 Payment Failure Flow

```
Payment Failed Scenario
  ↓
Possible Reasons:
  ├─ Insufficient bank balance
  ├─ UPI PIN incorrect
  ├─ Network timeout
  ├─ Bank server down
  └─ Daily limit exceeded
  ↓
Error Screen:
  ├─ Error message (user-friendly)
  ├─ Error code (for support)
  ├─ Suggested action
  └─ Actions:
      ├─ [Retry Payment]
      ├─ [Change Payment Method]
      ├─ [Contact Support]
      └─ [Back to Home]
      ↓
User selects action
  ↓
[Appropriate flow]
  ↓
Transaction logged as failed
  ↓
No auto-save triggered
  ↓
END
```

### 8.2 Investment Failure Flow

```
Investment Failed Scenario
  ↓
Possible Reasons:
  ├─ Insufficient savings balance
  ├─ Below minimum investment
  ├─ Fund house API down
  ├─ Market closed (for some products)
  └─ KYC not complete
  ↓
Error Handling:
  ↓
[Backend: Rollback Transaction]
  ├─ Refund to savings wallet
  └─ Log error
  ↓
Notify User:
  ├─ Push notification
  ├─ In-app alert
  └─ Email (if significant amount)
  ↓
Error Screen:
  ├─ "Investment could not be processed"
  ├─ "₹1,000 refunded to savings wallet"
  ├─ Reason: [Specific error]
  └─ Actions:
      ├─ [Try Again]
      ├─ [Choose Different Product]
      └─ [Contact Support]
      ↓
END
```

### 8.3 KYC Rejection Flow

```
KYC Rejected Scenario
  ↓
Notification:
"KYC verification failed"
  ↓
User opens app
  ↓
KYC Status Screen:
  ├─ Status: Rejected ✗
  ├─ Reason:
  │   ├─ "PAN name mismatch with Aadhaar"
  │   ├─ "Unclear selfie photo"
  │   └─ "Invalid bank account"
  └─ Actions:
      └─ [Resubmit KYC]
      ↓
Resubmit Flow:
  ├─ Pre-filled previous data
  ├─ Highlight fields to correct
  └─ Allow re-upload documents
  ↓
Submit again
  ↓
[Review process restarts]
  ↓
END
```

---

## 9. Success Metrics & Tracking

### Key Events to Track

**Authentication Events:**
- user_registered
- user_logged_in
- pin_created
- biometric_enabled
- kyc_submitted
- kyc_approved

**Transaction Events:**
- payment_initiated
- payment_success
- payment_failed
- auto_save_executed

**Savings Events:**
- savings_config_updated
- manual_deposit
- withdrawal_requested
- goal_created
- goal_achieved

**Investment Events:**
- product_viewed
- investment_initiated
- investment_success
- redemption_initiated
- auto_invest_enabled
- auto_invest_executed

**Engagement Events:**
- app_opened
- dashboard_viewed
- analytics_viewed
- notification_clicked

### Conversion Funnels

**Registration Funnel:**
```
App Download (100%)
  ↓ 90%
Welcome Screen
  ↓ 85%
Mobile Entry
  ↓ 95%
OTP Verified
  ↓ 90%
Profile Created
  ↓ 95%
PIN Set
  ↓ 80%
Onboarding Complete
```

**Payment Funnel:**
```
Payment Initiated (100%)
  ↓ 98%
Amount Entered
  ↓ 95%
PIN/Biometric Auth
  ↓ 92%
Payment Success
  ↓ 100%
Auto-Save Executed
```

**Investment Funnel:**
```
Products Viewed (100%)
  ↓ 30%
Product Detail Opened
  ↓ 60%
Investment Initiated
  ↓ 95%
Investment Success
```

---

This comprehensive flow documentation covers all major user journeys and edge cases for your MVP. Each flow is designed to be intuitive, secure, and optimized for user engagement.
