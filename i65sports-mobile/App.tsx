import React, { useState, useEffect } from 'react';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from './src/utils/tokenCache';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { registerForPushNotificationsAsync } from './src/utils/notifications';
import * as Notifications from 'expo-notifications';

const publishableKey = 'pk_test_d2VsY29tZS1wbGF0eXB1cy03My5jbGVyay5hY2NvdW50cy5kZXYk';

if (!publishableKey) {
  throw new Error('Missing Clerk publishable key');
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        console.log('📱 Expo Push Token:', token);
      }
    });

    // Listen for notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AppNavigator />
        <Toast />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
