# BDD User Stories

## Epic 1: User Authentication & Authorization

### Story 1.1: User Registration
**As a** new user
**I want to** register with my mobile number
**So that** I can create an account and start saving automatically

**Acceptance Criteria:**
```gherkin
Feature: User Registration

  Scenario: Successful user registration
    Given I am a new user
    And I have opened the app for the first time
    When I tap "Get Started"
    And I enter a valid mobile number "+919876543210"
    And I tap "Send OTP"
    Then I should receive an OTP via SMS within 30 seconds
    And I should see the OTP entry screen

  Scenario: OTP verification success
    Given I am on the OTP entry screen
    And I have received OTP "123456"
    When I enter the OTP "123456"
    And I tap "Verify"
    Then the OTP should be validated successfully
    And I should see the profile creation screen

  Scenario: OTP verification failure
    Given I am on the OTP entry screen
    When I enter an incorrect OTP "999999"
    And I tap "Verify"
    Then I should see an error message "Invalid OTP"
    And I should have 2 attempts remaining
    And I should see a "Resend OTP" option

  Scenario: Complete profile creation
    Given I have verified my OTP
    When I enter my full name "Rahul Sharma"
    And I enter my email "rahul@email.com"
    And I enter my date of birth "15/01/1995"
    And I tap "Continue"
    Then my profile should be created
    And I should see the PIN creation screen

  Scenario: Create PIN
    Given I am on the PIN creation screen
    When I enter a 6-digit PIN "123456"
    And I re-enter the PIN "123456"
    And I tap "Confirm"
    Then my PIN should be created successfully
    And I should see the biometric setup screen

  Scenario: Enable biometric authentication
    Given I am on the biometric setup screen
    And my device supports fingerprint authentication
    When I tap "Enable Fingerprint"
    And I complete fingerprint registration
    Then biometric authentication should be enabled
    And I should see the onboarding tutorial
```

**API Endpoints:**
- `POST /auth/register`
- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /users/profile`
- `POST /auth/set-pin`

**Priority:** P0 (Must Have)
**Story Points:** 8
**Dependencies:** None

---

### Story 1.2: User Login
**As a** returning user
**I want to** login securely using PIN or biometric
**So that** I can access my account quickly and safely

**Acceptance Criteria:**
```gherkin
Feature: User Login

  Scenario: Login with PIN
    Given I am a registered user
    And I have opened the app
    When I see the login screen
    And I enter my PIN "123456"
    Then I should be authenticated successfully
    And I should see the home dashboard
    And my session should be active for 30 minutes

  Scenario: Login with biometric
    Given I am a registered user
    And I have enabled biometric authentication
    When I open the app
    And I see the biometric prompt
    And I authenticate with my fingerprint
    Then I should be logged in successfully
    And I should see the home dashboard

  Scenario: Failed PIN attempts
    Given I am on the login screen
    When I enter an incorrect PIN "999999"
    Then I should see an error "Incorrect PIN"
    And I should have 2 attempts remaining
    When I enter an incorrect PIN 2 more times
    Then my account should be locked for 30 minutes
    And I should see "Account locked. Try again in 30 minutes"

  Scenario: Login with OTP fallback
    Given I have forgotten my PIN
    When I tap "Login with OTP"
    And I enter my mobile number
    And I receive and enter the OTP
    Then I should be logged in successfully
    And I should be prompted to reset my PIN
```

**API Endpoints:**
- `POST /auth/login`
- `POST /auth/verify-biometric`
- `POST /auth/refresh-token`

**Priority:** P0 (Must Have)
**Story Points:** 5
**Dependencies:** Story 1.1

---

### Story 1.3: KYC Verification
**As a** registered user
**I want to** complete my KYC verification
**So that** I can access investment features

**Acceptance Criteria:**
```gherkin
Feature: KYC Verification

  Scenario: Submit PAN card details
    Given I am on the KYC screen
    When I enter my PAN number "ABCDE1234F"
    And I tap "Verify PAN"
    Then the PAN should be validated with NSDL
    And I should see "PAN verified successfully"
    And I should proceed to Aadhaar verification

  Scenario: Aadhaar verification via DigiLocker
    Given I have verified my PAN
    When I tap "Verify via DigiLocker"
    And I login to DigiLocker
    And I authorize data sharing
    Then my Aadhaar details should be fetched
    And my name, address, and DOB should be auto-filled
    And I should proceed to selfie verification

  Scenario: Live photo verification
    Given I have completed Aadhaar verification
    When I tap "Take Selfie"
    And I capture my photo
    Then the photo should be matched with my PAN/Aadhaar photo
    And face match confidence should be > 80%
    And I should proceed to bank verification

  Scenario: Bank account verification
    Given I have completed photo verification
    When I enter my bank account number "1234567890"
    And I enter IFSC code "SBIN0001234"
    And I enter account holder name "Rahul Sharma"
    And I tap "Verify Account"
    Then a penny drop of ₹1 should be initiated
    And account ownership should be verified
    And I should see "Bank account verified"

  Scenario: KYC submission and approval
    Given I have completed all KYC steps
    When I review my details
    And I tap "Submit KYC"
    Then my KYC should be submitted for review
    And I should see "KYC under review"
    And I should receive a notification within 24-48 hours

  Scenario: KYC rejection and resubmission
    Given my KYC was rejected
    And the reason is "Unclear selfie photo"
    When I tap "Resubmit KYC"
    Then I should see my previous data pre-filled
    And I should be able to retake my selfie
    And I should be able to resubmit
