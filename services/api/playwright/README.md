# Playwright E2E Testing Guide

## Current Status

✅ **Playwright is configured and ready to use**

Currently testing:
- Swagger UI documentation interface

## Running Tests

```bash
# Run all Playwright tests
npm run test:playwright

# Run tests in headed mode (see browser)
npm run test:playwright:headed

# Run tests in UI mode (interactive)
npm run test:playwright:ui

# Run specific test file
npx playwright test swagger-ui.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Debug tests
npx playwright test --debug
```

## Current Tests

### Swagger UI Tests (`swagger-ui.spec.ts`)

Tests the interactive API documentation:
- ✅ Swagger UI loads correctly
- ✅ All auth endpoints are documented
- ✅ All user endpoints are documented
- ✅ Interactive "Try it out" functionality
- ✅ Mobile responsiveness
- ✅ Accessibility checks

## Future UI Tests

When the frontend applications are built, add comprehensive E2E tests here.

### React Native Mobile App Tests (Future)

Create test files in `playwright/tests/mobile/`:

```typescript
// playwright/tests/mobile/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mobile App - Registration Flow', () => {
  test('User can complete registration', async ({ page }) => {
    await page.goto('http://localhost:19006');

    // Step 1: Welcome screen
    await page.getByRole('button', { name: 'Get Started' }).click();

    // Step 2: Enter mobile number
    await page.getByLabel('Mobile Number').fill('9876543210');
    await page.getByRole('button', { name: 'Send OTP' }).click();

    // Step 3: Enter OTP (use test OTP in dev)
    await page.getByLabel('OTP').fill('123456');
    await page.getByRole('button', { name: 'Verify' }).click();

    // Step 4: Create profile
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Date of Birth').fill('1995-01-01');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 5: Set PIN
    await page.getByLabel('Create PIN').fill('5678');
    await page.getByLabel('Confirm PIN').fill('5678');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Verify success
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
  });

  test('User can login with PIN', async ({ page }) => {
    await page.goto('http://localhost:19006/login');

    await page.getByLabel('Mobile Number').fill('9876543210');
    await page.getByLabel('PIN').fill('5678');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('User can enable biometric authentication', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:19006/login');
    await page.getByLabel('Mobile Number').fill('9876543210');
    await page.getByLabel('PIN').fill('5678');
    await page.getByRole('button', { name: 'Login' }).click();

    // Navigate to settings
    await page.getByRole('button', { name: 'Profile' }).click();
    await page.getByRole('button', { name: 'Settings' }).click();

    // Enable biometric
    await page.getByRole('switch', { name: 'Biometric Login' }).click();

    await expect(page.getByText('Biometric enabled')).toBeVisible();
  });
});

// playwright/tests/mobile/payment-flow.spec.ts
test.describe('Mobile App - UPI Payment Flow', () => {
  test('User can make UPI payment with auto-save', async ({ page, context }) => {
    // Login
    await page.goto('http://localhost:19006/login');
    await page.getByLabel('Mobile Number').fill('9876543210');
    await page.getByLabel('PIN').fill('5678');
    await page.getByRole('button', { name: 'Login' }).click();

    // Navigate to payments
    await page.getByRole('button', { name: 'Pay' }).click();

    // Scan QR or enter UPI ID
    await page.getByLabel('UPI ID').fill('merchant@upi');
    await page.getByLabel('Amount').fill('1000');

    // Verify auto-save preview (10% of 1000 = 100)
    await expect(page.getByText('Auto-save: ₹100')).toBeVisible();

    // Complete payment
    await page.getByRole('button', { name: 'Pay ₹1000' }).click();

    // Enter UPI PIN (mocked in test)
    await page.getByLabel('UPI PIN').fill('123456');
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify success
    await expect(page.getByText('Payment Successful')).toBeVisible();
    await expect(page.getByText('₹100 saved')).toBeVisible();
  });

  test('User can adjust auto-save percentage', async ({ page }) => {
    // Login and navigate to savings settings
    await page.goto('http://localhost:19006/savings/settings');

    // Adjust slider
    await page.getByLabel('Auto-save percentage').fill('20');

    // Save
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Settings updated')).toBeVisible();
  });
});

// playwright/tests/mobile/investment-flow.spec.ts
test.describe('Mobile App - Investment Flow', () => {
  test('User can invest in mutual fund', async ({ page }) => {
    // Login and navigate to investments
    await page.goto('http://localhost:19006/investments');

    // Browse mutual funds
    await page.getByRole('button', { name: 'Mutual Funds' }).click();

    // Select a fund
    await page.getByText('Axis Bluechip Fund').click();

    // View details and invest
    await page.getByRole('button', { name: 'Invest Now' }).click();

    // Enter amount
    await page.getByLabel('Amount').fill('5000');

    // Confirm
    await page.getByRole('button', { name: 'Confirm Investment' }).click();

    // Verify success
    await expect(page.getByText('Investment successful')).toBeVisible();
  });

  test('User can invest in digital gold', async ({ page }) => {
    await page.goto('http://localhost:19006/investments');

    await page.getByRole('button', { name: 'Digital Gold' }).click();
    await page.getByLabel('Grams').fill('2');
    await page.getByRole('button', { name: 'Buy Gold' }).click();

    await expect(page.getByText('Gold purchased')).toBeVisible();
  });
});

// playwright/tests/mobile/goal-tracking.spec.ts
test.describe('Mobile App - Goal Tracking', () => {
  test('User can create savings goal', async ({ page }) => {
    await page.goto('http://localhost:19006/goals');

    await page.getByRole('button', { name: 'Create Goal' }).click();

    // Fill goal details
    await page.getByLabel('Goal Name').fill('Vacation to Goa');
    await page.getByLabel('Target Amount').fill('50000');
    await page.getByLabel('Target Date').fill('2025-12-31');

    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Vacation to Goa')).toBeVisible();
    await expect(page.getByText('₹0 / ₹50,000')).toBeVisible();
  });

  test('User can allocate savings to goal', async ({ page }) => {
    await page.goto('http://localhost:19006/goals');

    await page.getByText('Vacation to Goa').click();
    await page.getByRole('button', { name: 'Add Money' }).click();

    await page.getByLabel('Amount').fill('5000');
    await page.getByRole('button', { name: 'Allocate' }).click();

    await expect(page.getByText('₹5,000 / ₹50,000')).toBeVisible();
  });
});
```

