import React from 'react';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from './src/utils/tokenCache';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

const publishableKey = 'pk_test_d2VsY29tZS1wbGF0eXB1cy03My5jbGVyay5hY2NvdW50cy5kZXYk';

if (!publishableKey) {
  throw new Error('Missing Clerk publishable key');
}

export default function App() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AppNavigator />
        <Toast />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
