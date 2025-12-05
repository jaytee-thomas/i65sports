import React, { useState, useRef, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { uploadHotTake, UploadProgress } from '../services/upload';
import EngagementToolsSection from '../components/EngagementToolsSection';

// UploadHotTakeScreen - Screen for uploading or saving Hot Takes as drafts

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
  const { getToken } = useAuth();

  // Capture route params in a ref on first render only to prevent re-renders
  const paramsRef = useRef(route.params);
  const params = paramsRef.current || {};

  // Extract values once - these won't change even if route.params object reference changes
  const videoUri = params.videoUri;
  const draftId = params.draftId;
  const editMetadata = params.editMetadata;

  // Initialize state only once using lazy initialization - useState initializer runs once
  const [title, setTitle] = useState(() => params.title || '');
  const [selectedSport, setSelectedSport] = useState(() => params.sport || 'Basketball');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'FRIENDS'>('PUBLIC');
  const [scheduledFor, setScheduledFor] = useState<Date | null>(() =>
    params.scheduledFor ? new Date(params.scheduledFor) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Engagement Tools State
  const [pollData, setPollData] = useState<any>(null);
  const [questionData, setQuestionData] = useState<any>(null);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [challengeData, setChallengeData] = useState<any>(null);
  
  // Track if we've already saved to prevent duplicate saves
  const hasSavedRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  // Memoize sports array to prevent recreation on each render
  const sports = useMemo(() => ['Basketball', 'Football', 'Baseball', 'Soccer', 'Hockey', 'Other'], []);

  const saveAsDraft = async () => {
    // Prevent duplicate saves or navigation
    if (hasSavedRef.current || isSavingDraft || hasNavigatedRef.current) {
      console.log('⚠️ Save already in progress or completed');
      return;
    }

    hasSavedRef.current = true;
    setIsSavingDraft(true);

    try {
      const token = await getToken();

      const draftData = {
        title: title.trim() || undefined,
        videoUri,
        sport: selectedSport,
        visibility,
        scheduledFor: scheduledFor?.toISOString(),
        editMetadata,
        // Include engagement tools in draft
        engagementTools: {
          poll: pollData,
          question: questionData,
          prediction: predictionData,
          challenge: challengeData,
        },
      };

      console.log('💾 Saving draft...', { draftId, hasTitle: !!title.trim() });

      if (draftId) {
        // Update existing draft
        await axios.patch(`${API_URL}/drafts/${draftId}`, draftData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Toast.show({
          type: 'success',
          text1: 'Draft Updated! 💾',
          text2: 'Your Hot Take has been saved to drafts',
          position: 'top',
          visibilityTime: 2000,
        });
      } else {
        // Create new draft
        await axios.post(`${API_URL}/drafts`, draftData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Toast.show({
          type: 'success',
          text1: 'Draft Saved! 💾',
          text2: 'Your Hot Take has been saved to drafts',
          position: 'top',
          visibilityTime: 2000,
        });
      }

      console.log('✅ Draft saved successfully');

      // Set navigation guard RIGHT BEFORE navigation
      hasNavigatedRef.current = true;

      // Navigate immediately after success
      if (navigation.canGoBack()) {
        console.log('🔙 Navigating back');
        navigation.goBack();
      } else {
        console.log('🏠 Navigating to Home');
        (navigation as any).navigate('Home');
      }
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      
      // Reset states on error to allow retry
      hasSavedRef.current = false;
      setIsSavingDraft(false);
      
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: error instanceof Error ? error.message : 'Could not save draft. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
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
      console.log('📤 Starting publish process...');
      setIsUploading(true);
      setUploadProgress(0);
      
      const token = await getToken();
      console.log('🔐 Got auth token:', token ? 'Yes' : 'No');

      // First upload the video and create Hot Take
      console.log('📹 Calling uploadHotTake...');
      const hotTakeResponse = await uploadHotTake(
        videoUri,
        title,
        undefined, // venue
        (progress: UploadProgress) => {
          console.log(`📊 Upload progress: ${progress.percentage}%`);
          setUploadProgress(progress.percentage);
        },
        token || undefined,
        selectedSport,
        editMetadata
      );

      console.log('✅ Upload completed!', hotTakeResponse);

      // Get the created Hot Take ID from response
      const hotTakeId = hotTakeResponse?.id || hotTakeResponse?.hotTake?.id;

      if (!hotTakeId) {
        throw new Error('No Hot Take ID returned from upload');
      }

      // Create engagement tools if they exist
      console.log('🎮 Creating engagement tools...');
      
      if (pollData) {
        console.log('📊 Creating poll...');
        await axios.post(`${API_URL}/polls`, {
          takeId: hotTakeId,
          ...pollData,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (questionData) {
        console.log('❓ Creating question...');
        await axios.post(`${API_URL}/questions`, {
          takeId: hotTakeId,
          ...questionData,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (predictionData) {
        console.log('🏆 Creating prediction...');
        await axios.post(`${API_URL}/predictions`, {
          takeId: hotTakeId,
          ...predictionData,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (challengeData) {
        console.log('🔥 Creating challenge...');
        await axios.post(`${API_URL}/challenges`, {
          takeId: hotTakeId,
          ...challengeData,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // If this was a draft, delete it
      if (draftId) {
        console.log('🗑️ Deleting draft...');
        await axios.delete(`${API_URL}/drafts/${draftId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      Toast.show({
        type: 'success',
        text1: 'Hot Take posted! 🔥',
        text2: pollData || questionData || predictionData || challengeData 
          ? 'With engagement tools!' 
          : undefined,
        position: 'bottom',
        visibilityTime: 2000,
      });

      // Small delay to let user see the success message
      setTimeout(() => {
        navigation.navigate('Home' as never);
      }, 500);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      
      // Show specific error message
      const errorMessage = error.message || 'Failed to post. Please try again.';
      
      Alert.alert(
        'Upload Failed',
        errorMessage,
        [
          { text: 'OK', style: 'default' }
        ]
      );

      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isUploading}>
          <Ionicons name="close" size={28} color={isUploading ? "#8892A6" : "#FFFFFF"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {draftId ? 'Edit Draft' : 'New Hot Take'}
        </Text>
        <View style={{ width: 28 }}>
          {isUploading && <ActivityIndicator size="small" color="#00FF9F" />}
        </View>
      </View>

      {/* Upload Progress Overlay */}
      {isUploading && (
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadCard}>
            <ActivityIndicator size="large" color="#00FF9F" />
            <Text style={styles.uploadText}>Uploading Your Hot Take...</Text>
            <Text style={styles.uploadPercentage}>{uploadProgress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.uploadHint}>This may take a moment</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} scrollEnabled={!isUploading}>
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
            editable={!isUploading}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Sport Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Sport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={!isUploading}>
            <View style={styles.sportOptions}>
              {sports.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.sportOption,
                    selectedSport === sport && styles.sportOptionActive,
                  ]}
                  onPress={() => !isUploading && setSelectedSport(sport)}
                  disabled={isUploading}
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
              onPress={() => !isUploading && setVisibility('PUBLIC')}
              disabled={isUploading}
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
              onPress={() => !isUploading && setVisibility('FRIENDS')}
              disabled={isUploading}
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
              onPress={() => !isUploading && setVisibility('PRIVATE')}
              disabled={isUploading}
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

        {/* Engagement Tools Section */}
        <View style={styles.engagementSection}>
          <EngagementToolsSection
            onPollChange={setPollData}
            onQuestionChange={setQuestionData}
            onPredictionChange={setPredictionData}
            onChallengeChange={setChallengeData}
          />
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.label}>Schedule Post (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => !isUploading && setShowDatePicker(true)}
            disabled={isUploading}
          >
            <Ionicons name="calendar-outline" size={20} color="#00FF9F" />
            <Text style={styles.dateButtonText}>
              {scheduledFor
                ? scheduledFor.toLocaleString()
                : 'Post immediately'}
            </Text>
            {scheduledFor && !isUploading && (
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
          style={[styles.draftButton, isUploading && styles.buttonDisabled]}
          onPress={saveAsDraft}
          disabled={isSavingDraft || isUploading}
        >
          <Ionicons name="document-outline" size={20} color="#FFFFFF" />
          <Text style={styles.draftButtonText}>
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.publishButton,
            (!title.trim() || isUploading) && styles.publishButtonDisabled,
          ]}
          onPress={scheduledFor ? schedulePost : publishNow}
          disabled={!title.trim() || isUploading}
        >
          <Text style={styles.publishButtonText}>
            {isUploading
              ? `${uploadProgress}%`
              : scheduledFor
              ? 'Schedule'
              : 'Post Now'}
          </Text>
          {!isUploading && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
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
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  uploadPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00FF9F',
    marginTop: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#2A3154',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF9F',
  },
  uploadHint: {
    fontSize: 13,
    color: '#8892A6',
    marginTop: 12,
    textAlign: 'center',
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
  engagementSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
