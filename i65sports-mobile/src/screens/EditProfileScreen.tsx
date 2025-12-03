import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.86.226:3000/api';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('🏀 Sports fanatic | 🎥 Hot Takes creator');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const validateUsername = (text: string) => {
    setUsername(text);
    setUsernameError('');

    if (text.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (text.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(text)) {
      setUsernameError('Username can only contain letters, numbers, and underscore');
      return;
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please grant photo library access to change your profile picture'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUrl(result.assets[0].uri);
        
        Toast.show({
          type: 'info',
          text1: 'Image selected',
          text2: 'Image upload coming soon!',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to pick image',
        position: 'bottom',
      });
    }
  };

  const handleSave = async () => {
    if (usernameError) {
      Toast.show({
        type: 'error',
        text1: 'Invalid username',
        text2: usernameError,
        position: 'bottom',
      });
      return;
    }

    if (!username.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Username required',
        position: 'bottom',
      });
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      // Get user's database ID
      const hotTakesResponse = await axios.get(`${API_URL}/hot-takes?limit=1`, {
        timeout: 10000,
      });

      const userHotTake = hotTakesResponse.data.hotTakes.find(
        (ht: any) => ht.author.email === user?.emailAddresses[0].emailAddress
      );

      if (!userHotTake) {
        Toast.show({
          type: 'error',
          text1: 'User not found',
          text2: 'Please try again',
          position: 'bottom',
        });
        return;
      }

      const userId = userHotTake.author.id;

      // Update profile
      await axios.patch(
        `${API_URL}/users/${userId}`,
        {
          username: username.trim(),
          bio: bio.trim(),
          avatarUrl: avatarUrl || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Profile updated! ✅',
        position: 'bottom',
        visibilityTime: 2000,
      });

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      
      Toast.show({
        type: 'error',
        text1: 'Update failed',
        text2: errorMessage,
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#00FF9F" />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#00FF9F" />
                </View>
              )}
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>@</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={validateUsername}
                placeholder="username"
                placeholderTextColor="#8892A6"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </View>
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : (
              <Text style={styles.helperText}>
                {username.length}/20 characters
              </Text>
            )}
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#8892A6"
              multiline
              maxLength={150}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>{bio.length}/150 characters</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>
                {user?.emailAddresses[0].emailAddress}
              </Text>
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FF9F',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#00FF9F',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A1F3A',
    borderWidth: 3,
    borderColor: '#00FF9F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00FF9F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0A0E27',
  },
  avatarHint: {
    fontSize: 14,
    color: '#B8C5D6',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
    paddingHorizontal: 16,
  },
  inputPrefix: {
    fontSize: 16,
    color: '#00FF9F',
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#FFFFFF',
  },
  bioInput: {
    height: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  readOnlyInput: {
    backgroundColor: '#141829',
  },
  readOnlyText: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#8892A6',
    lineHeight: 48,
  },
  helperText: {
    fontSize: 12,
    color: '#8892A6',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
});
