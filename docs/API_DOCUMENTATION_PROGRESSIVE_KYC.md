# Progressive KYC & Bank Accounts API Documentation

**Version:** 1.0
**Last Updated:** November 2025
**Base URL:** `https://api.saveinvest.app/v1`

This document covers the new API endpoints added for Progressive KYC, Bank Accounts Management, and Onboarding Flow.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Onboarding Flow APIs](#onboarding-flow-apis)
3. [KYC APIs (Enhanced)](#kyc-apis-enhanced)
4. [Bank Accounts Management APIs](#bank-accounts-management-apis)
5. [Error Codes](#error-codes)
6. [KYC Level System](#kyc-level-system)

---

## Authentication

All endpoints (except registration/login) require JWT authentication:

```http
Authorization: Bearer <jwt_token>
```

---

## Onboarding Flow APIs

### 1. Get Onboarding Status

Get current onboarding progress, KYC level, and feature permissions.

**Endpoint:** `GET /onboarding/status`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "currentStep": "DASHBOARD",
  "kycLevel": 0,
  "kycStatus": "PENDING",
  "completionStatus": {
    "profileComplete": true,
    "pinSetup": true,
    "biometricEnabled": true,
    "panVerified": false,
    "aadhaarVerified": false,
    "livenessVerified": false,
    "bankAccountAdded": false
  },
  "nextSteps": [
    "Complete KYC to unlock all features",
    "Add bank account for withdrawals"
  ],
  "permissions": {
    "canMakePayments": true,
    "maxPaymentAmount": 10000,
    "canInvest": false,
    "canWithdraw": false
  }
}
```

---

### 2. Check KYC Requirement

Pre-check if KYC is required for a specific action before attempting it.

**Endpoint:** `GET /onboarding/check-kyc-requirement`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `action` (required): `PAYMENT` or `INVESTMENT`
- `amount` (optional): Payment amount (required for PAYMENT action)

**Example Request:**
```http
GET /onboarding/check-kyc-requirement?action=PAYMENT&amount=15000
```

**Response:** `200 OK`
```json
{
  "required": true,
  "requiredLevel": 1,
  "currentLevel": 0,
  "message": "KYC Level 1 required for payments above ₹10,000",
  "nextSteps": [
    "Verify PAN card"
  ]
}
```

**Example Response (KYC not required):**
```json
{
  "required": false,
  "requiredLevel": 0,
  "currentLevel": 1,
  "message": "No KYC requirement for this action"
}
```

---

## KYC APIs (Enhanced)

### 3. Get KYC Status

Get detailed KYC verification status with completion percentage.

**Endpoint:** `GET /kyc/status`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "userId": "user-uuid-123",
  "kycStatus": "IN_PROGRESS",
  "completionPercentage": 33,
  "verificationStatus": {
    "panVerified": true,
    "aadhaarVerified": false,
    "bankVerified": false,
    "selfieVerified": false
  },
  "nextSteps": [
    "Verify Aadhaar",
    "Complete liveness verification"
  ],
  "kycDocument": {
    "id": "kyc-doc-uuid",
    "userId": "user-uuid-123",
    "panNumber": "ABCDE1234F",
    "panName": "JOHN DOE",
    "panVerified": true,
    "aadhaarNumber": "XXXX-XXXX-1234",
    "aadhaarVerified": false,
    "selfieUrl": null,
    "faceMatched": false,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-02T10:30:00Z"
  }
}
```

---

### 4. Verify PAN Card (Level 1 KYC)

Verify PAN card to unlock higher payment limits.

**Endpoint:** `POST /kyc/verify-pan`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "panNumber": "ABCDE1234F",
  "panName": "JOHN DOE"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "PAN verified successfully",
  "verified": true,
  "panNumber": "ABCDE1234F",
  "panName": "JOHN DOE",
  "dob": "01/01/1990"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid PAN format or verification failed
- `409 Conflict`: PAN already registered with another account

---

### 5. Initiate Aadhaar Verification

Start Aadhaar verification by sending OTP to Aadhaar-linked mobile.

**Endpoint:** `POST /kyc/verify-aadhaar/initiate`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "aadhaarNumber": "123456789012"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent to Aadhaar-linked mobile number",
  "referenceId": "ref-abc-123-xyz",
  "expiresIn": 120
}
```

**Error Responses:**
- `400 Bad Request`: Invalid Aadhaar format
- `409 Conflict`: Aadhaar already registered with another account

---

### 6. Complete Aadhaar Verification

Verify OTP and complete Aadhaar verification.

**Endpoint:** `POST /kyc/verify-aadhaar/complete`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "otp": "123456",
  "referenceId": "ref-abc-123-xyz"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Aadhaar verified successfully",
  "verified": true,
  "aadhaarNumber": "XXXX-XXXX-9012",
  "aadhaarData": {
    "name": "John Doe",
    "dob": "01/01/1990",
    "gender": "M",
    "address": "Mumbai, Maharashtra, India"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or expired OTP

---

### 7. Verify Liveness (Level 2 KYC - Part 2)

Perform liveness detection and face matching for full KYC.

**Endpoint:** `POST /kyc/verify-liveness`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "selfieUrl": "https://s3.amazonaws.com/selfies/selfie_123.jpg",
  "videoUrl": "https://s3.amazonaws.com/videos/liveness_123.mp4"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Liveness verified successfully",
  "verified": true,
  "livenessScore": 95.5,
  "faceMatched": true,
  "selfieUrl": "https://s3.amazonaws.com/selfies/selfie_123.jpg",
  "livenessDetails": {
    "blinkDetected": true,
    "smileDetected": true,
    "headTurnDetected": true,
    "qualityScore": 92.0
  }
}
```

**Error Responses:**
- `400 Bad Request`: Liveness detection failed, Aadhaar not verified, or face does not match

---

## Bank Accounts Management APIs

### 8. Add Bank Account

Add a new bank account for withdrawals.

**Endpoint:** `POST /bank-accounts`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "accountNumber": "1234567890123456",
  "ifscCode": "SBIN0001234",
  "accountHolderName": "JOHN DOE",
  "accountType": "SAVINGS",
  "bankName": "State Bank of India",
  "branchName": "Mumbai Main Branch"
}
```

**Response:** `201 Created`
```json
{
  "id": "bank-acc-uuid-123",
  "userId": "user-uuid-123",
  "accountNumber": "****1456",
  "ifscCode": "SBIN0001234",
  "accountHolderName": "JOHN DOE",
  "bankName": "State Bank of India",
  "branchName": "Mumbai Main Branch",
  "accountType": "SAVINGS",
  "isPrimary": true,
  "isVerified": false,
  "verificationMethod": null,
  "verifiedAt": null,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

**Notes:**
- First bank account is automatically set as primary
- Account number is encrypted and masked in responses

**Error Responses:**
- `409 Conflict`: Bank account already exists

---

### 9. Get All Bank Accounts

List all bank accounts linked to the user.

**Endpoint:** `GET /bank-accounts`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "bank-acc-uuid-123",
    "userId": "user-uuid-123",
    "accountNumber": "****1456",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "JOHN DOE",
    "bankName": "State Bank of India",
    "branchName": "Mumbai Main Branch",
    "accountType": "SAVINGS",
    "isPrimary": true,
    "isVerified": true,
    "verificationMethod": "PENNY_DROP",
    "verifiedAt": "2025-01-02T10:00:00Z",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-02T10:00:00Z"
  },
  {
    "id": "bank-acc-uuid-456",
    "userId": "user-uuid-123",
    "accountNumber": "****7890",
    "ifscCode": "HDFC0001234",
    "accountHolderName": "JOHN DOE",
    "bankName": "HDFC Bank",
    "accountType": "SAVINGS",
    "isPrimary": false,
    "isVerified": false,
    "verificationMethod": null,
    "verifiedAt": null,
    "createdAt": "2025-01-03T00:00:00Z",
    "updatedAt": "2025-01-03T00:00:00Z"
  }
]
```

---

### 10. Get Primary Bank Account

Get the primary bank account (used for withdrawals by default).

**Endpoint:** `GET /bank-accounts/primary`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "id": "bank-acc-uuid-123",
  "userId": "user-uuid-123",
  "accountNumber": "****1456",
  "ifscCode": "SBIN0001234",
  "accountHolderName": "JOHN DOE",
  "bankName": "State Bank of India",
  "accountType": "SAVINGS",
  "isPrimary": true,
  "isVerified": true,
  "verificationMethod": "PENNY_DROP",
  "verifiedAt": "2025-01-02T10:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-02T10:00:00Z"
}
```

**Error Responses:**
- `404 Not Found`: No primary account found

---

### 11. Update Bank Account

Update bank account details (only unverified accounts).

**Endpoint:** `PUT /bank-accounts/:id`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "accountHolderName": "JOHN M DOE",
  "bankName": "State Bank of India",
  "branchName": "Mumbai Fort Branch"
}
```

**Response:** `200 OK`
```json
{
  "id": "bank-acc-uuid-123",
  "userId": "user-uuid-123",
  "accountNumber": "****1456",
  "ifscCode": "SBIN0001234",
  "accountHolderName": "JOHN M DOE",
  "bankName": "State Bank of India",
  "branchName": "Mumbai Fort Branch",
  "accountType": "SAVINGS",
  "isPrimary": true,
  "isVerified": false,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Cannot update verified account
- `404 Not Found`: Bank account not found

---

### 12. Set Primary Bank Account

Set a bank account as primary for withdrawals.

**Endpoint:** `PUT /bank-accounts/:id/primary`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "message": "Primary account updated successfully"
}
```

**Error Responses:**
- `404 Not Found`: Bank account not found

---

### 13. Verify Bank Account

Verify bank account using penny drop verification.

**Endpoint:** `POST /bank-accounts/:id/verify`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Bank account verified successfully",
  "verificationMethod": "PENNY_DROP",
  "accountHolderName": "JOHN DOE",
  "bankName": "State Bank of India"
}
```

