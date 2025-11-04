import apiService from './api.service';
import { OnboardingStatus } from '@/types/api.types';

class OnboardingService {
  /**
   * Get onboarding status and progress
   */
  async getStatus(): Promise<OnboardingStatus> {
    return apiService.get<OnboardingStatus>('/onboarding/status');
  }

  /**
   * Update onboarding step completion
   */
  async updateStep(step: string): Promise<OnboardingStatus> {
    return apiService.post<OnboardingStatus>('/onboarding/update-step', { step });
  }
}

export default new OnboardingService();
