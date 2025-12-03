import React, { useEffect } from 'react';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from './src/utils/tokenCache';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { setupNotifications } from './src/utils/notifications';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import socketService from './src/services/socket';

const publishableKey = 'pk_test_d2VsY29tZS1wbGF0eXB1cy03My5jbGVyay5hY2NvdW50cy5kZXYk';

if (!publishableKey) {
  throw new Error('Missing Clerk publishable key');
}

export default function App() {
  useEffect(() => {
    // Connect to WebSocket
    socketService.connect();

    // Setup notifications
    setupNotifications().then(enabled => {
      if (enabled) {
        console.log('✅ Notifications ready!');
      } else {
        console.log('⚠️ Notifications not available');
      }
    }).catch(error => {
      console.log('⚠️ Notification setup failed:', error);
    });

    // Notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
    });

    return () => {
      // Disconnect WebSocket
      socketService.disconnect();
      
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <ClerkLoaded>
            <AppNavigator />
            <Toast />
          </ClerkLoaded>
        </ClerkProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