```

**API Endpoints:**
- `POST /users/kyc/pan`
- `POST /users/kyc/aadhaar`
- `POST /users/kyc/photo`
- `POST /users/kyc/bank`
- `POST /users/kyc/submit`
- `GET /users/kyc-status`

**Priority:** P0 (Must Have)
**Story Points:** 13
**Dependencies:** Story 1.1

---

## Epic 2: UPI Payment Features

### Story 2.1: Make UPI Payment via QR Code
**As a** user
**I want to** scan a QR code and make a UPI payment
**So that** I can pay merchants and automatically save a percentage

**Acceptance Criteria:**
```gherkin
Feature: UPI Payment via QR Code

  Scenario: Scan QR code and make payment
    Given I am logged in
    And I have configured auto-save at 10%
    When I tap "Pay"
    And I tap "Scan QR Code"
    And I scan a merchant QR code
    Then the merchant name should be displayed
    And the amount field should be editable

  Scenario: Preview auto-save before payment
    Given I have scanned a QR code
    And the merchant is "Cafe Coffee Day"
    When I enter amount "1000"
    Then I should see "You're paying: ₹1,000"
    And I should see "You'll save: ₹100 (10%)"
    And I should see "New savings balance: ₹2,100"

  Scenario: Successful payment with auto-save
    Given I have entered payment amount "1000"
    And I can see the auto-save preview
    When I tap "Pay ₹1,000"
    And I enter my UPI PIN "123456"
    Then the payment should be processed
    And I should see "Payment Successful"
    And the UTR number should be displayed
    And ₹100 should be automatically credited to my savings wallet
    And I should receive a push notification "₹100 saved!"

  Scenario: Payment failure
    Given I have initiated a payment of ₹1,000
    When the payment fails due to "Insufficient balance"
    Then I should see "Payment Failed"
    And I should see the reason "Insufficient balance in bank account"
    And no amount should be saved
    And I should see options to "Retry" or "Contact Support"

  Scenario: Payment timeout
    Given I have initiated a payment
    When the payment status is pending for more than 2 minutes
    Then I should see "Payment Pending"
    And I should see "This may take a few minutes"
    And the status should be updated via webhook when available
```

**API Endpoints:**
- `POST /payments/initiate`
- `POST /payments/verify`
- `POST /payments/webhook`
- `GET /payments/:id`

**Priority:** P0 (Must Have)
**Story Points:** 13
**Dependencies:** Story 1.1, Story 3.1

---

### Story 2.2: View Transaction History
**As a** user
**I want to** view my transaction history with filters
**So that** I can track my spending and savings

**Acceptance Criteria:**
```gherkin
Feature: Transaction History

  Scenario: View all transactions
    Given I am logged in
    When I tap "Transactions"
    Then I should see a list of all my transactions in chronological order
    And each transaction should display:
      | Field        | Example              |
      | Date/Time    | 21 Oct, 10:30 AM    |
      | Merchant     | Cafe Coffee Day      |
      | Amount       | ₹200                |
      | Status       | Success              |
      | Savings      | ₹20 saved           |

  Scenario: Filter transactions by date
    Given I am on the transaction history screen
    When I tap "Filter"
    And I select "Last 7 days"
    And I tap "Apply"
    Then I should see only transactions from the last 7 days

  Scenario: Filter by transaction status
    Given I am on the transaction history screen
    When I tap "Filter"
    And I select status "Failed"
    And I tap "Apply"
    Then I should see only failed transactions

  Scenario: Search transactions
    Given I am on the transaction history screen
    When I enter "Cafe" in the search bar
    Then I should see all transactions with "Cafe" in merchant name

  Scenario: View transaction details
    Given I am viewing transaction history
    When I tap on a transaction
    Then I should see full transaction details:
      | Field              | Value                    |
      | Transaction ID     | TXN123456789            |
      | UTR Number         | 987654321012            |
      | Timestamp          | 21 Oct 2025, 10:30 AM   |
      | Amount             | ₹1,000                  |
      | To                 | Merchant Name           |
      | Payment Method     | UPI - SBI Bank          |
      | Status             | Success                 |
      | Auto-saved         | ₹100                    |
    And I should see options to "Download Receipt" and "Share"

  Scenario: Download transaction receipt
    Given I am viewing transaction details
    When I tap "Download Receipt"
    Then a PDF receipt should be generated
    And it should be saved to my device
    And I should see "Receipt downloaded successfully"
