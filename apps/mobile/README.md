# SaveInvest Mobile App

React Native mobile application for the SaveInvest automated savings and investment platform.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **UI Library**: React Native Paper (Material Design)
- **API Client**: Axios
- **Secure Storage**: Expo Secure Store
- **Authentication**: JWT with automatic token refresh

## Features

### Implemented

- ✅ **Authentication Flow**
  - Mobile number registration
  - OTP verification
  - Automatic token management
  - Secure token storage

- ✅ **Progressive KYC Onboarding**
  - Profile setup
  - PAN verification (Level 1)
  - Aadhaar verification (Level 2)
  - Liveness detection
  - Bank account linking

- ✅ **Main Dashboard**
  - KYC status display
  - Feature access based on KYC level
  - Quick actions
  - Savings & investment overview

- ✅ **Feature Screens**
  - Payments (with auto-savings)
  - Savings wallet
  - Investments (KYC-gated)
  - User profile

## Project Structure

```
apps/mobile/
├── src/
│   ├── components/       # Reusable UI components
│   ├── navigation/       # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── OnboardingNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── onboarding/   # KYC onboarding screens
│   │   └── main/         # Main app screens
│   ├── services/         # API services
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── kyc.service.ts
│   │   └── onboarding.service.ts
│   ├── store/            # State management
│   │   ├── authStore.ts
│   │   └── onboardingStore.ts
│   ├── types/            # TypeScript types
│   │   └── api.types.ts
│   ├── theme/            # Theme configuration
│   │   └── theme.ts
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
├── App.tsx               # Root component
├── app.json              # Expo configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Navigate to mobile app directory
cd apps/mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Environment Configuration

Create a `.env` file in `apps/mobile/`:

```env
API_URL=http://localhost:3000/api/v1
```

For production, update `app.config.js` with your production API URL.

## API Integration

The app connects to the NestJS backend API. Ensure the backend is running:

```bash
# From project root
npm run dev:api
```

Backend should be running at `http://localhost:3000/api/v1`

## Authentication

- Uses JWT tokens (access + refresh)
- Tokens stored securely in Expo Secure Store
- Automatic token refresh on 401 errors
- Biometric authentication (planned)

## KYC Levels

| Level | Requirements | Unlocked Features |
|-------|-------------|-------------------|
| **0** | Phone verification | Payments up to ₹10,000 |
| **1** | + PAN verification | Unlimited payments |
| **2** | + Aadhaar + Liveness + Bank | Investments, Withdrawals |

## Navigation Flow

```
App Start
    ↓
Check Auth
    ↓
┌─────────┴─────────┐
│                   │
NOT AUTH          AUTH
    ↓                ↓
Auth Stack     Check Onboarding
    ↓                ↓
Login          ┌─────┴─────┐
    ↓          │           │
OTP       INCOMPLETE   COMPLETE
    ↓          ↓           ↓
Register   Onboarding   Main Stack
              Stack         ↓
                ↓      Dashboard
           Profile          │
           PAN Ver.    ├─ Payments
           Aadhaar     ├─ Savings
           Liveness    ├─ Investments
           Bank Acct   └─ Profile
```

## State Management

Using Zustand for simple, performant state management:

- **authStore**: User authentication state
- **onboardingStore**: KYC onboarding progress

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build standalone app
eas build --platform all
```

## Known Issues & TODOs

- [ ] Camera integration for liveness detection
- [ ] Push notifications setup
- [ ] Biometric authentication
- [ ] Payment gateway integration
- [ ] Investment fund selection UI
- [ ] Charts and analytics
- [ ] Offline support
- [ ] Error boundary implementation

## Contributing

1. Create feature branch from `main`
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

Proprietary - All rights reserved
