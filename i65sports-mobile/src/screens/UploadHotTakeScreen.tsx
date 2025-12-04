import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { uploadHotTake } from '../services/upload';

const API_URL = 'http://192.168.86.226:3000/api';

type RouteParams = {
  UploadHotTake: {
    videoUri: string;
    draftId?: string;
    title?: string;
    sport?: string;
    scheduledFor?: string;
    editMetadata?: any;
  };
};

export default function UploadHotTakeScreen() {
  const route = useRoute<RouteProp<RouteParams, 'UploadHotTake'>>();
  const navigation = useNavigation();
  const { videoUri, draftId, editMetadata } = route.params;
  const { getToken } = useAuth();

  const [title, setTitle] = useState(route.params.title || '');
  const [selectedSport, setSelectedSport] = useState(route.params.sport || 'Basketball');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'FRIENDS'>('PUBLIC');
  const [scheduledFor, setScheduledFor] = useState<Date | null>(
    route.params.scheduledFor ? new Date(route.params.scheduledFor) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const sports = ['Basketball', 'Football', 'Baseball', 'Soccer', 'Hockey', 'Other'];

  const saveAsDraft = async () => {
    try {
      setIsSavingDraft(true);
      const token = await getToken();

      const draftData = {
        title: title.trim() || undefined,
        videoUri,
        sport: selectedSport,
        visibility,
        scheduledFor: scheduledFor?.toISOString(),
        editMetadata,
      };

      if (draftId) {
        // Update existing draft
        await axios.patch(`${API_URL}/drafts/${draftId}`, draftData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Toast.show({
          type: 'success',
          text1: 'Draft updated! 💾',
          position: 'bottom',
        });
      } else {
        // Create new draft
        await axios.post(`${API_URL}/drafts`, draftData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Toast.show({
          type: 'success',
          text1: 'Saved as draft! 💾',
          position: 'bottom',
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving draft:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to save draft',
        position: 'bottom',
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const publishNow = async () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please add a title',
        position: 'bottom',
      });
      return;
    }

    try {
      setIsUploading(true);
      const token = await getToken();

      // Use existing upload service with sport and editMetadata
      await uploadHotTake(
        videoUri,
        title,
        undefined, // venue
        undefined, // onProgress
        token || undefined,
        selectedSport,
        editMetadata
      );

      // If this was a draft, delete it
      if (draftId) {
        await axios.delete(`${API_URL}/drafts/${draftId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      Toast.show({
        type: 'success',
        text1: 'Hot Take posted! 🔥',
        position: 'bottom',
      });

      navigation.navigate('Home' as never);
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to post',
        position: 'bottom',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const schedulePost = async () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please add a title',
        position: 'bottom',
      });
      return;
    }

    if (!scheduledFor) {
      Toast.show({
        type: 'error',
        text1: 'Please select a date',
        position: 'bottom',
      });
      return;
    }

    // Save as draft with scheduled date
    await saveAsDraft();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {draftId ? 'Edit Draft' : 'New Hot Take'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Video Preview */}
        <View style={styles.videoPreview}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={64} color="#8892A6" />
          </View>
          {editMetadata && (
            <View style={styles.editBadge}>
              <Ionicons name="create" size={12} color="#FFFFFF" />
              <Text style={styles.editBadgeText}>Edited</Text>
            </View>
          )}
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="What's the play? 🔥"
            placeholderTextColor="#8892A6"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Sport Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Sport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sportOptions}>
              {sports.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.sportOption,
                    selectedSport === sport && styles.sportOptionActive,
                  ]}
                  onPress={() => setSelectedSport(sport)}
                >
                  <Text
                    style={[
                      styles.sportOptionText,
                      selectedSport === sport && styles.sportOptionTextActive,
                    ]}
                  >
                    {sport}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Visibility */}
        <View style={styles.section}>
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.visibilityOptions}>
            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'PUBLIC' && styles.visibilityOptionActive,
              ]}
              onPress={() => setVisibility('PUBLIC')}
            >
              <Ionicons
                name="globe-outline"
                size={20}
                color={visibility === 'PUBLIC' ? '#00FF9F' : '#8892A6'}
              />
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'PUBLIC' && styles.visibilityTextActive,
                ]}
              >
                Public
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'FRIENDS' && styles.visibilityOptionActive,
              ]}
              onPress={() => setVisibility('FRIENDS')}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color={visibility === 'FRIENDS' ? '#00FF9F' : '#8892A6'}
              />
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'FRIENDS' && styles.visibilityTextActive,
                ]}
              >
                Friends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'PRIVATE' && styles.visibilityOptionActive,
              ]}
              onPress={() => setVisibility('PRIVATE')}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={visibility === 'PRIVATE' ? '#00FF9F' : '#8892A6'}
              />
              <Text
                style={[
                  styles.visibilityText,
                  visibility === 'PRIVATE' && styles.visibilityTextActive,
                ]}
              >
                Private
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.label}>Schedule Post (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#00FF9F" />
            <Text style={styles.dateButtonText}>
              {scheduledFor
                ? scheduledFor.toLocaleString()
                : 'Post immediately'}
            </Text>
            {scheduledFor && (
              <TouchableOpacity
                onPress={() => setScheduledFor(null)}
                style={styles.clearDateButton}
              >
                <Ionicons name="close-circle" size={20} color="#FF1493" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledFor || new Date()}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setScheduledFor(selectedDate);
              }
            }}
          />
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.draftButton}
          onPress={saveAsDraft}
          disabled={isSavingDraft}
        >
          <Ionicons name="document-outline" size={20} color="#FFFFFF" />
          <Text style={styles.draftButtonText}>
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.publishButton,
            !title.trim() && styles.publishButtonDisabled,
          ]}
          onPress={scheduledFor ? schedulePost : publishNow}
          disabled={!title.trim() || isUploading}
        >
          <Text style={styles.publishButtonText}>
            {isUploading
              ? 'Posting...'
              : scheduledFor
              ? 'Schedule'
              : 'Post Now'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  videoPreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF9F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  editBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  charCount: {
    fontSize: 12,
    color: '#8892A6',
    textAlign: 'right',
    marginTop: 4,
  },
  sportOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sportOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sportOptionActive: {
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
    borderColor: '#00FF9F',
  },
  sportOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B8C5D6',
  },
  sportOptionTextActive: {
    color: '#00FF9F',
    fontWeight: '600',
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1A1F3A',
    gap: 6,
  },
  visibilityOptionActive: {
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF9F',
  },
  visibilityText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8892A6',
  },
  visibilityTextActive: {
    color: '#00FF9F',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  clearDateButton: {
    padding: 4,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1F3A',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1A1F3A',
    gap: 8,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  publishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#00FF9F',
    gap: 8,
  },
  publishButtonDisabled: {
    backgroundColor: '#3A4166',
    opacity: 0.5,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