```

**API Endpoints:**
- `GET /payments/history?filters={}`
- `GET /payments/:id`
- `POST /payments/:id/receipt`

**Priority:** P0 (Must Have)
**Story Points:** 5
**Dependencies:** Story 2.1

---

## Epic 3: Automated Savings

### Story 3.1: Configure Auto-Save Percentage
**As a** user
**I want to** set my auto-save percentage
**So that** a portion of every payment is automatically saved

**Acceptance Criteria:**
```gherkin
Feature: Configure Auto-Save

  Scenario: Set savings percentage for first time
    Given I am a new user who just registered
    When I see the auto-save setup screen
    And I drag the slider to 15%
    Then I should see a preview "₹1,000 payment = ₹150 saved"
    When I tap "Save Settings"
    Then auto-save should be enabled at 15%
    And I should see "Auto-save enabled at 15%!"

  Scenario: Update savings percentage
    Given I have auto-save enabled at 10%
    When I go to "Savings Settings"
    And I change the percentage to 20%
    And I tap "Save Settings"
    Then my auto-save percentage should be updated to 20%
    And all future payments should save 20%

  Scenario: Set minimum transaction amount
    Given I am on the savings configuration screen
    When I set "Minimum transaction amount" to ₹100
    And I tap "Save Settings"
    Then payments below ₹100 should not trigger auto-save
    And payments ≥ ₹100 should trigger auto-save

  Scenario: Set maximum savings per transaction
    Given I am on the savings configuration screen
    When I set "Maximum savings per transaction" to ₹500
    And I save settings
    Then even if percentage calculates to ₹800
    Only ₹500 should be saved per transaction

  Scenario: Disable auto-save
    Given I have auto-save enabled
    When I toggle auto-save to OFF
    Then no future payments should trigger auto-save
    And I should see "Auto-save disabled"
```

**API Endpoints:**
- `GET /savings/config`
- `PUT /savings/config`

**Priority:** P0 (Must Have)
**Story Points:** 5
**Dependencies:** Story 1.1

---

### Story 3.2: Savings Wallet Management
**As a** user
**I want to** view and manage my savings wallet
**So that** I can track my savings and add/withdraw money

**Acceptance Criteria:**
```gherkin
Feature: Savings Wallet

  Scenario: View savings wallet balance
    Given I am logged in
    When I tap "Savings Wallet"
    Then I should see:
      | Field                  | Value      |
      | Current Balance        | ₹2,450     |
      | Total Saved (Lifetime) | ₹12,340    |
      | This Month             | ₹850       |
      | Savings Streak         | 15 days 🔥 |

  Scenario: View savings analytics
    Given I am on the savings wallet screen
    Then I should see a graph showing savings trend
    And I should see "Average per transaction: ₹75"
    And I should see "Projected annual savings: ₹30,000"

  Scenario: Manual deposit to savings
    Given I am on the savings wallet screen
    When I tap "Add Money"
    And I enter amount "500"
    And I select payment method "UPI"
    And I complete the payment
    Then ₹500 should be added to my savings wallet
    And I should see "₹500 added to savings"
    And my new balance should be updated

  Scenario: Withdraw from savings
    Given I have ₹2,450 in my savings wallet
    When I tap "Withdraw"
    And I enter amount "1000"
    And I select my bank account "SBI ****4567"
    And I tap "Withdraw"
    And I authenticate with PIN
    Then withdrawal request should be initiated
    And ₹1,000 should be deducted from savings
    And I should see "Withdrawal initiated. Funds in 1-2 business days"

  Scenario: View savings transaction history
    Given I am on the savings wallet screen
    When I scroll to "Recent Transactions"
    Then I should see:
      | Type           | Amount  | Source/Dest        | Date       |
      | Auto-save      | +₹100   | Payment TXN123     | 21 Oct     |
      | Manual deposit | +₹500   | UPI                | 20 Oct     |
      | Invested       | -₹1,000 | Liquid Fund A      | 19 Oct     |
      | Withdrawal     | -₹500   | SBI Bank ****4567  | 18 Oct     |
