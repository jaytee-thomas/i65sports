import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const { user } = useUser();

  // Notification preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [likeNotifications, setLikeNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [followNotifications, setFollowNotifications] = useState(true);

  // Privacy preferences
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  // Content preferences
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [hdVideoQuality, setHdVideoQuality] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Toast.show({
                type: 'success',
                text1: 'Signed out successfully',
                position: 'bottom',
              });
            } catch (error) {
              console.error('Sign out error:', error);
              Toast.show({
                type: 'error',
                text1: 'Failed to sign out',
                position: 'bottom',
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your Hot Takes, comments, and data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion API
            Toast.show({
              type: 'info',
              text1: 'Account deletion coming soon',
              text2: 'Please contact support for now',
              position: 'bottom',
            });
          },
        },
      ]
    );
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Could not open link',
        position: 'bottom',
      });
    });
  };

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#00FF9F" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (
        onPress && <Ionicons name="chevron-forward" size={24} color="#8892A6" />
      )}
    </TouchableOpacity>
  );

  const renderToggleItem = (
    icon: string,
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#00FF9F" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3A4166', true: '#00FF9F' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#3A4166"
      />
    </View>
  );

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          {renderSectionHeader('Account')}
          {renderSettingItem(
            'person-outline',
            'Edit Profile',
            'Update your username, bio, and avatar',
            () => navigation.navigate('EditProfile' as never)
          )}
          {renderSettingItem(
            'stats-chart-outline',
            'Analytics',
            'View your performance metrics',
            () => navigation.navigate('Analytics' as never)
          )}
          {renderSettingItem(
            'mail-outline',
            'Email',
            user?.emailAddresses[0]?.emailAddress || 'Not set',
            undefined
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          {renderSectionHeader('Notifications')}
          {renderToggleItem(
            'notifications-outline',
            'Push Notifications',
            'Receive push notifications on your device',
            pushNotifications,
            setPushNotifications
          )}
          {renderToggleItem(
            'mail-outline',
            'Email Notifications',
            'Receive notifications via email',
            emailNotifications,
            setEmailNotifications
          )}
          {renderToggleItem(
            'heart-outline',
            'Like Notifications',
            'Get notified when someone likes your Hot Takes',
            likeNotifications,
            setLikeNotifications
          )}
          {renderToggleItem(
            'chatbubble-outline',
            'Comment Notifications',
            'Get notified when someone comments',
            commentNotifications,
            setCommentNotifications
          )}
          {renderToggleItem(
            'person-add-outline',
            'Follow Notifications',
            'Get notified when someone follows you',
            followNotifications,
            setFollowNotifications
          )}
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          {renderSectionHeader('Privacy')}
          {renderToggleItem(
            'eye-outline',
            'Profile Visibility',
            'Allow others to view your profile',
            profileVisibility,
            setProfileVisibility
          )}
          {renderToggleItem(
            'pulse-outline',
            'Show Activity',
            'Display your activity status',
            showActivity,
            setShowActivity
          )}
        </View>

        {/* Content Section */}
        <View style={styles.section}>
          {renderSectionHeader('Content')}
          {renderToggleItem(
            'play-outline',
            'Autoplay Videos',
            'Automatically play videos in feed',
            autoplayVideos,
            setAutoplayVideos
          )}
          {renderToggleItem(
            'videocam-outline',
            'HD Video Quality',
            'Use higher quality video (uses more data)',
            hdVideoQuality,
            setHdVideoQuality
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          {renderSectionHeader('Support')}
          {renderSettingItem(
            'help-circle-outline',
            'Help Center',
            'Get help and answers',
            () => openURL('https://help.i65sports.com')
          )}
          {renderSettingItem(
            'document-text-outline',
            'Terms of Service',
            'Read our terms and conditions',
            () => openURL('https://i65sports.com/terms')
          )}
          {renderSettingItem(
            'shield-checkmark-outline',
            'Privacy Policy',
            'How we protect your data',
            () => openURL('https://i65sports.com/privacy')
          )}
          {renderSettingItem(
            'mail-outline',
            'Contact Us',
            'Get in touch with our team',
            () => openURL('mailto:support@i65sports.com')
          )}
        </View>

        {/* Development Section - Remove before production */}
        {__DEV__ && (
          <View style={styles.section}>
            {renderSectionHeader('Development')}
            {renderSettingItem(
              'refresh-outline',
              'Reset Onboarding',
              'Reset onboarding flow for testing (Dev Only)',
              async () => {
                await AsyncStorage.removeItem('hasSeenOnboarding');
                Alert.alert(
                  'Onboarding Reset',
                  'Onboarding has been reset. Restart the app to see it again.',
                  [{ text: 'OK' }]
                );
              }
            )}
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.section}>
          {renderSectionHeader('Danger Zone')}
          {renderSettingItem(
            'log-out-outline',
            'Sign Out',
            'Sign out of your account',
            handleSignOut
          )}
          {renderSettingItem(
            'trash-outline',
            'Delete Account',
            'Permanently delete your account',
            handleDeleteAccount
          )}
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>i65Sports v{appVersion}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8892A6',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#8892A6',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#8892A6',
  },
});