### Admin Dashboard Tests (Future)

Create test files in `playwright/tests/admin/`:

```typescript
// playwright/tests/admin/user-management.spec.ts
test.describe('Admin Dashboard - User Management', () => {
  test('Admin can view user list', async ({ page }) => {
    await page.goto('http://localhost:3001/admin');

    // Login as admin
    await page.getByLabel('Email').fill('admin@saveinvest.app');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Navigate to users
    await page.getByRole('link', { name: 'Users' }).click();

    // Verify user table
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Mobile' })).toBeVisible();
  });

  test('Admin can search users', async ({ page }) => {
    await page.goto('http://localhost:3001/admin/users');

    await page.getByLabel('Search').fill('9876543210');

    await expect(page.getByText('9876543210')).toBeVisible();
  });
});

// playwright/tests/admin/analytics.spec.ts
test.describe('Admin Dashboard - Analytics', () => {
  test('Admin can view analytics dashboard', async ({ page }) => {
    await page.goto('http://localhost:3001/admin/analytics');

    // Check key metrics
    await expect(page.getByText('Total Users')).toBeVisible();
    await expect(page.getByText('Total Savings')).toBeVisible();
    await expect(page.getByText('Total Investments')).toBeVisible();

    // Check charts
    await expect(page.locator('canvas').first()).toBeVisible();
  });
});
```

## Visual Regression Testing

When UI is built, add visual snapshot tests:

```typescript
test('Homepage should match snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});

test('Login screen should match snapshot', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveScreenshot('login.png');
});
```

## Cross-Browser Testing

Playwright runs tests across:
- ✅ Chromium (Chrome, Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome
- ✅ Mobile Safari

## Best Practices

### 1. Use User-Facing Selectors

```typescript
// ✅ Good - Uses user-facing text
await page.getByRole('button', { name: 'Login' }).click();
await page.getByLabel('Email').fill('test@example.com');
await page.getByText('Welcome').isVisible();

// ❌ Bad - Fragile CSS selectors
await page.locator('.btn-primary').click();
await page.locator('#email-input').fill('test@example.com');
```

### 2. Wait for Elements

```typescript
// ✅ Good - Playwright auto-waits
await page.getByRole('button', { name: 'Submit' }).click();

// ❌ Bad - Manual waits (only when necessary)
await page.waitForTimeout(3000);
```

### 3. Organize Tests by Feature

```
playwright/tests/
├── mobile/
│   ├── auth-flow.spec.ts
│   ├── payment-flow.spec.ts
│   ├── investment-flow.spec.ts
│   └── goal-tracking.spec.ts
├── admin/
│   ├── user-management.spec.ts
│   ├── analytics.spec.ts
│   └── settings.spec.ts
└── swagger-ui.spec.ts
```

### 4. Use Fixtures for Auth

```typescript
// playwright/fixtures/auth.ts
export async function loginAsUser(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Mobile').fill('9876543210');
  await page.getByLabel('PIN').fill('5678');
  await page.getByRole('button', { name: 'Login' }).click();
}

// In tests
test('Dashboard shows user data', async ({ page }) => {
  await loginAsUser(page);
  await expect(page.getByText('Dashboard')).toBeVisible();
});
```

### 5. Test Error States

```typescript
test('Shows error for invalid login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Mobile').fill('0000000000');
  await page.getByLabel('PIN').fill('0000');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
});
```

## CI/CD Integration

Add to GitHub Actions:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm run test:playwright
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging

```bash
# Run with browser visible
npx playwright test --headed

# Run in debug mode with Playwright Inspector
npx playwright test --debug

# Generate test code (codegen)
npx playwright codegen http://localhost:19006

# Show test report
npx playwright show-report
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Test Examples](https://playwright.dev/docs/writing-tests)

## Next Steps

1. ✅ **NOW**: Playwright is set up and testing Swagger UI
2. 🔜 **NEXT**: Build React Native mobile app
3. 🔜 **THEN**: Add comprehensive E2E tests using examples above
4. 🔜 **FUTURE**: Add visual regression testing
5. 🔜 **FUTURE**: Add performance testing with Playwright

---

**Ready to add UI tests?** Copy the examples above when your frontend is built!