```

**API Endpoints:**
- `GET /savings/wallet`
- `GET /savings/history`
- `POST /savings/deposit`
- `POST /savings/withdraw`
- `GET /savings/analytics`

**Priority:** P0 (Must Have)
**Story Points:** 8
**Dependencies:** Story 3.1

---

### Story 3.3: Savings Goals
**As a** user
**I want to** create and track savings goals
**So that** I can save for specific purposes

**Acceptance Criteria:**
```gherkin
Feature: Savings Goals

  Scenario: Create a new savings goal
    Given I am on the savings wallet screen
    When I tap "Create Goal"
    And I enter goal name "Vacation Fund"
    And I enter target amount "50000"
    And I select target date "31/12/2025"
    And I choose goal image
    And I tap "Create Goal"
    Then the goal should be created
    And I should see "Goal created successfully"
    And I should see goal details:
      | Field                  | Value               |
      | Goal                   | Vacation Fund       |
      | Target                 | ₹50,000            |
      | Current                | ₹0                 |
      | Progress               | 0%                 |
      | Days Remaining         | 250 days           |
      | Required Daily Savings | ₹200               |

  Scenario: Track goal progress
    Given I have a goal "Vacation Fund" with target ₹50,000
    And I have saved ₹12,500 towards it
    When I view the goal
    Then I should see:
      | Progress Bar | 25% |
      | Amount Saved | ₹12,500 / ₹50,000 |
      | Remaining    | ₹37,500 |
    And I should see if I'm "On track" or "Below target"

  Scenario: Allocate auto-savings to goals
    Given I have created 3 goals
    When I tap "Allocate Savings"
    And I set:
      | Goal           | Allocation |
      | Vacation Fund  | 50%        |
      | Emergency Fund | 30%        |
      | General        | 20%        |
    And I tap "Save"
    Then future auto-saves should be split accordingly
    When ₹100 is auto-saved
    Then:
      | Goal           | Amount Allocated |
      | Vacation Fund  | ₹50             |
      | Emergency Fund | ₹30             |
      | General        | ₹20             |

  Scenario: Goal achieved notification
    Given I have a goal "Emergency Fund" with target ₹10,000
    And I have saved ₹9,950
    When auto-save of ₹100 is triggered
    And my goal reaches ₹10,050
    Then I should receive a push notification "🎉 Goal Achieved! Emergency Fund complete!"
    And I should see a congratulations screen
    And I should see options:
      | Option                  |
      | Withdraw to bank        |
      | Invest                  |
      | Create new goal         |
```

**API Endpoints:**
- `POST /savings/goals`
- `GET /savings/goals`
- `PUT /savings/goals/:id`
- `DELETE /savings/goals/:id`
- `PUT /savings/goals/allocations`

**Priority:** P1 (Should Have for MVP)
**Story Points:** 8
**Dependencies:** Story 3.2

---

## Epic 4: Investment Features

### Story 4.1: Browse Investment Products
**As a** user
**I want to** browse available investment products
**So that** I can choose where to invest my savings

**Acceptance Criteria:**
```gherkin
Feature: Browse Investment Products

  Scenario: View investment products list
    Given I am logged in
    And my KYC is approved
    When I tap "Investments"
    And I tap "Explore Products"
    Then I should see a list of investment products
    And each product should display:
      | Field       | Example              |
      | Name        | Liquid Fund A        |
      | Category    | Liquid Fund          |
      | Risk Level  | Low                  |
      | Returns     | 4.5% p.a.           |
      | Minimum     | ₹100                |

  Scenario: Filter products by risk level
    Given I am on the investment products screen
    When I tap "Filter"
    And I select risk level "Low"
    And I tap "Apply"
    Then I should see only low-risk products

  Scenario: View product details
    Given I am viewing investment products
    When I tap on "Liquid Fund A"
    Then I should see detailed product information:
      | Field          | Value                |
      | Fund Name      | Liquid Fund A        |
      | Current NAV    | ₹12.45              |
      | Category       | Liquid Fund          |
      | Risk Level     | Low                  |
      | Fund Size      | ₹5,000 Cr           |
      | Expense Ratio  | 0.25%               |
      | Exit Load      | Nil                  |
      | Min Investment | ₹100                |
    And I should see returns:
      | Period | Return |
      | 1 Year | 5.2%   |
      | 3 Year | 6.1%   |
      | 5 Year | 7.8%   |
    And I should see a performance graph
    And I should see "About this fund" description
    And I should see "Invest Now" button
```

**API Endpoints:**
- `GET /investments/products`
- `GET /investments/products/:id`
- `GET /investments/products/:id/performance`

**Priority:** P0 (Must Have)
**Story Points:** 5
**Dependencies:** Story 1.3 (KYC)

---

### Story 4.2: Purchase Investment
**As a** user
**I want to** invest money from my savings wallet
**So that** I can grow my wealth

**Acceptance Criteria:**
```gherkin
Feature: Purchase Investment

  Scenario: Invest from savings wallet
    Given I have ₹2,450 in my savings wallet
    And I am viewing "Liquid Fund A" details
    And the minimum investment is ₹500
    When I tap "Invest Now"
    And I enter amount "1000"
    Then I should see:
      | Field                  | Value            |
      | Fund                   | Liquid Fund A    |
      | Amount                 | ₹1,000          |
      | NAV                    | ₹12.45          |
      | Estimated Units        | 80.32           |
      | Payment from           | Savings Wallet   |
      | New Savings Balance    | ₹1,450          |

  Scenario: Successful investment
    Given I am on the investment preview screen
    And the amount is ₹1,000
    When I tap "Confirm Investment"
    And I authenticate with PIN "123456"
    Then the investment should be processed
    And ₹1,000 should be deducted from savings wallet
    And I should see "Investment Successful"
    And I should see:
      | Field      | Value           |
      | Amount     | ₹1,000         |
      | Fund       | Liquid Fund A   |
      | Units      | 80.32 (est.)   |
      | Order ID   | ORD123456      |
    And I should see "Units will be credited in 1-2 days"
    And I should receive a push notification "Investment successful!"

  Scenario: Insufficient balance
    Given I have ₹400 in my savings wallet
    When I try to invest ₹500
    Then I should see an error "Insufficient balance in savings wallet"
    And I should see options:
      | Option             |
      | Add Money to Savings |
      | Invest Different Amount |

  Scenario: Below minimum investment
    Given the minimum investment for a fund is ₹500
    When I enter amount "400"
    Then I should see an error "Minimum investment is ₹500"
