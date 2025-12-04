import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.86.226:3000/api';

export default function CreateCollectionScreen() {
  const navigation = useNavigation();
  const { getToken } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Collection name required',
        position: 'bottom',
      });
      return;
    }

    try {
      setIsCreating(true);
      const token = await getToken();

      const response = await axios.post(
        `${API_URL}/collections`,
        {
          name: name.trim(),
          description: description.trim() || undefined,
          isPublic,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Collection Created! 📁',
        position: 'bottom',
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating collection:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to create collection',
        position: 'bottom',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Collection</Text>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#00FF9F" />
            ) : (
              <Text
                style={[
                  styles.createText,
                  !name.trim() && styles.createTextDisabled,
                ]}
              >
                Create
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Icon Preview */}
          <View style={styles.iconPreview}>
            <Ionicons name="folder" size={48} color="#00FF9F" />
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Best Dunks, Controversial Calls..."
              placeholderTextColor="#8892A6"
              value={name}
              onChangeText={setName}
              maxLength={50}
              autoFocus
            />
            <Text style={styles.characterCount}>{name.length}/50</Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add a description..."
              placeholderTextColor="#8892A6"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
            />
            <Text style={styles.characterCount}>{description.length}/200</Text>
          </View>

          {/* Public Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons
                  name={isPublic ? 'globe-outline' : 'lock-closed-outline'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.settingLabel}>
                  {isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
              <Text style={styles.settingDescription}>
                {isPublic
                  ? 'Anyone can view and follow this collection'
                  : 'Only you can view this collection'}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#3A4166', true: '#00FF9F' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  cancelText: {
    fontSize: 16,
    color: '#8892A6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF9F',
  },
  createTextDisabled: {
    color: '#8892A6',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  iconPreview: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#8892A6',
    textAlign: 'right',
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingDescription: {
    fontSize: 13,
    color: '#8892A6',
    lineHeight: 18,
  },
});

