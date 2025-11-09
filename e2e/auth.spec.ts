import { test, expect } from '@playwright/test';
import { registerUser, verifyOtp, generateTestMobile, createCompleteUser, API_BASE_URL } from './helpers/api';

test.describe('Authentication Flow', () => {
  let testMobile: string;

  test.beforeEach(() => {
    // Generate unique mobile for each test
    testMobile = generateTestMobile();
    console.log(`Using test mobile: ${testMobile}`);
  });

  test('should register a new user and send OTP', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/register`, {
      data: { mobile: testMobile },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    console.log('Registration response:', data);

    // API should return success message
    expect(data).toHaveProperty('message');
    expect(data.message).toContain('OTP sent');
  });

  test('should verify OTP with code 222222 in development', async ({ request }) => {
    // Register and immediately verify OTP - test the registration flow
    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: { mobile: testMobile },
    });

    // If registration succeeded, user is new - verify OTP
    if (registerResponse.ok()) {
      const verifyResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
        data: {
          mobile: testMobile,
          code: '222222', // Development OTP
        },
      });

      expect(verifyResponse.ok()).toBeTruthy();

      const data = await verifyResponse.json();
      console.log('Verification response:', data);

      // Registration verify-otp returns tempToken, not full auth tokens
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('tempToken');
      expect(data.success).toBe(true);
    } else {
      // If user already exists, skip this test
      console.log('User already exists, skipping OTP verification test');
      expect(registerResponse.status()).toBe(409); // Conflict
    }
  });

  test('should reject invalid OTP', async ({ request }) => {
    // Register first
    await request.post(`${API_BASE_URL}/auth/register`, {
      data: { mobile: testMobile },
    });

    // Try with wrong OTP
    const verifyResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
      data: {
        mobile: testMobile,
        code: '111111', // Wrong OTP
      },
    });

    expect(verifyResponse.status()).toBe(401);

    const data = await verifyResponse.json();
    expect(data).toHaveProperty('message');
  });

  test('should reject OTP verification with wrong field name', async ({ request }) => {
    // Register first
    await request.post(`${API_BASE_URL}/auth/register`, {
      data: { mobile: testMobile },
    });

    // Try sending 'otp' instead of 'code' - should fail validation
    const verifyResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
      data: {
        mobile: testMobile,
        otp: '222222', // Wrong field name
      },
    });

    expect(verifyResponse.status()).toBe(400);

    const data = await verifyResponse.json();
    expect(data).toHaveProperty('message');
    // Should contain validation error about 'code' field
    expect(JSON.stringify(data.message)).toContain('code');
  });

  test('should get current user with valid token', async ({ request }) => {
    // Create complete user with profile and PIN
    const authData = await createCompleteUser(testMobile);

    expect(authData).toHaveProperty('accessToken');
    expect(authData).toHaveProperty('user');

    // Get current user
    const meResponse = await request.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authData.accessToken}`,
      },
    });

    expect(meResponse.ok()).toBeTruthy();

    const userData = await meResponse.json();
    expect(userData).toHaveProperty('mobile', testMobile);
    expect(userData).toHaveProperty('id');
  });

  test('should reject unauthorized access without token', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/auth/me`);

    expect(response.status()).toBe(401);
  });

  test('should refresh access token', async ({ request }) => {
    // Create complete user with profile and PIN
    const authData = await createCompleteUser(testMobile);

    expect(authData).toHaveProperty('refreshToken');

    // Refresh token
    const refreshResponse = await request.post(`${API_BASE_URL}/auth/refresh-token`, {
      data: { refreshToken: authData.refreshToken },
    });

    expect(refreshResponse.ok()).toBeTruthy();

    const data = await refreshResponse.json();
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
  });
});

test.describe('Authentication Field Validation', () => {
  test('should validate mobile number format', async ({ request }) => {
    // Test with invalid mobile (too short)
    const response = await request.post(`${API_BASE_URL}/auth/register`, {
      data: { mobile: '98765' }, // Too short
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('message');
  });

  test('should validate OTP code format', async ({ request }) => {
    const testMobile = generateTestMobile();

    await request.post(`${API_BASE_URL}/auth/register`, {
      data: { mobile: testMobile },
    });

    // Test with invalid code (too short)
    const verifyResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
      data: {
        mobile: testMobile,
        code: '12', // Too short
      },
    });

    expect(verifyResponse.status()).toBe(400);
  });

  test('should ensure code field is required', async ({ request }) => {
    const testMobile = generateTestMobile();

    await request.post(`${API_BASE_URL}/auth/register`, {
      data: { mobile: testMobile },
    });

    // Missing code field
    const verifyResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
      data: {
        mobile: testMobile,
        // code field missing
      },
    });

    expect(verifyResponse.status()).toBe(400);

    const data = await verifyResponse.json();
    expect(JSON.stringify(data)).toContain('code');
  });
});