```

**API Endpoints:**
- `POST /investments/purchase`
- `POST /investments/verify`
- `GET /investments/orders/:id`

**Priority:** P0 (Must Have)
**Story Points:** 8
**Dependencies:** Story 4.1, Story 3.2

---

### Story 4.3: Portfolio Management
**As a** user
**I want to** view and manage my investment portfolio
**So that** I can track my investment performance

**Acceptance Criteria:**
```gherkin
Feature: Portfolio Management

  Scenario: View portfolio summary
    Given I have investments in 3 different funds
    When I tap "Investments"
    Then I should see portfolio summary:
      | Field          | Value       |
      | Total Invested | ₹5,000     |
      | Current Value  | ₹5,250     |
      | Total Returns  | +₹250      |
      | Returns %      | +5%        |
      | Today's Change | +₹15 (0.3%)|

  Scenario: View asset allocation
    Given I have a diversified portfolio
    When I view my portfolio
    Then I should see a pie chart showing:
      | Asset Type  | Allocation |
      | Liquid Funds | 40%       |
      | Debt Funds   | 40%       |
      | Digital Gold | 20%       |

  Scenario: View individual holdings
    Given I have multiple investments
    When I view my holdings list
    Then I should see each holding with:
      | Field           | Example        |
      | Fund Name       | Liquid Fund A  |
      | Invested        | ₹2,000        |
      | Current Value   | ₹2,100        |
      | Returns         | +₹100 (+5%)   |
      | Units           | 160.64        |

  Scenario: View holding details
    Given I have invested in "Liquid Fund A"
    When I tap on that holding
    Then I should see:
      | Field              | Value              |
      | Current Value      | ₹2,100            |
      | Invested Amount    | ₹2,000            |
      | Returns            | +₹100 (+5%)       |
      | Units Held         | 160.64            |
      | Average NAV        | ₹12.45            |
      | Current NAV        | ₹13.07            |
    And I should see a performance graph
    And I should see purchase history
    And I should see "Invest More" and "Redeem" buttons

  Scenario: Redeem investment (full)
    Given I have 160.64 units in "Liquid Fund A"
    And the current NAV is ₹13.07
    When I tap "Redeem"
    And I select "Full Redemption"
    And I tap "Confirm Redemption"
    And I authenticate with PIN
    Then redemption should be initiated
    And I should see:
      | Field            | Value           |
      | Units to Redeem  | 160.64         |
      | Amount           | ₹2,100         |
      | Exit Load        | ₹0             |
      | Credit to        | Savings Wallet  |
      | Processing Time  | 1-3 days       |
    And after processing, ₹2,100 should be credited to savings wallet

  Scenario: Redeem investment (partial)
    Given I have 160.64 units worth ₹2,100
    When I tap "Redeem"
    And I select "Partial Redemption"
    And I enter amount "1000"
    Then I should see "Units to redeem: ~76.5"
    When I confirm redemption
    Then 76.5 units should be redeemed
    And ₹1,000 should be credited to savings (after 1-3 days)
    And I should retain remaining units
```

**API Endpoints:**
- `GET /investments/portfolio`
- `GET /investments/holdings`
- `GET /investments/holdings/:id`
- `POST /investments/redeem`

**Priority:** P0 (Must Have)
**Story Points:** 8
**Dependencies:** Story 4.2

---

### Story 4.4: Auto-Invest (SIP from Savings)
**As a** user
**I want to** automatically invest when my savings reach a threshold
**So that** I can grow my wealth without manual effort

**Acceptance Criteria:**
```gherkin
Feature: Auto-Invest

  Scenario: Setup auto-invest rule
    Given I am on the savings wallet screen
    When I tap "Auto-Invest"
    And I select product "Liquid Fund A"
    And I select trigger "When savings reach ₹1,000"
    And I select investment amount "50% of savings"
    And I tap "Enable Auto-Invest"
    Then auto-invest rule should be created
    And I should see "Auto-invest enabled"

  Scenario: Auto-invest executes when threshold reached
    Given I have auto-invest enabled
    And the rule is "When savings ≥ ₹1,000, invest 50%"
    And my current savings is ₹950
    When I make a payment and save ₹100
    And my savings reaches ₹1,050
    Then auto-invest should trigger
    And ₹525 should be invested in "Liquid Fund A"
    And my new savings should be ₹525
    And I should receive notification "₹525 auto-invested in Liquid Fund A"

  Scenario: Monthly auto-invest (SIP)
    Given I have setup monthly auto-invest
    And the rule is "Every 1st of month, invest ₹500"
    When the 1st of month arrives
    And I have ≥ ₹500 in savings
    Then ₹500 should be automatically invested
    And I should receive a notification

  Scenario: Auto-invest fails - insufficient balance
    Given I have auto-invest rule for ₹1,000 monthly
    When the scheduled date arrives
    And I have only ₹400 in savings
    Then auto-invest should be skipped
    And I should receive notification "Auto-invest skipped: Insufficient balance"

  Scenario: View and manage auto-invest rules
    Given I have 2 auto-invest rules
    When I go to "Auto-Invest Settings"
    Then I should see all my active rules
    And I should be able to edit each rule
    And I should be able to disable/delete rules
