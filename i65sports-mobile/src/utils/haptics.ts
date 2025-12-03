import * as Haptics from 'expo-haptics';

export const haptics = {
  // Light tap - for button presses, switches
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  // Medium impact - for successful actions
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  // Heavy impact - for important actions
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  // Success notification
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  // Warning notification
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  // Error notification
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  // Selection changed - for scrolling through options
  selection: () => {
    Haptics.selectionAsync();
  },
};

