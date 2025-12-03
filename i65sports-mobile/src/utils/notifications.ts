import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function setupNotifications() {
  if (!Device.isDevice) {
    console.log('⚠️  Must use physical device for notifications');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions denied');
      return false;
    }

    // Skip Expo push token registration for now
    // This requires proper EAS project setup which we can configure later
    console.log('✅ Local notifications ready (push tokens disabled for now)');

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00FF9F',
      });
    }

    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
}