```

**API Endpoints:**
- `POST /investments/auto-invest`
- `GET /investments/auto-invest`
- `PUT /investments/auto-invest/:id`
- `DELETE /investments/auto-invest/:id`

**Priority:** P1 (Should Have for MVP)
**Story Points:** 8
**Dependencies:** Story 4.2, Story 3.2

---

## Epic 5: Analytics & Insights

### Story 5.1: Financial Dashboard
**As a** user
**I want to** view my financial dashboard
**So that** I can understand my spending, saving, and investment patterns

**Acceptance Criteria:**
```gherkin
Feature: Financial Dashboard

  Scenario: View home dashboard
    Given I am logged in
    When I see the home screen
    Then I should see summary cards:
      | Metric                | Value     |
      | This Month's Spending | ₹25,000   |
      | Saved This Month      | ₹2,500    |
      | Savings Rate          | 10%       |
      | Total Portfolio       | ₹5,250    |
      | Transactions          | 42        |

  Scenario: View spending trend
    Given I am on the dashboard
    Then I should see a bar chart showing spending for last 6 months
    And I should be able to tap on each bar to see monthly details

  Scenario: View savings trend
    Given I am on the dashboard
    Then I should see a line chart showing savings for last 30 days
    And I should see trend (increasing/decreasing)

  Scenario: View insights
    Given I am on the dashboard
    Then I should see personalized insights like:
      | Insight                                          |
      | "You're saving 20% more than last month! 🎉"    |
      | "Consider investing ₹2,450 from savings"        |
      | "On track for ₹30,000 annual savings"           |

  Scenario: View detailed analytics
    Given I am on the dashboard
    When I tap "View Detailed Analytics"
    Then I should see comprehensive analytics:
      | Category                | Metrics                    |
      | Spending Analysis       | Total, Average, Largest    |
      | Savings Analysis        | Total, Rate, Consistency   |
      | Investment Performance  | Invested, Value, XIRR      |
      | Goals Progress          | All goals with % complete  |
    And I should be able to select time period (week/month/3months/year)
```

**API Endpoints:**
- `GET /analytics/dashboard`
- `GET /analytics/spending?period=month`
- `GET /analytics/savings?period=month`
- `GET /analytics/investments`

**Priority:** P1 (Should Have for MVP)
**Story Points:** 5
**Dependencies:** Stories 2.1, 3.2, 4.3

---

### Story 5.2: Generate Reports
**As a** user
**I want to** generate financial reports
**So that** I can keep records and file taxes

**Acceptance Criteria:**
```gherkin
Feature: Generate Reports

  Scenario: Generate transaction report
    Given I am in analytics or profile section
    When I tap "Generate Report"
    And I select report type "Transaction Report"
    And I select date range "Last 3 months"
    And I select format "PDF"
    And I tap "Generate"
    Then a PDF report should be generated with all transactions
    And I should see "Report ready"
    And I should be able to download or share the report

  Scenario: Generate savings report
    Given I want to generate a savings report
    When I select "Savings Report" for "This Financial Year"
    And I generate the report in "Excel (CSV)" format
    Then I should get a CSV file with:
      | Column                | Data                    |
      | Date                  | Transaction date        |
      | Transaction ID        | Reference               |
      | Payment Amount        | Amount paid             |
      | Savings Amount        | Amount saved            |
      | Savings %             | Percentage              |
      | Balance               | Cumulative balance      |

  Scenario: Generate investment report
    Given I want to track my investment performance
    When I generate an "Investment Report"
    Then I should see:
      | Fund Name      | Invested | Current Value | Returns | XIRR   |
      | Liquid Fund A  | ₹2,000  | ₹2,100       | +₹100   | 5.2%   |
      | Debt Fund B    | ₹2,000  | ₹2,080       | +₹80    | 4.1%   |
    And total portfolio summary

  Scenario: Share report via email
    Given I have generated a report
    When I tap "Share via Email"
    And I enter email "rahul@email.com"
    And I tap "Send"
    Then the report should be emailed
    And I should see "Report sent to rahul@email.com"
```

**API Endpoints:**
- `POST /reports/generate`
- `GET /reports/:id/download`

**Priority:** P2 (Nice to Have for MVP)
**Story Points:** 5
**Dependencies:** Stories 2.2, 3.2, 4.3

---

## Epic 6: Notifications & Alerts

### Story 6.1: Receive Transaction Notifications
**As a** user
**I want to** receive instant notifications for transactions
**So that** I stay informed about my account activity

**Acceptance Criteria:**
```gherkin
Feature: Transaction Notifications

  Scenario: Payment success notification
    Given I have completed a payment of ₹1,000
    When the payment is successful
    Then I should receive a push notification:
      """
      ✓ Paid ₹1,000 to Cafe Coffee Day
      ₹100 saved automatically!
      """
    And the notification should appear within 5 seconds

  Scenario: Auto-save notification
    Given auto-save is enabled
    When ₹100 is credited to my savings wallet
    Then I should receive notification "🎉 ₹100 saved automatically!"

  Scenario: Payment failure notification
    Given I initiated a payment of ₹1,000
    When the payment fails
    Then I should receive notification "✗ Payment of ₹1,000 failed"
    And tapping it should show failure details

  Scenario: Money received notification
    Given someone sends me ₹500
    When I receive the money
    Then I should get notification "💰 You received ₹500 from John"
