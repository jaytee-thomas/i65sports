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
  Alert,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

type RouteParams = {
  VideoEditor: {
    videoUri: string;
    draftId?: string;
  };
};

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

interface EditMetadata {
  trimStart: number;
  trimEnd: number;
  playbackSpeed: number;
  filter: string;
  textOverlays: TextOverlay[];
}

const FILTERS = [
  { id: 'none', name: 'Original', overlay: null },
  { id: 'bw', name: 'B&W', overlay: 'rgba(128, 128, 128, 0.4)' },
  { id: 'vintage', name: 'Vintage', overlay: 'rgba(139, 69, 19, 0.3)' },
  { id: 'vibrant', name: 'Vibrant', overlay: 'rgba(255, 0, 128, 0.15)' },
  { id: 'cool', name: 'Cool', overlay: 'rgba(0, 128, 255, 0.25)' },
  { id: 'warm', name: 'Warm', overlay: 'rgba(255, 128, 0, 0.25)' },
];

export default function VideoEditorScreen() {
  const route = useRoute<RouteProp<RouteParams, 'VideoEditor'>>();
  const navigation = useNavigation();
  const { videoUri, draftId } = route.params;

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Editing state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [newOverlayText, setNewOverlayText] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState<'trim' | 'text' | 'filter' | 'speed'>('trim');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadVideo();
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  const loadVideo = async () => {
    // Video will auto-load when ref is set
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);
      
      if (duration === 0 && status.durationMillis) {
        const dur = status.durationMillis / 1000;
        setDuration(dur);
        setTrimEnd(dur);
      }

      // Auto-loop within trim range
      if (trimEnd > 0 && status.positionMillis / 1000 >= trimEnd) {
        videoRef.current?.setPositionAsync(trimStart * 1000);
      }
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
  };

  const handleSeek = (value: number) => {
    videoRef.current?.setPositionAsync(value * 1000);
    setCurrentTime(value);
  };

  const addTextOverlay = () => {
    if (!newOverlayText.trim()) return;

    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: newOverlayText,
      x: 50,
      y: 50,
      fontSize: 32,
      color: '#FFFFFF',
    };

    setTextOverlays([...textOverlays, newOverlay]);
    setNewOverlayText('');
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter((overlay) => overlay.id !== id));
  };

  const saveEdits = async () => {
    try {
      setIsProcessing(true);

      // Create metadata object
      const metadata: EditMetadata = {
        trimStart,
        trimEnd,
        playbackSpeed,
        filter: selectedFilter,
        textOverlays,
      };

      console.log('💾 Saving edits, navigating to UploadHotTake...');
      console.log('📹 Video URI:', videoUri);
      console.log('✏️ Edit Metadata:', metadata);

      Alert.alert(
        'Save Video',
        'Video edits will be applied when posting. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsProcessing(false),
          },
          {
            text: 'Continue',
            onPress: () => {
              // Navigate directly to UploadHotTake with serializable data
              const params = {
                videoUri: videoUri,
                editMetadata: metadata,
                draftId: draftId,
              };
              
              console.log('🚀 Navigating with params:', params);
              // @ts-ignore - Navigation typing issue
              navigation.navigate('UploadHotTake', params);
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error saving edits:', error);
      Alert.alert('Error', 'Failed to save edits');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current filter overlay color
  const getFilterOverlay = () => {
    const filter = FILTERS.find((f) => f.id === selectedFilter);
    return filter?.overlay;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Video</Text>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={saveEdits}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#00FF9F" />
          ) : (
            <Text style={styles.doneText}>Done</Text>
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
          isLooping
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          rate={playbackSpeed}
        />

        {/* Text Overlays Preview */}
        {textOverlays.map((overlay) => (
          <View
            key={overlay.id}
            style={[
              styles.textOverlayPreview,
              {
                left: overlay.x,
                top: overlay.y,
              },
            ]}
          >
            <Text
              style={[
                styles.overlayText,
                {
                  fontSize: overlay.fontSize,
                  color: overlay.color,
                },
              ]}
            >
              {overlay.text}
            </Text>
            <TouchableOpacity
              style={styles.removeOverlayButton}
              onPress={() => removeTextOverlay(overlay.id)}
            >
              <Ionicons name="close-circle" size={20} color="#FF1493" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Play/Pause Button */}
        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={48}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Filter Overlay */}
        {getFilterOverlay() && (
          <View
            style={[
              styles.filterOverlay,
              { backgroundColor: getFilterOverlay() || 'transparent' },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Filter Indicator */}
        {selectedFilter !== 'none' && (
          <View style={styles.filterIndicator}>
            <Ionicons name="color-filter" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.filterIndicatorText}>
              {FILTERS.find((f) => f.id === selectedFilter)?.name}
            </Text>
          </View>
        )}
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={styles.slider}
          value={currentTime}
          minimumValue={0}
          maximumValue={duration}
          onValueChange={handleSeek}
          minimumTrackTintColor="#00FF9F"
          maximumTrackTintColor="#3A4166"
          thumbTintColor="#00FF9F"
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Editing Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trim' && styles.activeTab]}
          onPress={() => setActiveTab('trim')}
        >
          <Ionicons
            name="cut"
            size={20}
            color={activeTab === 'trim' ? '#00FF9F' : '#8892A6'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'trim' && styles.activeTabText,
            ]}
          >
            Trim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'text' && styles.activeTab]}
          onPress={() => setActiveTab('text')}
        >
          <Ionicons
            name="text"
            size={20}
            color={activeTab === 'text' ? '#00FF9F' : '#8892A6'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'text' && styles.activeTabText,
            ]}
          >
            Text
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'filter' && styles.activeTab]}
          onPress={() => setActiveTab('filter')}
        >
          <Ionicons
            name="color-filter"
            size={20}
            color={activeTab === 'filter' ? '#00FF9F' : '#8892A6'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'filter' && styles.activeTabText,
            ]}
          >
            Filter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'speed' && styles.activeTab]}
          onPress={() => setActiveTab('speed')}
        >
          <Ionicons
            name="speedometer"
            size={20}
            color={activeTab === 'speed' ? '#00FF9F' : '#8892A6'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'speed' && styles.activeTabText,
            ]}
          >
            Speed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Editing Controls */}
      <ScrollView style={styles.controls} contentContainerStyle={styles.controlsContent}>
        {activeTab === 'trim' && (
          <View style={styles.trimControls}>
            <Text style={styles.controlLabel}>Trim Start</Text>
            <View style={styles.trimRow}>
              <Text style={styles.trimTime}>{formatTime(trimStart)}</Text>
              <Slider
                style={styles.trimSlider}
                value={trimStart}
                minimumValue={0}
                maximumValue={duration}
                onValueChange={setTrimStart}
                minimumTrackTintColor="#00FF9F"
                maximumTrackTintColor="#3A4166"
                thumbTintColor="#00FF9F"
              />
            </View>

            <Text style={styles.controlLabel}>Trim End</Text>
            <View style={styles.trimRow}>
              <Text style={styles.trimTime}>{formatTime(trimEnd)}</Text>
              <Slider
                style={styles.trimSlider}
                value={trimEnd}
                minimumValue={trimStart}
                maximumValue={duration}
                onValueChange={setTrimEnd}
                minimumTrackTintColor="#00FF9F"
                maximumTrackTintColor="#3A4166"
                thumbTintColor="#00FF9F"
              />
            </View>

            <View style={styles.durationBox}>
              <Text style={styles.durationLabel}>Final Duration</Text>
              <Text style={styles.durationText}>
                {formatTime(trimEnd - trimStart)}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'text' && (
          <View style={styles.textControls}>
            <Text style={styles.controlLabel}>Add Text Overlay</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter text..."
              placeholderTextColor="#8892A6"
              value={newOverlayText}
              onChangeText={setNewOverlayText}
              maxLength={50}
            />
            <TouchableOpacity
              style={[
                styles.addTextButton,
                !newOverlayText.trim() && styles.addTextButtonDisabled,
              ]}
              onPress={addTextOverlay}
              disabled={!newOverlayText.trim()}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addTextText}>Add Text</Text>
            </TouchableOpacity>

            {textOverlays.length > 0 && (
              <View style={styles.overlaysList}>
                <Text style={styles.overlaysTitle}>Text Overlays:</Text>
                {textOverlays.map((overlay) => (
                  <View key={overlay.id} style={styles.overlayItem}>
                    <Text style={styles.overlayItemText} numberOfLines={1}>
                      {overlay.text}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeTextOverlay(overlay.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF1493" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'filter' && (
          <View style={styles.filterControls}>
            <Text style={styles.controlLabel}>Choose Filter</Text>
            <Text style={styles.filterHint}>
              Tap a filter to see a preview
            </Text>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterOption,
                  selectedFilter === filter.id && styles.filterOptionActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <View style={styles.filterRadio}>
                  {selectedFilter === filter.id && (
                    <View style={styles.filterRadioInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.filterName,
                    selectedFilter === filter.id && styles.filterNameActive,
                  ]}
                >
                  {filter.name}
                </Text>
                {filter.id !== 'none' && (
                  <View style={[styles.filterPreview, { backgroundColor: filter.overlay || '#1A1F3A' }]}>
                    <Text style={styles.filterPreviewText}>Preview</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'speed' && (
          <View style={styles.speedControls}>
            <Text style={styles.controlLabel}>Playback Speed</Text>
            <View style={styles.speedDisplay}>
              <Text style={styles.speedValue}>{playbackSpeed.toFixed(1)}x</Text>
              <Text style={styles.speedDescription}>
                {playbackSpeed < 1 ? 'Slow Motion' : playbackSpeed > 1 ? 'Fast Forward' : 'Normal'}
              </Text>
            </View>
            <Slider
              style={styles.speedSlider}
              value={playbackSpeed}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.1}
              onValueChange={setPlaybackSpeed}
              minimumTrackTintColor="#00FF9F"
              maximumTrackTintColor="#3A4166"
              thumbTintColor="#00FF9F"
            />
            <View style={styles.speedMarkers}>
              <Text style={styles.speedMarker}>0.5x</Text>
              <Text style={styles.speedMarker}>1.0x</Text>
              <Text style={styles.speedMarker}>1.5x</Text>
              <Text style={styles.speedMarker}>2.0x</Text>
            </View>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  cancelButton: {},
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  doneButton: {},
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF9F',
  },
  videoContainer: {
    width: width,
    height: height * 0.35,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  textOverlayPreview: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overlayText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  removeOverlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 2,
  },
  playButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 159, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  filterIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    backgroundColor: '#0A0E27',
  },
  timeText: {
    fontSize: 12,
    color: '#B8C5D6',
    width: 40,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
    backgroundColor: '#0A0E27',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00FF9F',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8892A6',
  },
  activeTabText: {
    color: '#00FF9F',
  },
  controls: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  controlsContent: {
    paddingBottom: 40,
  },
  trimControls: {
    padding: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
    marginTop: 8,
    marginBottom: 12,
  },
  trimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  trimTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF9F',
    width: 50,
  },
  trimSlider: {
    flex: 1,
  },
  durationBox: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  durationLabel: {
    fontSize: 14,
    color: '#8892A6',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FF9F',
  },
  textControls: {
    padding: 16,
  },
  textInput: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  addTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF9F',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addTextButtonDisabled: {
    backgroundColor: '#3A4166',
    opacity: 0.5,
  },
  addTextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  overlaysList: {
    marginTop: 24,
  },
  overlaysTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
    marginBottom: 12,
  },
  overlayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  overlayItemText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 12,
  },
  filterControls: {
    padding: 16,
  },
  filterHint: {
    fontSize: 13,
    color: '#8892A6',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  filterOptionActive: {
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
    borderWidth: 2,
    borderColor: '#00FF9F',
  },
  filterRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8892A6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF9F',
  },
  filterName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  filterNameActive: {
    color: '#00FF9F',
    fontWeight: '600',
  },
  filterPreview: {
    width: 60,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  filterPreviewText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  speedControls: {
    padding: 16,
  },
  speedDisplay: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  speedValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00FF9F',
    marginBottom: 8,
  },
  speedDescription: {
    fontSize: 14,
    color: '#8892A6',
  },
  speedSlider: {
    width: '100%',
    marginBottom: 8,
  },
  speedMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  speedMarker: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8892A6',
  },
});