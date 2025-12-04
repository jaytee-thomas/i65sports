import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { haptics } from '../utils/haptics';
import { VenueDetector } from '../components/VenueDetector';

export default function CameraScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
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
              if (cameraRef.current) {
                cameraRef.current.stopRecording();
              }
              return 60;
            }
            return prev + 1;
          });
        }, 1000);

        // Start actual recording - this will resolve when recording stops
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60,
        });
        
        // Clean up timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setIsRecording(false);
        
        if (video && 'uri' in video && typeof video.uri === 'string') {
          console.log('✅ Video recorded successfully!', video.uri);
          haptics.success();
          
          // Navigate to video editor first
          (navigation as any).navigate('VideoEditor', {
            videoUri: video.uri,
            onSave: (editedVideoUri: string, metadata: any) => {
              handleVideoEdited(editedVideoUri, metadata);
            },
          });
        }
      } catch (error) {
        console.error('❌ Recording error:', error);
        Alert.alert('Recording Error', String(error));
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    if (cameraRef.current && isRecording) {
      try {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        await cameraRef.current.stopRecording();
        
        // Note: stopRecording() doesn't return the video directly
        // The video will be available from the recordAsync promise
        // For manual stop, we'll need to handle it differently
        haptics.success();
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
    // Navigate to UploadHotTakeScreen with edited video and metadata
    (navigation as any).navigate('UploadHotTake', {
      videoUri: editedVideoUri,
      editMetadata: metadata,
      venue: checkedInVenue?.name,
    });
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
});
