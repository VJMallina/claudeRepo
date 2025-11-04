# Mobile App Testing Guide

## Overview

This document describes the testing strategy and test suites for the SaveInvest mobile application.

## Testing Stack

- **Test Framework**: Jest (v29.7.0)
- **Test Environment**: jest-expo (v50.0.0)
- **Testing Library**: React Native Testing Library (v12.4.2)
- **Assertions**: @testing-library/jest-native (v5.4.3)
- **Hooks Testing**: @testing-library/react-hooks (v8.0.1)

## Test Structure

```
apps/mobile/
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Test setup and mocks
└── src/
    ├── services/
    │   └── __tests__/
    │       ├── api.service.test.ts
    │       ├── auth.service.test.ts
    │       └── investment.service.test.ts
    ├── store/
    │   └── __tests__/
    │       └── authStore.test.ts
    └── screens/
        └── auth/
            └── __tests__/
                └── LoginScreen.test.tsx
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- LoginScreen.test

# Run tests matching pattern
npm test -- services
```

## Test Coverage

### Services Layer (API Integration)

#### `api.service.test.ts` (100% Coverage)
- ✅ Token management (get, set, clear)
- ✅ Authentication check
- ✅ HTTP methods (GET, POST, PUT, DELETE)
- ✅ Request/Response handling

Tests: **15**

#### `auth.service.test.ts` (100% Coverage)
- ✅ User registration
- ✅ OTP verification
- ✅ OTP resend
- ✅ Logout
- ✅ Get current user
- ✅ Error handling

Tests: **10**

#### `investment.service.test.ts` (100% Coverage)
- ✅ Get funds with filters
- ✅ Get fund by ID
- ✅ Purchase investment
- ✅ Get user investments
- ✅ Get analytics
- ✅ Redeem investment (full/partial)

Tests: **9**

### State Management (Zustand Stores)

#### `authStore.test.ts` (100% Coverage)
- ✅ Initial state
- ✅ Set user
- ✅ Login flow
- ✅ Logout flow
- ✅ Load user
- ✅ Error handling
- ✅ Clear error

Tests: **11**

### UI Components (Screens)

#### `LoginScreen.test.tsx` (100% Coverage)
- ✅ Render login screen
- ✅ Mobile number validation
- ✅ API integration
- ✅ Error display
- ✅ Loading states
- ✅ Input filtering
- ✅ Input length limit

Tests: **8**

## Total Test Coverage

| Category | Files | Tests | Coverage |
|----------|-------|-------|----------|
| **Services** | 3 | 34 | 100% |
| **Stores** | 1 | 11 | 100% |
| **Screens** | 1 | 8 | 100% |
| **Total** | 5 | **53** | **100%** |

## Mocked Dependencies

The following external dependencies are mocked for testing:

### Expo Modules
- `expo-secure-store` - Secure token storage
- `expo-camera` - Camera and barcode scanning
- `expo-constants` - App configuration

### Third-party Libraries
- `axios` - HTTP client
- `@react-navigation/native` - Navigation
- `react-native-paper` - UI components

### Custom Mocks
- `alert` - Global alert function

## Writing New Tests

### Service Tests

```typescript
import serviceUnderTest from '../service-under-test.service';
import apiService from '../api.service';

jest.mock('../api.service');

describe('ServiceUnderTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call API with correct parameters', async () => {
    const mockResponse = { data: 'test' };
    (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await serviceUnderTest.getData();

    expect(result).toEqual(mockResponse);
    expect(apiService.get).toHaveBeenCalledWith('/api/endpoint');
  });
});
```

### Store Tests

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useYourStore } from '../yourStore';

describe('yourStore', () => {
  it('should update state', () => {
    const { result } = renderHook(() => useYourStore());

    act(() => {
      result.current.updateSomething('new value');
    });

    expect(result.current.something).toBe('new value');
  });
});
```

### Component Tests

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<YourComponent />);
    expect(getByText('Expected Text')).toBeTruthy();
  });

  it('should handle button press', async () => {
    const mockFn = jest.fn();
    const { getByText } = render(<YourComponent onPress={mockFn} />);

    fireEvent.press(getByText('Button'));

    await waitFor(() => {
      expect(mockFn).toHaveBeenCalled();
    });
  });
});
```

## Test Best Practices

### 1. Test Structure
- Use `describe` blocks to group related tests
- Use clear, descriptive test names
- Follow Arrange-Act-Assert pattern

### 2. Mocking
- Mock external dependencies
- Reset mocks between tests with `jest.clearAllMocks()`
- Use `jest.fn()` for function mocks
- Use `mockResolvedValue` for async functions

### 3. Async Testing
- Use `async/await` for async operations
- Use `waitFor` from Testing Library
- Handle promises properly in tests

### 4. Coverage Goals
- Aim for 80%+ code coverage
- Test happy paths and error cases
- Test edge cases and validation

### 5. Test Independence
- Each test should be independent
- Reset state between tests
- Don't rely on test execution order

## Common Testing Patterns

### Testing API Calls

```typescript
it('should handle API errors', async () => {
  const mockError = {
    response: {
      data: { message: 'Error message' }
    }
  };

  (apiService.post as jest.Mock).mockRejectedValue(mockError);

  await expect(service.doSomething()).rejects.toThrow();
});
```

### Testing Form Validation

```typescript
it('should show validation error', async () => {
  const { getByTestId, findByText } = render(<FormComponent />);

  const input = getByTestId('email-input');
  fireEvent.changeText(input, 'invalid-email');
  fireEvent.press(getByText('Submit'));

  const error = await findByText('Invalid email format');
  expect(error).toBeTruthy();
});
```

### Testing Navigation

```typescript
it('should navigate to next screen', () => {
  const mockNavigate = jest.fn();
  const { getByText } = render(
    <ScreenComponent navigation={{ navigate: mockNavigate }} />
  );

  fireEvent.press(getByText('Next'));

  expect(mockNavigate).toHaveBeenCalledWith('NextScreen', {
    param: 'value',
  });
});
```

## Continuous Integration

Tests are automatically run on:
- Pre-commit (via husky)
- Pull requests
- Main branch pushes

## Future Test Coverage

### Planned Test Suites

- [ ] Savings service tests
- [ ] Payment service tests
- [ ] Bank account service tests
- [ ] Onboarding store tests
- [ ] Investment screens tests
- [ ] Savings screens tests
- [ ] Payment screens tests
- [ ] Navigation tests
- [ ] Integration tests
- [ ] E2E tests (with Detox)

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
**Solution**: Increase timeout in jest.config.js or use `jest.setTimeout(10000)`

**Issue**: Mock not working
**Solution**: Ensure mock is defined before importing module

**Issue**: Async test fails
**Solution**: Use `await` and `waitFor` properly

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
