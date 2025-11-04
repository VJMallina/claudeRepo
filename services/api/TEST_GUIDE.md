# SaveInvest API - Testing Guide

## Overview

This project uses a comprehensive testing strategy with **Jest**, **Supertest**, and **Playwright** to ensure code quality and reliability.

```
Testing Pyramid:
                     ▲
                    / \
                   /   \
                  /  E2E \ ← Playwright (Swagger UI + Future Frontend)
                 /_______\
                /         \
               /Integration\ ← Supertest (API E2E)
              /___________\
             /             \
            /  Unit Tests   \ ← Jest (Services, Controllers)
           /_________________\
```

## Test Statistics

✅ **69+ Test Cases Created**

- **Unit Tests**: 50+ tests
  - auth.service.spec.ts (~25 tests)
  - otp.service.spec.ts (~10 tests)
  - users.service.spec.ts (~8 tests)
  - jwt.strategy.spec.ts (~5 tests)
  - auth.controller.spec.ts (~12 tests)
  - users.controller.spec.ts (~6 tests)

- **E2E Tests**: 15+ tests
  - auth.e2e-spec.ts (~10 tests)
  - users.e2e-spec.ts (~8 tests)

- **Playwright Tests**: 10+ tests
  - swagger-ui.spec.ts (~10 tests)

**Target Coverage**: 80%+

## Quick Start

### Run All Tests

```bash
# Run all tests (unit + E2E + Playwright)
npm run test:all

# Run only unit tests
npm test

# Run only E2E tests
npm run test:e2e

# Run only Playwright tests
npm run test:playwright
```

### Run Tests in Watch Mode

```bash
# Unit tests in watch mode
npm run test:watch

# E2E tests in watch mode
npm run test:e2e -- --watch
```

### Generate Coverage Report

```bash
npm run test:cov

# View coverage report
open coverage/lcov-report/index.html
```

## Test Structure

```
services/api/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts      ← Unit tests
│   │   ├── auth.controller.ts
│   │   ├── auth.controller.spec.ts   ← Controller tests
│   │   └── ...
│   └── users/
│       ├── users.service.ts
│       ├── users.service.spec.ts     ← Unit tests
│       └── ...
├── test/
│   ├── e2e/
│   │   ├── auth.e2e-spec.ts         ← API E2E tests
│   │   └── users.e2e-spec.ts        ← API E2E tests
│   └── jest-e2e.json                 ← E2E config
└── playwright/
    ├── tests/
    │   └── swagger-ui.spec.ts        ← Playwright tests
    ├── playwright.config.ts          ← Playwright config
    └── README.md                     ← Playwright guide
```

## 1. Unit Tests (Jest)

### What They Test

- **Services**: Business logic, validations, error handling
- **Controllers**: HTTP request/response handling
- **Strategies**: JWT validation
- **Guards**: Route protection

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test auth.service.spec.ts

# Run tests with coverage
npm run test:cov

# Run in watch mode
npm run test:watch
```

### Example Test

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  it('should register new user with OTP', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockOtpService.generateOtp.mockResolvedValue(undefined);

    const result = await service.register({ mobile: '9876543210' });

    expect(result).toEqual({
      success: true,
      message: 'OTP sent to your mobile number',
      expiresIn: 120,
    });
  });
});
```

### What's Tested

**auth.service.spec.ts** (~25 tests):
- ✅ User registration with OTP
- ✅ OTP verification
- ✅ Profile creation with age validation
- ✅ PIN setting with strength validation
- ✅ Login with PIN/OTP
- ✅ Token refresh
- ✅ Logout
- ✅ PIN reset

**otp.service.spec.ts** (~10 tests):
- ✅ OTP generation (6 digits, 2-min expiry)
- ✅ OTP verification with attempt limits
- ✅ Expired OTP handling
- ✅ SMS sending (dev mode logging)

**users.service.spec.ts** (~8 tests):
- ✅ User profile retrieval (without PIN)
- ✅ Profile updates
- ✅ Biometric enable/disable
- ✅ Related data inclusion

**jwt.strategy.spec.ts** (~5 tests):
- ✅ Token validation
- ✅ User retrieval from token
- ✅ Sensitive data exclusion

**auth.controller.spec.ts** (~12 tests):
- ✅ All endpoint handlers
- ✅ Request/response formats
- ✅ Guard protection

**users.controller.spec.ts** (~6 tests):
- ✅ Profile endpoints
- ✅ Biometric endpoints
- ✅ Authentication requirement

## 2. E2E Tests (Supertest)

### What They Test

Complete API flows with real HTTP requests, database interactions, and authentication.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- auth.e2e-spec.ts
```

### Prerequisites

```bash
# Start database services
npm run docker:up

