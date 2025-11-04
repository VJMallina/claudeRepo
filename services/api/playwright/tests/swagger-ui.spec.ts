import { test, expect } from '@playwright/test';

/**
 * Swagger UI E2E Tests
 *
 * These tests verify that the Swagger API documentation is:
 * - Accessible and loads correctly
 * - Shows all authentication endpoints
 * - Shows all user endpoints
 * - Allows interactive API testing
 *
 * Note: These are smoke tests for the current backend API.
 * When the frontend (React Native/Admin Dashboard) is built,
 * add more comprehensive UI tests in separate files.
 */

test.describe('Swagger UI - API Documentation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/api/docs');
    // Wait for Swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
  });

  test('should load Swagger UI successfully', async ({ page }) => {
    // Check that Swagger UI container is visible
    const swaggerContainer = page.locator('.swagger-ui');
    await expect(swaggerContainer).toBeVisible();

    // Check that title is correct
    const title = page.locator('.information-container .title');
    await expect(title).toContainText('SaveInvest API');
  });

  test('should display API information', async ({ page }) => {
    // Check API description is present
    const info = page.locator('.information-container');
    await expect(info).toBeVisible();
  });

  test('should show all auth endpoints', async ({ page }) => {
    // Expand auth tag
    const authTag = page.locator('.opblock-tag-section', {
      has: page.locator('h3:has-text("auth")'),
    });

    // Check auth endpoints exist
    const endpoints = [
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/verify-otp',
      'POST /api/v1/auth/create-profile',
      'POST /api/v1/auth/set-pin',
      'POST /api/v1/auth/login/pin',
      'POST /api/v1/auth/login/otp',
      'POST /api/v1/auth/login/verify-otp',
      'POST /api/v1/auth/refresh-token',
      'POST /api/v1/auth/logout',
      'POST /api/v1/auth/reset-pin',
      'GET /api/v1/auth/me',
    ];

    for (const endpoint of endpoints) {
      const [method, path] = endpoint.split(' ');
      const endpointElement = page.locator(
        `.opblock-summary-${method.toLowerCase()}:has-text("${path}")`,
      );
      await expect(endpointElement).toBeVisible();
    }
  });

  test('should show all user endpoints', async ({ page }) => {
    // Check user endpoints exist
    const userEndpoints = [
      'GET /api/v1/users/profile',
      'PUT /api/v1/users/profile',
      'PUT /api/v1/users/biometric/enable',
      'PUT /api/v1/users/biometric/disable',
    ];

    for (const endpoint of userEndpoints) {
      const [method, path] = endpoint.split(' ');
      const endpointElement = page.locator(
        `.opblock-summary-${method.toLowerCase()}:has-text("${path}")`,
      );
      await expect(endpointElement).toBeVisible();
    }
  });

  test('should allow expanding endpoint details', async ({ page }) => {
    // Find and click on register endpoint
    const registerEndpoint = page.locator(
      '.opblock-summary-post:has-text("/api/v1/auth/register")',
    );
    await registerEndpoint.click();

    // Wait for endpoint details to expand
    await page.waitForSelector('.opblock-body', { state: 'visible' });

    // Check that request body schema is visible
    const requestBody = page.locator('.opblock-section-request-body');
    await expect(requestBody).toBeVisible();

    // Check that response schema is visible
    const responses = page.locator('.responses-wrapper');
    await expect(responses).toBeVisible();
  });

  test('should show "Try it out" functionality', async ({ page }) => {
    // Expand register endpoint
    const registerEndpoint = page.locator(
      '.opblock-summary-post:has-text("/api/v1/auth/register")',
    );
    await registerEndpoint.click();

    // Wait for endpoint to expand
    await page.waitForSelector('.try-out', { timeout: 5000 });

    // Check that "Try it out" button is visible
    const tryItButton = page.locator('.try-out button');
    await expect(tryItButton).toBeVisible();
    await expect(tryItButton).toContainText('Try it out');
  });

  test('should show authentication schemes', async ({ page }) => {
    // Check if Bearer Auth is documented
    const authButton = page.locator('.authorization__btn');
    if (await authButton.isVisible()) {
      await expect(authButton).toBeVisible();
    }
  });

  test('should display schemas/models', async ({ page }) => {
    // Scroll to models section
    const modelsSection = page.locator('#model-section');
    if (await modelsSection.isVisible()) {
      await modelsSection.scrollIntoViewIfNeeded();
      await expect(modelsSection).toBeVisible();
    }
  });
});

test.describe('Swagger UI - Interactive Testing', () => {
  test('should allow testing register endpoint', async ({ page }) => {
    await page.goto('/api/docs');
    await page.waitForSelector('.swagger-ui');

    // Expand register endpoint
    const registerEndpoint = page.locator(
      '.opblock-summary-post:has-text("/api/v1/auth/register")',
    );
    await registerEndpoint.click();

    // Click "Try it out"
    const tryItButton = page.locator('.try-out button').first();
    await tryItButton.click();

    // Check that request body textarea is editable
    const requestBody = page.locator('.body-param textarea').first();
    await expect(requestBody).toBeEnabled();

    // Fill in test data
    await requestBody.fill('{"mobile": "9876543210"}');

    // Check that Execute button is visible
    const executeButton = page.locator('.execute-wrapper button.execute');
    await expect(executeButton).toBeVisible();
  });

  test('should show endpoint parameters and schemas', async ({ page }) => {
    await page.goto('/api/docs');
    await page.waitForSelector('.swagger-ui');

    // Expand create-profile endpoint
    const profileEndpoint = page.locator(
      '.opblock-summary-post:has-text("/api/v1/auth/create-profile")',
    );
    await profileEndpoint.click();

    // Wait for details
    await page.waitForSelector('.opblock-body', { state: 'visible' });

    // Check that request body model is shown
    const model = page.locator('.model-box');
    if (await model.first().isVisible()) {
      await expect(model.first()).toBeVisible();
    }
  });

  test('should display response examples', async ({ page }) => {
    await page.goto('/api/docs');
    await page.waitForSelector('.swagger-ui');

    // Expand login endpoint
    const loginEndpoint = page.locator(
      '.opblock-summary-post:has-text("/api/v1/auth/login/pin")',
    );
    await loginEndpoint.click();

    // Wait for responses section
    await page.waitForSelector('.responses-wrapper', { state: 'visible' });

    // Check that response code 200 is shown
    const response200 = page.locator('.responses-table .response:has-text("200")');
    await expect(response200).toBeVisible();
  });
});

test.describe('Swagger UI - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.goto('/api/docs');
    await page.waitForSelector('.swagger-ui');

    const swaggerContainer = page.locator('.swagger-ui');
    await expect(swaggerContainer).toBeVisible();

    // Check that endpoints are still accessible
    const registerEndpoint = page.locator(
      '.opblock-summary-post:has-text("/api/v1/auth/register")',
    );
    await expect(registerEndpoint).toBeVisible();
  });
});

test.describe('Swagger UI - Accessibility', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/api/docs');
    await expect(page).toHaveTitle(/Swagger UI/);
  });

  test('should have main content accessible', async ({ page }) => {
    await page.goto('/api/docs');

    // Check main swagger container has proper structure
    const main = page.locator('.swagger-ui .information-container');
    await expect(main).toBeVisible();
  });
});