**Error Responses:**
- `400 Bad Request`: Verification failed or already verified
- `404 Not Found`: Bank account not found

---

### 14. Delete Bank Account

Remove a bank account from the user's profile.

**Endpoint:** `DELETE /bank-accounts/:id`

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:** `204 No Content`

**Error Responses:**
- `400 Bad Request`: Cannot delete primary account without setting another as primary
- `404 Not Found`: Bank account not found

---

## Error Codes

### KYC Related Errors

**400 Bad Request - KYC Required:**
```json
{
  "statusCode": 400,
  "message": "KYC Level 1 required for payments above ₹10,000",
  "error": "Bad Request",
  "kycRequired": true,
  "requiredLevel": 1,
  "currentLevel": 0,
  "nextSteps": [
    "Verify PAN card to unlock higher payment limits"
  ]
}
```

**400 Bad Request - Full KYC Required:**
```json
{
  "statusCode": 400,
  "message": "Full KYC required for investments",
  "error": "Bad Request",
  "kycRequired": true,
  "requiredLevel": 2,
  "currentLevel": 1,
  "nextSteps": [
    "Verify Aadhaar",
    "Complete liveness verification"
  ]
}
```

---

## KYC Level System

### Level 0: No KYC
- **Requirements:** Basic registration only
- **Features:**
  - Payments up to ₹10,000/transaction
  - Savings wallet
  - View investment products
