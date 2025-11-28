import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00FF9F',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Push notification permission denied');
      return null;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'i65sports-demo';
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId
      })).data;
      
      console.log('✅ Push token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  } else {
    console.log('⚠️ Must use physical device');
  }

  return token;
}
