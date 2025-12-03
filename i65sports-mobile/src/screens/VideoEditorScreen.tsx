import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { haptics } from '../utils/haptics';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

interface VideoEditorRoute {
  videoUri: string;
  onSave: (editedVideo: EditedVideo) => void;
}

interface EditedVideo {
  uri: string;
  trimStart: number;
  trimEnd: number;
  textOverlay?: string;
  filter?: string;
  playbackRate?: number;
}

export default function VideoEditorScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { videoUri, onSave } = route.params as VideoEditorRoute;

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  
  // Editing states
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [textOverlay, setTextOverlay] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [saving, setSaving] = useState(false);

  const filters = [
    { id: 'none', name: 'Original', style: {} },
    { id: 'bw', name: 'B&W', style: { tintColor: 'grayscale' } },
    { id: 'warm', name: 'Warm', style: { tintColor: '#FFA500' } },
    { id: 'cool', name: 'Cool', style: { tintColor: '#00CED1' } },
    { id: 'vintage', name: 'Vintage', style: { tintColor: '#D4A574' } },
  ];

  const speeds = [
    { value: 0.5, label: '0.5x', icon: 'play-back' },
    { value: 1.0, label: '1x', icon: 'play' },
    { value: 1.5, label: '1.5x', icon: 'play-forward' },
    { value: 2.0, label: '2x', icon: 'play-forward' },
  ];

  useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        setTrimEnd(status.durationMillis ? status.durationMillis / 1000 : 0);
      }
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);

      // Auto-pause at trim end
      if (trimEnd > 0 && status.positionMillis / 1000 >= trimEnd) {
        videoRef.current?.pauseAsync();
        videoRef.current?.setPositionAsync(trimStart * 1000);
      }
    }
  };

  const handlePlayPause = async () => {
    haptics.light();
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  };

  const handleSeek = async (value: number) => {
    await videoRef.current?.setPositionAsync(value * 1000);
  };

  const handleTrimStart = (value: number) => {
    setTrimStart(value);
    if (value > trimEnd) {
      setTrimEnd(value);
    }
  };

  const handleTrimEnd = (value: number) => {
    setTrimEnd(value);
    if (value < trimStart) {
      setTrimStart(value);
    }
  };

  const handleFilterSelect = (filterId: string) => {
    haptics.light();
    setSelectedFilter(filterId === 'none' ? null : filterId);
  };

  const handleSpeedChange = async (speed: number) => {
    haptics.light();
    setPlaybackRate(speed);
    await videoRef.current?.setRateAsync(speed, true);
  };

  const handleSave = async () => {
    try {
      haptics.success();
      setSaving(true);

      // In a real app, you'd process the video here
      // For now, we'll just return the edited parameters
      const editedVideo: EditedVideo = {
        uri: videoUri,
        trimStart,
        trimEnd,
        textOverlay: textOverlay || undefined,
        filter: selectedFilter || undefined,
        playbackRate,
      };

      Toast.show({
        type: 'success',
        text1: 'Video edited successfully!',
        position: 'bottom',
      });

      onSave(editedVideo);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving video:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to save video',
        position: 'bottom',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Video</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#00FF9F" />
          ) : (
            <Ionicons name="checkmark" size={28} color="#00FF9F" />
          )}
        </TouchableOpacity>
      </View>

      {/* Video Preview */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
          rate={playbackRate}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />

        {/* Text Overlay Preview */}
        {textOverlay && (
          <View style={styles.textOverlayContainer}>
            <Text style={styles.textOverlay}>{textOverlay}</Text>
          </View>
        )}

        {/* Play/Pause Button */}
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={48}
            color="rgba(255,255,255,0.9)"
          />
        </TouchableOpacity>

        {/* Filter Indicator */}
        {selectedFilter && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>
              {filters.find(f => f.id === selectedFilter)?.name}
            </Text>
          </View>
        )}
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsSection}>
        <View style={styles.timelineContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Slider
            style={styles.slider}
            value={position}
            minimumValue={0}
            maximumValue={duration}
            minimumTrackTintColor="#00FF9F"
            maximumTrackTintColor="#3A4166"
            thumbTintColor="#00FF9F"
            onSlidingComplete={handleSeek}
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Editing Tools */}
      <ScrollView style={styles.toolsSection} showsVerticalScrollIndicator={false}>
        {/* Trim Section */}
        <View style={styles.toolGroup}>
          <View style={styles.toolHeader}>
            <Ionicons name="cut" size={20} color="#00FF9F" />
            <Text style={styles.toolTitle}>Trim Video</Text>
          </View>
          
          <View style={styles.trimContainer}>
            <View style={styles.trimControl}>
              <Text style={styles.trimLabel}>Start: {formatTime(trimStart)}</Text>
              <Slider
                style={styles.slider}
                value={trimStart}
                minimumValue={0}
                maximumValue={duration}
                minimumTrackTintColor="#00FF9F"
                maximumTrackTintColor="#3A4166"
                thumbTintColor="#00FF9F"
                onValueChange={handleTrimStart}
              />
            </View>
            
            <View style={styles.trimControl}>
              <Text style={styles.trimLabel}>End: {formatTime(trimEnd)}</Text>
              <Slider
                style={styles.slider}
                value={trimEnd}
                minimumValue={0}
                maximumValue={duration}
                minimumTrackTintColor="#00FF9F"
                maximumTrackTintColor="#3A4166"
                thumbTintColor="#00FF9F"
                onValueChange={handleTrimEnd}
              />
            </View>
          </View>
        </View>

        {/* Text Overlay Section */}
        <View style={styles.toolGroup}>
          <View style={styles.toolHeader}>
            <Ionicons name="text" size={20} color="#00FF9F" />
            <Text style={styles.toolTitle}>Text Overlay</Text>
          </View>
          
          {showTextInput ? (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter text..."
                placeholderTextColor="#8892A6"
                value={textOverlay}
                onChangeText={setTextOverlay}
                maxLength={50}
              />
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  setShowTextInput(false);
                }}
              >
                <Ionicons name="checkmark-circle" size={28} color="#00FF9F" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addTextButton}
              onPress={() => {
                haptics.light();
                setShowTextInput(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color="#00FF9F" />
              <Text style={styles.addTextButtonText}>
                {textOverlay ? 'Edit Text' : 'Add Text'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters Section */}
        <View style={styles.toolGroup}>
          <View style={styles.toolHeader}>
            <Ionicons name="color-filter" size={20} color="#00FF9F" />
            <Text style={styles.toolTitle}>Filters</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterOption,
                  selectedFilter === filter.id && styles.filterOptionActive,
                ]}
                onPress={() => handleFilterSelect(filter.id)}
              >
                <View style={[styles.filterPreview, filter.style]} />
                <Text style={styles.filterName}>{filter.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Speed Controls Section */}
        <View style={styles.toolGroup}>
          <View style={styles.toolHeader}>
            <Ionicons name="speedometer" size={20} color="#00FF9F" />
            <Text style={styles.toolTitle}>Playback Speed</Text>
          </View>
          
          <View style={styles.speedContainer}>
            {speeds.map((speed) => (
              <TouchableOpacity
                key={speed.value}
                style={[
                  styles.speedButton,
                  playbackRate === speed.value && styles.speedButtonActive,
                ]}
                onPress={() => handleSpeedChange(speed.value)}
              >
                <Ionicons
                  name={speed.icon as any}
                  size={20}
                  color={playbackRate === speed.value ? '#0A0E27' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.speedText,
                    playbackRate === speed.value && styles.speedTextActive,
                  ]}
                >
                  {speed.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  videoContainer: {
    width: width,
    height: width * (16 / 9),
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textOverlayContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  textOverlay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 255, 159, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
  controlsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#B8C5D6',
    width: 40,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  toolsSection: {
    flex: 1,
    padding: 16,
  },
  toolGroup: {
    marginBottom: 24,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trimContainer: {
    gap: 12,
  },
  trimControl: {
    gap: 8,
  },
  trimLabel: {
    fontSize: 14,
    color: '#B8C5D6',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  addTextButtonText: {
    fontSize: 14,
    color: '#00FF9F',
    fontWeight: '600',
  },
  filterOption: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    borderColor: '#00FF9F',
    backgroundColor: '#1A1F3A',
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#3A4166',
    marginBottom: 8,
  },
  filterName: {
    fontSize: 12,
    color: '#B8C5D6',
  },
  speedContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  speedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  speedButtonActive: {
    backgroundColor: '#00FF9F',
    borderColor: '#00FF9F',
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  speedTextActive: {
    color: '#0A0E27',
  },
});