# Run migrations
npx prisma migrate dev
```

### Example Test

```typescript
// auth.e2e-spec.ts
describe('Auth API (e2e)', () => {
  it('/auth/register (POST) - should send OTP', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ mobile: '9876543210' })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });
});
```

### What's Tested

**auth.e2e-spec.ts** (~10 tests):
- ✅ Complete registration flow
- ✅ OTP verification
- ✅ Profile creation
- ✅ PIN setting
- ✅ Login flows (PIN & OTP)
- ✅ Token refresh
- ✅ Logout
- ✅ PIN reset
- ✅ Validation errors

**users.e2e-spec.ts** (~8 tests):
- ✅ Profile retrieval with relations
- ✅ Profile updates
- ✅ Biometric management
- ✅ Authentication requirements
- ✅ Security (PIN not exposed)

## 3. Playwright Tests

### What They Test

Browser-based E2E tests for UI interactions.

**Current**: Swagger UI documentation
**Future**: React Native app, Admin dashboard

### Running Playwright Tests

```bash
# Run all Playwright tests
npm run test:playwright

# Run with browser visible
npm run test:playwright:headed

# Run in UI mode (interactive)
npm run test:playwright:ui

# Debug mode
npm run test:playwright:debug

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Example Test

```typescript
// swagger-ui.spec.ts
test('should load Swagger UI successfully', async ({ page }) => {
  await page.goto('/api/docs');

  const swaggerContainer = page.locator('.swagger-ui');
  await expect(swaggerContainer).toBeVisible();
});
```

### What's Tested

**swagger-ui.spec.ts** (~10 tests):
- ✅ Swagger UI loads correctly
- ✅ All endpoints documented
- ✅ Interactive "Try it out" functionality
- ✅ Mobile responsiveness
- ✅ Accessibility

**Future Tests** (when UI is built):
- 🔜 Mobile app registration flow
- 🔜 UPI payment with auto-save
- 🔜 Investment flows
- 🔜 Goal tracking
- 🔜 Admin dashboard

See `playwright/README.md` for comprehensive future test examples.

## Test Commands Reference

### Jest (Unit Tests)

```bash
npm test                    # Run all unit tests
npm run test:watch          # Watch mode
npm run test:cov            # With coverage
npm test -- auth.service    # Specific test
npm test -- --verbose       # Verbose output
```

### Supertest (E2E Tests)

```bash
npm run test:e2e            # Run all E2E tests
npm run test:e2e -- auth    # Specific test file
npm run test:e2e -- --watch # Watch mode
```

### Playwright (Browser Tests)

```bash
npm run test:playwright              # Run all
npm run test:playwright:headed       # See browser
npm run test:playwright:ui           # Interactive mode
npm run test:playwright:debug        # Debug mode
npx playwright show-report           # View last report
npx playwright codegen               # Generate tests
```

### Combined

```bash
npm run test:all            # Run ALL tests (unit + E2E + Playwright)
```

## Writing New Tests

### 1. Unit Test Template

```typescript
// feature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FeatureService } from './feature.service';

describe('FeatureService', () => {
  let service: FeatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeatureService],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests...
});
```

### 2. E2E Test Template

```typescript
// feature.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Feature API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/feature (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/feature')
      .expect(200);
  });
});
```

### 3. Playwright Test Template

```typescript
// feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Tests', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/feature');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci

      # Unit tests
      - run: npm test

      # E2E tests
      - run: docker-compose up -d
      - run: npx prisma migrate dev
      - run: npm run test:e2e

      # Playwright tests
      - run: npx playwright install --with-deps
      - run: npm run test:playwright

      # Upload coverage
      - uses: codecov/codecov-action@v3
```

## Debugging Tests

### Jest Debugging

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

### Playwright Debugging

```bash
# Step through tests
npx playwright test --debug

# Generate test code
npx playwright codegen http://localhost:3000

# View trace
npx playwright show-trace trace.zip
```

## Best Practices

### ✅ DO

- Write tests for all new features
- Test both success and failure scenarios
- Mock external dependencies
- Use descriptive test names
- Keep tests independent
- Test edge cases
- Aim for 80%+ coverage

### ❌ DON'T

- Test implementation details
- Make tests depend on each other
- Use real API keys in tests
- Hardcode test data
- Skip cleaning up test data
- Ignore failing tests

## Troubleshooting

### Tests Failing?

```bash
# Clear Jest cache
npm test -- --clearCache

# Update snapshots
npm test -- -u

# Run single test
npm test -- -t "test name"
```

### Database Issues?

```bash
# Restart services
docker-compose restart

# Reset database
npx prisma migrate reset

# Check connections
docker ps
```

### Playwright Issues?

```bash
# Reinstall browsers
npx playwright install

# Clear cache
npx playwright test --clear-cache

# Check server
curl http://localhost:3000/api/docs
```

## Coverage Goals

- **Overall**: 80%+
- **Services**: 85%+
- **Controllers**: 75%+
- **Critical Paths**: 100%

View coverage:
```bash
npm run test:cov
open coverage/lcov-report/index.html
```

## Next Steps

1. ✅ Run all tests: `npm run test:all`
2. ✅ Check coverage: `npm run test:cov`
3. 🔜 Add tests for new features
4. 🔜 Set up CI/CD pipeline
5. 🔜 Add Playwright tests when UI is built

## Resources

- [Jest Documentation](https://jestjs.io)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [Playwright Docs](https://playwright.dev)

---

**Questions?** Check the individual test files for examples or refer to the Playwright README for future UI test templates.
