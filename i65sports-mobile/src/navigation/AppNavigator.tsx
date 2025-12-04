import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import HotTakeDetailScreen from '../screens/HotTakeDetailScreen';
import OddsDetailScreen from '../screens/OddsDetailScreen';
import VideoEditorScreen from '../screens/VideoEditorScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import LiveGameScreen from '../screens/LiveGameScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import NewMessageScreen from '../screens/NewMessageScreen';
import SelectRecipientsScreen from '../screens/SelectRecipientsScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import CreateCollectionScreen from '../screens/CreateCollectionScreen';
import UploadHotTakeScreen from '../screens/UploadHotTakeScreen';
import DraftsScreen from '../screens/DraftsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00FF9F',
        tabBarInactiveTintColor: '#8892A6',
        tabBarStyle: {
          backgroundColor: '#1A1F3A',
          borderTopColor: '#3A4166',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#0A0E27',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'i65Sports',
          headerTitleAlign: 'center',
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isSignedIn, isLoaded } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setHasSeenOnboarding(false);
    }
  };

  // Wait for auth and onboarding check to load
  if (!isLoaded || hasSeenOnboarding === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isSignedIn ? (
          // Authenticated routes
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="HotTakeDetail" 
              component={HotTakeDetailScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#0A0E27' },
                headerTintColor: '#FFFFFF',
                headerTitle: 'Hot Take',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="OddsDetail" 
              component={OddsDetailScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#0A0E27' },
                headerTintColor: '#FFFFFF',
                headerTitle: 'Game Odds',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#0A0E27' },
                headerTintColor: '#FFFFFF',
                headerTitle: 'Settings',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="VideoEditor" 
              component={VideoEditorScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="LiveGame"
              component={LiveGameScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Messages"
              component={MessagesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NewMessage"
              component={NewMessageScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="SelectRecipients"
              component={SelectRecipientsScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Collections"
              component={CollectionsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CollectionDetail"
              component={CollectionDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateCollection"
              component={CreateCollectionScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="UploadHotTake"
              component={UploadHotTakeScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="Drafts"
              component={DraftsScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Unauthenticated routes
          <>
            {!hasSeenOnboarding && (
              <Stack.Screen 
                name="Onboarding" 
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
            )}
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
