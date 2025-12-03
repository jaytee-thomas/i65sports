# Development Reset Utilities

## Quick Reset Onboarding

To reset the onboarding flow during development, you can use the utility function:

```typescript
import { resetOnboarding } from '../utils/devUtils';

// In a button handler or useEffect:
await resetOnboarding();
```

## Example: Add to Settings Screen (Temporary)

You can temporarily add a reset button to your Settings screen for easy testing:

```typescript
import { resetOnboarding } from '../utils/devUtils';
import { Alert } from 'react-native';

// In SettingsScreen.tsx, add a button:
<TouchableOpacity
  onPress={async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset the onboarding flow. Restart the app to see it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            Alert.alert('Success', 'Onboarding reset. Restart the app.');
          },
        },
      ]
    );
  }}
>
  <Text>Reset Onboarding (Dev Only)</Text>
</TouchableOpacity>
```

## Direct AsyncStorage Method

If you prefer to use AsyncStorage directly:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// In a button or useEffect:
await AsyncStorage.removeItem('hasSeenOnboarding');
```

## Other Utilities

The `devUtils.ts` file also includes:

- `clearAllStorage()` - Clears all AsyncStorage data
- `getOnboardingStatus()` - Checks current onboarding status

## Important Notes

⚠️ **These utilities are for development only!**

- Remove any reset buttons before production builds
- Never expose these functions to end users
- Consider using environment variables to disable in production

## Testing Flow

1. Add reset function to a screen (e.g., Settings)
2. Tap the reset button
3. Close and restart the app
4. You should see the onboarding screen again