```

**API Endpoints:**
- `POST /notifications/send`
- `GET /notifications`

**Priority:** P0 (Must Have)
**Story Points:** 3
**Dependencies:** Story 2.1

---

### Story 6.2: Savings Milestone Notifications
**As a** user
**I want to** receive notifications for savings milestones
**So that** I feel motivated to continue saving

**Acceptance Criteria:**
```gherkin
Feature: Savings Milestone Notifications

  Scenario: Savings milestone reached
    Given my total lifetime savings is ₹9,950
    When I save ₹100 more
    And my total reaches ₹10,050
    Then I should receive notification "🏆 Milestone! You've saved ₹10,000!"

  Scenario: Savings streak notification
    Given I have saved money for 14 consecutive days
    When I save on the 15th day
    Then I should receive notification "🔥 15-day savings streak! Keep it up!"

  Scenario: Goal progress notification
    Given I have a goal "Vacation Fund" at 74% complete
    When I save more and reach 75%
    Then I should receive notification "Vacation Fund: 75% complete! ₹12,500 left"

  Scenario: Goal achieved notification
    Given I have a goal "Emergency Fund" with target ₹10,000
    When my goal balance reaches ₹10,000
    Then I should receive notification:
      """
      🎉 Goal Achieved!
      Emergency Fund complete!
      Tap to celebrate
      """
```

**Priority:** P1 (Should Have)
**Story Points:** 3
**Dependencies:** Story 3.3

---

### Story 6.3: Security Alerts
**As a** user
**I want to** receive security alerts for important account activities
**So that** I can detect unauthorized access

**Acceptance Criteria:**
```gherkin
Feature: Security Alerts

  Scenario: New device login alert
    Given someone logs into my account from a new device
    When login is successful
    Then I should receive push notification:
      """
      ⚠️ New login from OnePlus 11
      Location: Mumbai
      Time: 10:30 AM
      Not you? Contact support immediately
      """
    And I should receive an SMS alert

  Scenario: PIN change alert
    Given I changed my PIN
    When the change is successful
    Then I should receive notification "Your PIN was changed successfully"
    And if I didn't change it, I should see "Not you? Contact support"

  Scenario: Large transaction alert
    Given I make a payment of ₹50,000
    And my usual payments are < ₹5,000
    When the payment is successful
    Then I should receive notification "⚠️ Large payment: ₹50,000 to XYZ Merchant"

  Scenario: Account locked notification
    Given I entered wrong PIN 3 times
    When my account gets locked
    Then I should receive notification:
      """
      ⚠️ Account locked due to multiple failed login attempts
      Try again in 30 minutes
      """
```

**Priority:** P0 (Must Have)
**Story Points:** 5
**Dependencies:** Story 1.2

---

### Story 6.4: Manage Notification Preferences
**As a** user
**I want to** customize my notification preferences
**So that** I only receive notifications I care about

**Acceptance Criteria:**
```gherkin
Feature: Notification Preferences

  Scenario: View notification settings
    Given I am in Settings
    When I tap "Notifications"
    Then I should see categories:
      | Category             | Status | Can Disable |
      | Transaction Alerts   | ON     | Yes         |
      | Savings Updates      | ON     | Yes         |
      | Investment Updates   | ON     | Yes         |
      | Security Alerts      | ON     | No          |
      | Goals Progress       | ON     | Yes         |
      | Promotional          | OFF    | Yes         |

  Scenario: Disable promotional notifications
    Given promotional notifications are ON
    When I toggle "Promotional" to OFF
    And I save settings
    Then I should not receive any promotional notifications

  Scenario: Set quiet hours
    Given I want peace during night
    When I enable "Quiet Hours"
    And I set from "10:00 PM" to "8:00 AM"
    And I save
    Then no non-critical notifications should be sent during 10 PM - 8 AM
    But security alerts should still come through

  Scenario: Email notification preferences
    Given I want weekly summaries
    When I enable "Weekly Summary" for Email
    And disable "Investment Updates" for Email
    Then I should receive weekly email summaries
    But not individual investment update emails
