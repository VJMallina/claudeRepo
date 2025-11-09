/**
 * API Helper Functions for E2E Tests
 *
 * These utilities help with testing API endpoints directly
 */

export const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

/**
 * Test helper to directly call API endpoints
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

/**
 * Register a new user and get OTP
 */
export async function registerUser(mobile: string) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ mobile }),
  });
}

/**
 * Verify OTP and get auth tokens
 */
export async function verifyOtp(mobile: string, code: string) {
  return apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ mobile, code }),
  });
}

/**
 * Clean up test data - delete user by mobile number
 * Note: This requires admin access or a test-only endpoint
 */
export async function cleanupTestUser(mobile: string, accessToken?: string) {
  // Only run in test environment
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
    throw new Error('Cleanup can only run in test/development environment');
  }

  // This would require a test-only cleanup endpoint on the API
  // For now, we'll use unique mobile numbers per test
  console.log(`Test cleanup for mobile: ${mobile}`);
}

/**
 * Generate a unique test mobile number
 */
export function generateTestMobile(): string {
  const timestamp = Date.now().toString().slice(-8);
  return `98${timestamp}`;
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for condition');
}

/**
 * Create a complete user with profile and PIN for testing login flows
 * Returns access and refresh tokens
 */
export async function createCompleteUser(mobile: string) {
  const baseUrl = API_BASE_URL;

  // Step 1: Register
  await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile }),
  });

  // Step 2: Verify OTP to get temp token
  const verifyResponse = await fetch(`${baseUrl}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, code: '222222' }),
  });

  const { tempToken } = await verifyResponse.json();

  // Step 3: Create profile
  await fetch(`${baseUrl}/auth/create-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tempToken}`,
    },
    body: JSON.stringify({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      dateOfBirth: '1990-01-01',
    }),
  });

  // Step 4: Set PIN to complete registration and get auth tokens
  const setPinResponse = await fetch(`${baseUrl}/auth/set-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tempToken}`,
    },
    body: JSON.stringify({
      pin: '1357',
    }),
  });

  return await setPinResponse.json(); // Returns { accessToken, refreshToken, user }
}