- **Limits:**
  - Max ₹10,000 per transaction
  - Daily: ₹50,000
  - Monthly: ₹200,000

### Level 1: PAN Verified
- **Requirements:** PAN card verification
- **Additional Features:**
  - Unlimited payments
  - Higher transaction limits
  - Premium features
- **Limits:**
  - Max ₹100,000 per transaction
  - Daily: ₹500,000
  - Monthly: Unlimited

### Level 2: Full KYC
- **Requirements:** PAN + Aadhaar + Liveness + Bank account verification
- **Additional Features:**
  - Investment purchases
  - Withdrawals to bank account
  - Full platform access
- **Limits:**
  - Unlimited

---

## Withdrawal with Bank Selection

### Enhanced Withdrawal API

**Endpoint:** `POST /savings/withdraw`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 5000,
  "bankAccountId": "bank-acc-uuid-123",
  "reason": "Emergency expense"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Withdrawal of ₹5000 initiated to JOHN DOE (SBIN0001234)",
  "newBalance": 15000,
  "bankAccountId": "bank-acc-uuid-123"
}
```

**Notes:**
- If `bankAccountId` is not provided, primary bank account is used
- User must have at least one verified bank account
- Bank account must be verified to withdraw

**Error Responses:**
- `400 Bad Request`: No bank account found, bank account not verified, or insufficient balance

---

## Rate Limits

All authenticated endpoints are rate-limited to:
- **100 requests per minute** per user
- Rate limit headers included in response:
  ```http
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1672531200
  ```

---

## Integration Notes

### Third-Party API Integration Status

| Service | Provider | Status | Notes |
|---------|----------|--------|-------|
| PAN Verification | NSDL / IT Dept | Mock Implementation | Ready for production API |
| Aadhaar Verification | DigiLocker | Mock Implementation | Ready for production API |
| Liveness Detection | AWS Rekognition | Mock Implementation | Ready for production API |
| Bank Verification | Razorpay / Cashfree | Mock Implementation | Ready for production API |

All mock implementations return realistic success rates and include proper error handling for production readiness.

---

## Postman Collection

Import the Postman collection for easy API testing:
- [Progressive KYC APIs Postman Collection](./postman/progressive-kyc-collection.json)

---

## Changelog

### Version 1.0 (November 2025)
- ✅ Added Progressive KYC system (3 levels)
- ✅ Added Bank Accounts Management (8 endpoints)
- ✅ Added Onboarding Flow APIs (2 endpoints)
- ✅ Added Liveness Detection
- ✅ Enhanced KYC APIs with level progression
- ✅ Added KYC enforcement in Payments and Investments
- ✅ Added bank selection for withdrawals

---

**For support:** api-support@saveinvest.app
**Documentation:** https://docs.saveinvest.app/api