```

**API Endpoints:**
- `GET /users/notification-preferences`
- `PUT /users/notification-preferences`

**Priority:** P1 (Should Have)
**Story Points:** 3
**Dependencies:** Stories 6.1, 6.2, 6.3

---

## Non-Functional Requirements (BDD Format)

### Performance
```gherkin
Feature: Application Performance

  Scenario: Fast app launch
    Given the app is installed
    When I tap the app icon
    Then the app should launch within 2 seconds
    And the splash screen should display immediately

  Scenario: Quick API responses
    Given I make an API request
    When the request is processed
    Then 95% of requests should respond within 500ms
    And 99% should respond within 1 second

  Scenario: Smooth scrolling
    Given I am viewing a long list (transaction history)
    When I scroll through the list
    Then the frame rate should be ≥ 55 FPS
    And scrolling should feel smooth

  Scenario: Handle concurrent users
    Given the system has 10,000 concurrent users
    When all users are actively transacting
    Then the system should maintain response times
    And no requests should timeout
```

### Security
```gherkin
Feature: Application Security

  Scenario: Encrypted data transmission
    Given I make any API request
    When data is transmitted
    Then it should use TLS 1.3 encryption
    And SSL pinning should be enforced

  Scenario: Secure data storage
    Given I have sensitive data (PIN, tokens)
    When data is stored on device
    Then it should be encrypted using AES-256
    And stored in secure keychain/keystore

  Scenario: Session timeout
    Given I am logged in
    When I am inactive for 30 minutes
    Then my session should expire
    And I should need to re-authenticate

  Scenario: PCI DSS compliance
    Given the app handles payment data
    When processing payments
    Then it should comply with PCI DSS Level 1 standards
```

### Reliability
```gherkin
Feature: System Reliability

  Scenario: High availability
    Given the system is in production
    When measured over a month
    Then uptime should be ≥ 99.9%
    And planned downtime should be < 4 hours/month

  Scenario: Data backup
    Given the system stores user data
    When backups are performed
    Then daily automated backups should occur
    And point-in-time recovery should be possible

  Scenario: Graceful error handling
    Given a backend service is down
    When I try to use that feature
    Then I should see a user-friendly error message
    And the app should not crash
    And I should be able to use other features
```

### Accessibility
```gherkin
Feature: Accessibility

  Scenario: Screen reader support
    Given I am a visually impaired user
    When I use a screen reader
    Then all UI elements should have proper labels
    And I should be able to navigate the entire app

  Scenario: Font scaling
    Given I have poor eyesight
    When I increase device font size
    Then app text should scale accordingly
    And layout should remain usable

  Scenario: Regional language support
    Given I prefer Hindi language
    When I change app language to Hindi
    Then all text should display in Hindi
    And number formatting should follow Indian standards (₹1,00,000)
```

---

## Story Point Reference

| Points | Complexity | Duration |
|--------|------------|----------|
| 1      | Trivial    | < 1 hour |
| 2      | Simple     | 2-4 hours |
| 3      | Easy       | 4-8 hours (1 day) |
| 5      | Medium     | 1-2 days |
| 8      | Complex    | 3-5 days |
| 13     | Very Complex | 1-2 weeks |
| 21     | Epic       | 2-3 weeks |

---

## Priority Levels

- **P0 (Must Have)**: Critical for MVP launch
- **P1 (Should Have)**: Important for MVP, can be deprioritized if needed
- **P2 (Nice to Have)**: Can be moved to post-MVP
- **P3 (Future)**: Planned for later phases

---

## Definition of Done

For each user story to be considered "Done":

1. ✅ All acceptance criteria pass
2. ✅ BDD scenarios automated (where applicable)
3. ✅ Unit tests written (≥ 80% coverage)
4. ✅ Integration tests pass
5. ✅ API documentation updated
6. ✅ UI/UX matches design mockups
7. ✅ Code review completed
8. ✅ QA testing completed
9. ✅ Performance benchmarks met
10. ✅ Security scan passed
11. ✅ Accessibility requirements met
12. ✅ Product owner approval
13. ✅ Deployed to staging environment
14. ✅ Release notes updated

---

## Sprint Planning Suggestion

### Sprint 1-2: Foundation (Weeks 1-4)
- Story 1.1: User Registration (8 pts)
- Story 1.2: User Login (5 pts)
- Story 3.1: Configure Auto-Save (5 pts)
- **Total**: 18 points

### Sprint 3-4: Core Payment (Weeks 5-8)
- Story 1.3: KYC Verification (13 pts)
- Story 2.1: UPI Payment (13 pts)
- Story 3.2: Savings Wallet (8 pts)
- **Total**: 34 points

### Sprint 5-6: Investments (Weeks 9-12)
- Story 4.1: Browse Products (5 pts)
- Story 4.2: Purchase Investment (8 pts)
- Story 4.3: Portfolio Management (8 pts)
- Story 2.2: Transaction History (5 pts)
- **Total**: 26 points

### Sprint 7-8: Polish & Secondary Features (Weeks 13-16)
- Story 3.3: Savings Goals (8 pts)
- Story 4.4: Auto-Invest (8 pts)
- Story 5.1: Financial Dashboard (5 pts)
- Story 6.1-6.4: Notifications (14 pts)
- **Total**: 35 points

---

These BDD user stories provide clear, testable acceptance criteria for every feature. Each story can be directly used by developers, QA engineers, and product managers to ensure consistent understanding and implementation.
