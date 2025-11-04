import { create } from 'zustand';
import { OnboardingStatus } from '@/types/api.types';
import onboardingService from '@/services/onboarding.service';

interface OnboardingState extends OnboardingStatus {
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStatus: () => Promise<void>;
  updateStep: (step: string) => Promise<void>;
  reset: () => void;
}

const initialState: OnboardingStatus = {
  currentStep: 'REGISTRATION',
  kycLevel: 0,
  kycStatus: 'PENDING',
  completionStatus: {
    profileComplete: false,
    panVerified: false,
    aadhaarVerified: false,
    livenessVerified: false,
    bankAccountAdded: false,
  },
  permissions: {
    canMakePayments: false,
    maxPaymentAmount: null,
    canInvest: false,
    canWithdraw: false,
  },
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    try {
      set({ isLoading: true, error: null });

      const status = await onboardingService.getStatus();

      set({
        ...status,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch onboarding status';

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  updateStep: async (step: string) => {
    try {
      set({ isLoading: true, error: null });

      const status = await onboardingService.updateStep(step);

      set({
        ...status,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update onboarding step';

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  reset: () => set({ ...initialState, isLoading: false, error: null }),
}));
