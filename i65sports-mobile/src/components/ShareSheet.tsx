import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shareUtils } from '../utils/shareUtils';
import { haptics } from '../utils/haptics';

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  hotTake: any;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({ visible, onClose, hotTake }) => {
  const shareOptions = [
    {
      icon: 'share-outline',
      label: 'Share Link',
      color: '#00FF9F',
      onPress: () => {
        shareUtils.shareHotTake(hotTake);
        onClose();
      },
    },
    {
      icon: 'logo-instagram',
      label: 'Instagram Story',
      color: '#E4405F',
      onPress: () => {
        shareUtils.shareToInstagramStory(hotTake);
        onClose();
      },
    },
    {
      icon: 'logo-twitter',
      label: 'Twitter',
      color: '#1DA1F2',
      onPress: () => {
        shareUtils.shareToTwitter(hotTake);
        onClose();
      },
    },
    {
      icon: 'copy-outline',
      label: 'Copy Link',
      color: '#FFB800',
      onPress: () => {
        shareUtils.copyLink(hotTake);
        onClose();
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>Share Hot Take</Text>
          
          <View style={styles.options}>
            {shareOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => {
                  haptics.light();
                  option.onPress();
                }}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                  <Ionicons name={option.icon as any} size={28} color={option.color} />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1F3A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A4166',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  option: {
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 12,
    color: '#B8C5D6',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#3A4166',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

