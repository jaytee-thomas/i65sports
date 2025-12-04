import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { uploadHotTake, UploadProgress } from '../services/upload';
import { haptics } from '../utils/haptics';
import { VenueDetector } from '../components/VenueDetector';

export default function CameraScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [checkedInVenue, setCheckedInVenue] = useState<{ id: string; name: string } | null>(null);
  const [editMetadata, setEditMetadata] = useState<any>(null);
  
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera" size={64} color="#00FF9F" />
          <Text style={styles.permissionText}>
            Camera access is required to record Hot Takes
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        console.log('Starting recording...');
        setIsRecording(true);
        setRecordingTime(0);

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => {
            if (prev >= 60) {
              stopRecording();
              return 60;
            }
            return prev + 1;
          });
        }, 1000);

        // Start actual recording
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60,
        });
        
        console.log('✅ Video recorded successfully!', video.uri);
        
        // Navigate to UploadHotTakeScreen
        (navigation as any).navigate('UploadHotTake', {
          videoUri: video.uri,
        });
      } catch (error) {
        console.error('❌ Recording error:', error);
        Alert.alert('Recording Error', String(error));
        setIsRecording(false);
      }
    }
  };

  const [editMetadata, setEditMetadata] = useState<any>(null);

  const stopRecording = async () => {
    console.log('Stopping recording...');
    if (cameraRef.current && isRecording) {
      try {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const video = await cameraRef.current.stopRecording();
        
        if (video?.uri) {
          haptics.success();
          
          // Navigate to video editor
          (navigation as any).navigate('VideoEditor', {
            videoUri: video.uri,
            onSave: (editedVideoUri: string, metadata: any) => {
              // Handle the edited video with metadata
              handleVideoEdited(editedVideoUri, metadata);
            },
          });
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        Toast.show({
          type: 'error',
          text1: 'Recording Error',
          text2: 'Failed to stop recording',
          position: 'bottom',
        });
      }
    }
  };

  const handleVideoEdited = (editedVideoUri: string, metadata: any) => {
    // Navigate to UploadHotTakeScreen instead of showing modal
    (navigation as any).navigate('UploadHotTake', {
      videoUri: editedVideoUri,
      editMetadata: metadata,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!videoUri || !title.trim()) {
      Alert.alert('Error', 'Please enter a title for your Hot Take');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to upload Hot Takes');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Get auth token from Clerk
      const token = await getToken();
      
      const result = await uploadHotTake(
        videoUri,
        title,
        checkedInVenue?.name || 'Unknown Venue',
        (progress: UploadProgress) => {
          setUploadProgress(progress.percentage);
        },
        token || undefined // Pass auth token
      );

      console.log('Upload successful!', result);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Hot Take Uploaded! 🔥',
        text2: 'Your video is now live!',
        position: 'top',
        visibilityTime: 3000,
      });
      
      // Reset and go back to home
      setVideoUri(null);
      setTitle('');
      setShowUploadModal(false);
      navigation.navigate('Home' as never);
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error.response?.data?.error || 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const cancelUpload = () => {
    console.log('Upload cancelled');
    setShowUploadModal(false);
    setVideoUri(null);
    setTitle('');
    setUploadProgress(0);
  };

  return (
    <View style={styles.container}>
      {/* Venue Detection Banner */}
      <VenueDetector
        onCheckInSuccess={(venue) => {
          console.log('✅ Checked in at:', venue.name);
          setCheckedInVenue({ id: venue.id, name: venue.name });
          // You can store this venue ID to tag the Hot Take
        }}
      />

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={32} color="#FFFFFF" />
      </TouchableOpacity>
      
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        mode="video"
      >
        {/* Timer Display */}
        {isRecording && (
          <View style={styles.timerContainer}>
            <View style={styles.recordingDot} />
            <Text style={styles.timerText}>
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        {/* Recording Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={styles.recordIcon} />
            )}
          </TouchableOpacity>
        </View>

        {/* Hint Text */}
        {!isRecording && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              Record your 60-second Hot Take
            </Text>
          </View>
        )}
      </CameraView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={cancelUpload}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Hot Take 🔥</Text>
            
            {!isUploading ? (
              <>
                {/* Edit Info Display */}
                {editMetadata && (
                  <View style={styles.editInfoContainer}>
                    <View style={styles.editInfoHeader}>
                      <Ionicons name="checkmark-circle" size={16} color="#00FF9F" />
                      <Text style={styles.editInfoTitle}>Video Edited</Text>
                    </View>
                    <View style={styles.editInfoDetails}>
                      {(editMetadata.trimStart > 0 || (editMetadata.trimEnd && editMetadata.trimEnd < 60)) && (
                        <Text style={styles.editInfoText}>
                          ✂️ Trimmed to {formatTime(editMetadata.trimEnd - editMetadata.trimStart)}
                        </Text>
                      )}
                      {editMetadata.playbackSpeed !== 1.0 && (
                        <Text style={styles.editInfoText}>
                          ⚡ Speed: {editMetadata.playbackSpeed.toFixed(1)}x
                        </Text>
                      )}
                      {editMetadata.filter && editMetadata.filter !== 'none' && (
                        <Text style={styles.editInfoText}>
                          🎨 Filter: {editMetadata.filter}
                        </Text>
                      )}
                      {editMetadata.textOverlays && editMetadata.textOverlays.length > 0 && (
                        <Text style={styles.editInfoText}>
                          📝 {editMetadata.textOverlays.length} text overlay{editMetadata.textOverlays.length > 1 ? 's' : ''}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.reEditButton}
                      onPress={() => {
                        (navigation as any).navigate('VideoEditor', {
                          videoUri: videoUri || '',
                          onSave: (newUri: string, newMetadata: any) => {
                            handleVideoEdited(newUri, newMetadata);
                          },
                        });
                      }}
                    >
                      <Text style={styles.reEditText}>Edit Again</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Give your Hot Take a title..."
                  placeholderTextColor="#8892A6"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                  autoFocus
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={cancelUpload}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.uploadButton]}
                    onPress={handleUpload}
                  >
                    <Text style={styles.uploadButtonText}>Upload</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color="#00FF9F" />
                <Text style={styles.uploadingText}>
                  Uploading... {uploadProgress}%
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${uploadProgress}%` }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#B8C5D6',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  permissionButton: {
    backgroundColor: '#00FF9F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#0A0E27',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  timerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderColor: '#FF0000',
  },
  recordIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF0000',
  },
  stopIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2A3154',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2A3154',
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  cancelButtonText: {
    color: '#B8C5D6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#00FF9F',
  },
  uploadButtonText: {
    color: '#0A0E27',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  uploadingText: {
    color: '#B8C5D6',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#2A3154',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF9F',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editInfoContainer: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  editInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  editInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF9F',
  },
  editInfoDetails: {
    gap: 6,
    marginBottom: 12,
  },
  editInfoText: {
    fontSize: 14,
    color: '#B8C5D6',
  },
  reEditButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FF9F',
  },
  reEditText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF9F',
  },
});
