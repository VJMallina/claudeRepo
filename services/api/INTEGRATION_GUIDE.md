# 🚀 SaveInvest Integration Guide

Complete guide for setting up and testing all third-party integrations in **TEST/SANDBOX MODE**.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Mode vs Production Mode](#test-mode-vs-production-mode)
3. [Quick Start](#quick-start)
4. [Integration Setup](#integration-setup)
   - [Twilio SMS/OTP](#1-twilio-smsotp)
   - [Razorpay Payments](#2-razorpay-payments)
   - [PAN Verification](#3-pan-verification)
   - [Aadhaar Verification](#4-aadhaar-verification)
   - [Azure Face API](#5-azure-face-api)
   - [Bank Verification](#6-bank-verification)
5. [Test Data](#test-data)
6. [Cost Breakdown](#cost-breakdown)
7. [Production Deployment](#production-deployment)

---

## Overview

SaveInvest uses multiple third-party integrations for KYC, payments, and notifications. **All integrations support FREE test/sandbox mode** for development and testing.

### Supported Integrations

| Service | Purpose | Test Mode | Free Tier |
|---------|---------|-----------|-----------|
| **Twilio** | SMS OTP | ✅ Magic numbers | Yes (Trial) |
| **Razorpay** | Payments | ✅ Test mode | Yes |
| **PAN API** | PAN verification | ✅ Mock/Sandbox | Some providers |
| **Aadhaar API** | Aadhaar verification | ✅ UIDAI test numbers | Sandbox only |
| **Azure Face API** | Liveness detection | ✅ Free tier | 30K/month free |
| **AWS S3** | Document storage | ✅ Free tier | 5GB free |

---

## Test Mode vs Production Mode

### Test Mode (NODE_ENV=development)

- **No real API calls** or minimal cost
- **Console-based OTPs** logged for testing
- **Mock responses** for KYC verification
- **Test data** accepted (test PANs, Aadhaar numbers)
- **Perfect for local development**

### Production Mode

- Real API calls with actual credentials
- SMS sent via Twilio
- Real KYC verification
- Payment processing via Razorpay

---

## Quick Start

### 1. Copy Environment Variables

```bash
cd services/api
cp .env.example .env
```

### 2. Keep Test Mode (Default)

```env
NODE_ENV=development
```

### 3. Start the Server

```bash
npm install
npm run dev
```

### 4. Test with Console OTPs

When you register or login, OTPs will be printed in the console:

```
📱 [TEST MODE] OTP for 9876543210: 123456
   Valid for 2 minutes
   Use this code to verify your mobile number
```

---

## Integration Setup

### 1. Twilio SMS/OTP

#### Test Mode Setup (FREE)

**No credentials needed!** OTPs are logged to console in development mode.

```env
NODE_ENV=development
# Leave Twilio credentials empty for test mode
```

#### Get Free Test Credentials

1. Sign up at [Twilio Console](https://console.twilio.com)
2. Get **Account SID** and **Auth Token**
3. Use **Magic Test Numbers** (no SMS sent, no cost)

```env
TWILIO_ACCOUNT_SID=your_test_account_sid
TWILIO_AUTH_TOKEN=your_test_auth_token
TWILIO_PHONE_NUMBER=+15005550006
```

#### Magic Test Phone Numbers

These numbers work with Twilio test credentials **without sending real SMS**:

| Number | Behavior |
|--------|----------|
| +15005550006 | Valid, SMS "sent" successfully |
| +15005550000 | Invalid number |
| +15005550001 | Cannot route to this number |
| +15005550007 | Number not owned by account |

#### How It Works

```typescript
// In development mode, OTPs are logged:
if (nodeEnv === 'development' || !twilioAccountSid) {
  console.log(`📱 [TEST MODE] OTP for ${mobile}: ${code}`);
  return;
}

// In production mode, real SMS sent via Twilio
const client = twilio(twilioAccountSid, twilioAuthToken);
await client.messages.create({
  body: `Your SaveInvest OTP is: ${code}`,
  from: twilioPhoneNumber,
  to: `+91${mobile}`,
});
```

---

### 2. Razorpay Payments

#### Test Mode Setup (FREE)

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Switch to **Test Mode** (toggle in top-left)
3. Get **Test API Keys**

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key
```

#### Test Card Numbers

Use these test cards in Razorpay test mode:

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success |
| 5555 5555 5555 4444 | Success |
| 4000 0000 0000 0002 | Failure |

**CVV:** Any 3 digits
**Expiry:** Any future date
**OTP:** 1234 or 0007

#### UPI Test VPAs

| VPA | Result |
|-----|--------|
| success@razorpay | Success |
| failure@razorpay | Failure |

#### Cost

- **Test Mode:** 100% FREE, unlimited transactions
- **Production:** 2% per transaction (₹2 on ₹100)

---

### 3. PAN Verification

#### Test Mode Setup (FREE)

**No credentials needed!** Test mode uses mock verification.

```env
NODE_ENV=development
# Leave PAN API credentials empty for test mode
```

#### Test PAN Numbers

| PAN Number | Result |
|------------|--------|
| AAAAA0000A | ✅ Valid (Success) |
| BBBBB1111B | ❌ Invalid (Failure) |
| CCCCC2222C | ✅ Valid (Company) |
| DDDDD3333D | ❌ Invalid |
| Any valid format | ✅ Valid (Default in test mode) |

#### PAN Format

- 5 letters (uppercase)
- 4 digits
- 1 letter (uppercase)
- Example: `ABCDE1234F`

#### Production Setup (Optional)

For production, use one of these providers:

**Option 1: Surepass (Sandbox available)**
```env
PAN_VERIFICATION_API_KEY=your_surepass_sandbox_key
PAN_VERIFICATION_API_URL=https://sandbox.surepass.io/api/v1/pan/verify
```

Cost: ₹3-5 per verification

**Option 2: Signzy (Test mode available)**
- Free tier: 100 verifications/month
- Cost: ₹5 per verification after

**Option 3: IDfy**
- Cost: ₹3-4 per verification

---

### 4. Aadhaar Verification

#### Test Mode Setup (FREE)

**No credentials needed!** Test mode uses UIDAI test numbers.

```env
NODE_ENV=development
# Leave Aadhaar API credentials empty for test mode
```

#### Test Aadhaar Numbers (UIDAI Official)

These are **official UIDAI test numbers** for sandbox environments:

| Aadhaar Number | Name | DOB | Gender |
|----------------|------|-----|--------|
| 999999990019 | Rahul Kumar | 15/08/1990 | M |
| 999999990028 | Priya Sharma | 22/03/1995 | F |
| 999999990037 | Amit Patel | 10/12/1988 | M |
| 999999990046 | Neha Singh | 05/06/1992 | F |
| 111111110000 | ❌ Invalid (Failure) | - | - |

#### How Test Flow Works

1. **Initiate Verification:**
   ```bash
   POST /api/kyc/verify-aadhaar
   Body: { "aadhaarNumber": "999999990019" }
   ```

2. **Console Output:**
   ```
   🧪 [TEST MODE] Initiating Aadhaar verification: XXXX-XXXX-0019
      📱 Test Aadhaar OTP: 543210
      🔑 Reference ID: abc123def456...
      ⏱️  Valid for 2 minutes
   ```

3. **Verify OTP:**
   ```bash
   POST /api/kyc/verify-aadhaar-otp
   Body: { "referenceId": "abc123...", "otp": "543210" }
   ```

4. **Success Response:**
   ```json
   {
     "verified": true,
     "fullName": "Rahul Kumar",
     "dob": "15/08/1990",
     "gender": "M",
     "address": "House No. 123, MG Road, Sector 15, Mumbai, Maharashtra, 400001"
   }
   ```

#### Production Setup (Optional)

**Option 1: DigiLocker API (FREE for government use)**
```env
DIGILOCKER_CLIENT_ID=your_client_id
DIGILOCKER_CLIENT_SECRET=your_client_secret
DIGILOCKER_REDIRECT_URI=http://localhost:3000/api/kyc/digilocker/callback
```

**Option 2: UIDAI eKYC**
- Requires UIDAI approval and license
- Cost: Varies by volume

**Option 3: Third-party providers (Surepass, Signzy, IDfy)**
- Cost: ₹5-10 per verification

---

### 5. Azure Face API

#### Test Mode Setup (FREE)

**No credentials needed!** Test mode uses mock liveness detection.

```env
NODE_ENV=development
# Leave Azure credentials empty for test mode
```

#### Get Free Tier (30,000 transactions/month)

1. Sign up at [Azure Portal](https://portal.azure.com)
2. Create **Face API** resource
3. Get **API Key** and **Endpoint**

```env
AZURE_FACE_API_KEY=your_azure_face_api_key
AZURE_FACE_API_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
```

#### Test Mode Output

```
🧪 [TEST MODE] Detecting face: https://example.com/selfie.jpg
   ✅ Face detected
   📊 Quality Score: 87.3
   🎭 Liveness Score: 84.5
```

#### How It Works

- **Test Mode:** Returns mock liveness scores (75-95%)
- **Production Mode:** Uses Azure Face API for real detection
  - Face detection
  - Liveness verification (blink, smile, head movement)
  - Face matching with Aadhaar photo

#### Cost

- **Free Tier:** 30,000 transactions/month (enough for testing)
- **Paid:** $1 per 1,000 transactions after free tier

---

### 6. Bank Verification

#### Test Mode Setup (FREE)

**No credentials needed!** Test mode uses mock penny drop.

```env
NODE_ENV=development
```

#### Test IFSC Codes

The app uses **Razorpay's FREE IFSC API** for bank details:
- URL: `https://ifsc.razorpay.com/{IFSC_CODE}`
- **100% FREE**, no API key needed

| IFSC Code | Bank | Branch |
|-----------|------|--------|
| SBIN0001234 | State Bank of India | Main Branch, Mumbai |
| HDFC0001234 | HDFC Bank | Andheri Branch, Mumbai |
| ICIC0001234 | ICICI Bank | Koramangala Branch, Bangalore |
| AXIS0001234 | Axis Bank | MG Road Branch, Pune |

#### Test Account Numbers

| Account Number | Result |
|----------------|--------|
| 0000000000 | ❌ Invalid (Failure) |
| 1111111111 | ❌ Invalid (Failure) |
| Any other number | ✅ Valid (Success in test mode) |

#### Production Setup (Optional)

**Option 1: Razorpay Fund Account Validation**
```env
# Use same Razorpay credentials as payments
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key
```

Cost: ₹3 per verification

**Option 2: Cashfree Penny Drop**
Cost: ₹2-3 per verification

---

## Test Data

### Complete Test Dataset for E2E Testing

```javascript
// User Registration
{
  mobile: "9876543210",
  otp: "Check console output",
  name: "Test User",
  email: "test@example.com",
  dob: "1990-01-01"
}

// KYC - PAN Verification
{
  panNumber: "AAAAA0000A",
  panName: "Test User"
}

// KYC - Aadhaar Verification
{
  aadhaarNumber: "999999990019",
  otp: "Check console output after initiation"
}

// KYC - Bank Verification
{
  accountNumber: "1234567890",
  ifscCode: "SBIN0001234",
  accountHolderName: "Test User"
}

// Payment Testing
{
  amount: 1000,
  card: "4111 1111 1111 1111",
  cvv: "123",
  expiry: "12/25",
  otp: "1234"
}
```

---

## Cost Breakdown

### Test/Development (Current Setup)

| Service | Cost |
|---------|------|
| Twilio (Console OTP) | **FREE** |
| Razorpay (Test Mode) | **FREE** |
| PAN (Mock) | **FREE** |
| Aadhaar (Test numbers) | **FREE** |
| Azure Face (Test mode) | **FREE** |
| Bank IFSC (Razorpay API) | **FREE** |
| **TOTAL** | **₹0/month** |

### Production (Estimated for 1,000 users/month)

| Service | Volume | Cost per Transaction | Total |
|---------|--------|---------------------|-------|
| Twilio SMS | 2,000 OTPs | ₹0.50 | ₹1,000 |
| Razorpay | 500 payments | 2% (avg ₹4/txn) | ₹2,000 |
| PAN Verification | 1,000 verifications | ₹4 | ₹4,000 |
| Aadhaar Verification | 1,000 verifications | ₹8 | ₹8,000 |
| Face Detection | 1,000 checks | ₹0.07 | ₹70 |
| Bank Verification | 1,000 checks | ₹3 | ₹3,000 |
| AWS S3 Storage | ~10GB | ~₹1.50/GB | ₹15 |
| **TOTAL** | | | **~₹18,085/month** |

**Cost per user:** ~₹18

---

## Production Deployment

### Environment Variables Checklist

```bash
# Copy example and fill production values
cp .env.example .env.production
```

### Production .env Configuration

```env
# Change to production
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=your-super-strong-production-secret
JWT_REFRESH_SECRET=your-super-strong-refresh-secret

# Twilio (Production)
TWILIO_ACCOUNT_SID=your_production_account_sid
TWILIO_AUTH_TOKEN=your_production_auth_token
TWILIO_PHONE_NUMBER=+91XXXXXXXXXX

# Razorpay (Live Mode)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_secret_key

# Azure Face API
AZURE_FACE_API_KEY=your_production_key
AZURE_FACE_API_ENDPOINT=https://your-resource.cognitiveservices.azure.com/

# PAN Verification (Choose provider)
PAN_VERIFICATION_API_KEY=your_production_key
PAN_VERIFICATION_API_URL=https://api.provider.com/pan/verify

# Aadhaar Verification (Choose provider)
AADHAAR_API_KEY=your_production_key
AADHAAR_API_URL=https://api.provider.com/aadhaar

# AWS S3 (Production)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=saveinvest-production-docs
```

### Production Checklist

- [ ] Switch `NODE_ENV` to `production`
- [ ] Update all API keys to production/live mode
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up proper database backups
- [ ] Configure CORS for production domains
- [ ] Enable rate limiting and security headers
- [ ] Set up monitoring (Sentry, New Relic, etc.)
- [ ] Test all integrations in staging first
- [ ] Verify webhook endpoints for Razorpay
- [ ] Set up proper logging and error tracking

---

## Testing Guide

### 1. Test SMS/OTP Flow

```bash
# Register new user
POST /api/auth/register
{
  "mobile": "9876543210"
}

# Check console for OTP
# Console output: 📱 [TEST MODE] OTP for 9876543210: 123456

# Verify OTP
POST /api/auth/verify-otp
{
  "mobile": "9876543210",
  "code": "123456"
}
```

### 2. Test PAN Verification

```bash
POST /api/kyc/verify-pan
{
  "panNumber": "AAAAA0000A",
  "panName": "Test User"
}

# Expected response:
{
  "verified": true,
  "message": "PAN verified successfully (TEST MODE)"
}
```

### 3. Test Aadhaar Flow

```bash
# Step 1: Initiate verification
POST /api/kyc/verify-aadhaar
{
  "aadhaarNumber": "999999990019"
}

# Response includes OTP in test mode
{
  "success": true,
  "referenceId": "abc123...",
  "otp": "543210"
}

# Step 2: Verify OTP
POST /api/kyc/verify-aadhaar-otp
{
  "referenceId": "abc123...",
  "otp": "543210"
}
```

### 4. Test Payment Flow

```bash
# Create payment order
POST /api/payments/create-order
{
  "amount": 1000,
  "merchantName": "Test Merchant"
}

# Use Razorpay test card: 4111 1111 1111 1111
# Complete payment on Razorpay checkout

# Verify payment
POST /api/payments/verify
{
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "..."
}
```

---

## Support

For issues or questions:
1. Check console logs for detailed test mode output
2. Verify `.env` configuration
3. Ensure `NODE_ENV=development` for test mode
4. Review API documentation at `/api/docs`

---

## Next Steps

1. ✅ Test all flows in development mode
2. ✅ Verify console OTPs work
3. ✅ Test KYC verification with test data
4. ✅ Test payments with Razorpay test mode
5. 📝 Sign up for free tiers when ready
6. 🚀 Switch to production when launching

---

**Happy Testing! 🎉**
