import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileSettingsScreen from '../ProfileSettingsScreen';
import { useAuthStore } from '../../../store/authStore';
import authService from '../../../services/auth.service';

jest.mock('../../../store/authStore');
jest.mock('../../../services/auth.service');

const mockUser = {
  id: '1',
  mobile: '9876543210',
  name: 'John Doe',
  email: 'john@example.com',
  kycLevel: 2 as const,
  kycStatus: 'VERIFIED' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockUpdateUser = jest.fn();

describe('ProfileSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
    });
  });

  it('renders correctly with user data', () => {
    const { getByText, getByDisplayValue } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText('9876543210')).toBeTruthy();
    expect(getByText('KYC Level 2')).toBeTruthy();
    expect(getByDisplayValue('John Doe')).toBeTruthy();
    expect(getByDisplayValue('john@example.com')).toBeTruthy();
  });

  it('displays user initials in avatar', () => {
    const { getByText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText('JD')).toBeTruthy(); // John Doe -> JD
  });

  it('validates name length', async () => {
    const { getByLabelText, getByText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    const nameInput = getByLabelText('Full Name');
    fireEvent.changeText(nameInput, 'A');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Name must be at least 2 characters')).toBeTruthy();
    });
  });

  it('validates email format', async () => {
    const { getByLabelText, getByText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    const emailInput = getByLabelText('Email Address');
    fireEvent.changeText(emailInput, 'invalidemail');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('successfully updates profile', async () => {
    const updatedUser = { ...mockUser, name: 'Jane Doe' };
    (authService.updateProfile as jest.Mock).mockResolvedValue(updatedUser);

    const { getByLabelText, getByText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    const nameInput = getByLabelText('Full Name');
    fireEvent.changeText(nameInput, 'Jane Doe');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith({
        name: 'Jane Doe',
      });
      expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
      expect(getByText('Profile updated successfully!')).toBeTruthy();
    });
  });

  it('handles update profile API error', async () => {
    (authService.updateProfile as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Update failed' } },
    });

    const { getByLabelText, getByText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    const nameInput = getByLabelText('Full Name');
    fireEvent.changeText(nameInput, 'Jane Doe');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Update failed')).toBeTruthy();
    });
  });

  it('shows save button as disabled while submitting', async () => {
    (authService.updateProfile as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByLabelText, getByText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    const nameInput = getByLabelText('Full Name');
    fireEvent.changeText(nameInput, 'Jane Doe');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(saveButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('allows updating address fields', async () => {
    const updatedUser = { ...mockUser };
    (authService.updateProfile as jest.Mock).mockResolvedValue(updatedUser);

    const { getByLabelText, getByText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    const addressInput = getByLabelText('Address');
    const cityInput = getByLabelText('City');
    const stateInput = getByLabelText('State');
    const pincodeInput = getByLabelText('Pincode');

    fireEvent.changeText(addressInput, '123 Main St');
    fireEvent.changeText(cityInput, 'Mumbai');
    fireEvent.changeText(stateInput, 'Maharashtra');
    fireEvent.changeText(pincodeInput, '400001');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith({
        address: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      });
    });
  });

  it('displays Basic Information section', () => {
    const { getByText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText('Basic Information')).toBeTruthy();
  });

  it('displays Address section', () => {
    const { getByText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    expect(getByText('Address')).toBeTruthy();
  });

  it('limits pincode to 6 digits', () => {
    const { getByLabelText } = render(
      <ProfileSettingsScreen navigation={{} as any} route={{} as any} />
    );

    const pincodeInput = getByLabelText('Pincode');
    expect(pincodeInput.props.maxLength).toBe(6);
  });
});
