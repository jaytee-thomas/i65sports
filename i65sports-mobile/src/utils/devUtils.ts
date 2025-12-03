/**
 * Development utilities for testing and debugging
 * These should NOT be used in production builds
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Reset onboarding status - useful for testing onboarding flow
 * 
 * Usage:
 * import { resetOnboarding } from '../utils/devUtils';
 * await resetOnboarding();
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    console.log('✅ Onboarding status reset - you will see onboarding on next app launch');
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    throw error;
  }
}

/**
 * Clear all AsyncStorage data - useful for complete app reset during development
 * 
 * WARNING: This will clear ALL stored data including auth tokens, preferences, etc.
 */
export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
    console.log('✅ All AsyncStorage data cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

/**
 * Get onboarding status - useful for debugging
 */
export async function getOnboardingStatus(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem('hasSeenOnboarding');
    return value === 'true';
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
}

