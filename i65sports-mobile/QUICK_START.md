# Quick Start Guide

## Setup Commands (Run in `i65sports-mobile` directory)

### 1. Install Dependencies
```bash
cd /Users/jasonthomas/myRepo/i65sports/i65sports-mobile
npm install
```

This will install all new dependencies including:
- `@react-native-community/slider`
- `@react-native-async-storage/async-storage`
- `react-native-swiper`
- `sharp` (for asset generation)

### 2. Generate App Assets (Optional)
If you have `assets/i65-icon.jpg` ready:

```bash
npm run generate-assets
```

This generates:
- `icon.png`
- `adaptive-icon.png`
- `favicon.png`
- `splash.png`

### 3. Start the App
```bash
npm start
# or
npm run ios      # For iOS simulator
npm run android  # For Android emulator
```

## Testing Commands

### Test Onboarding Flow
1. Open the app
2. Go to Profile screen
3. Tap "TEST: Logout & Reset Onboarding" button
4. Kill the app completely (swipe up/close)
5. Reopen the app
6. You should see onboarding → then sign in

### Reset Onboarding Manually (Terminal)
```bash
# This is just for reference - the button in ProfileScreen is easier
# But if you want to reset via terminal:
cd i65sports-mobile
npx react-native run-ios  # or run-android
# Then use the button in ProfileScreen
```

## Important Notes

- All `npm` commands should be run in the `i65sports-mobile` directory
- The backend API runs separately (in the root directory)
- Make sure your backend is running on `http://192.168.86.226:3000` before testing

## Troubleshooting

**Port already in use:**
```bash
# Kill processes on common ports
lsof -ti:3000,8081,19000 | xargs kill -9
```

**Clear cache:**
```bash
npm start -- --reset-cache
```

**Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

