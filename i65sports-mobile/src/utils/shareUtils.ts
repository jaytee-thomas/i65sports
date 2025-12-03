import { Share, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { haptics } from './haptics';

interface HotTake {
  id: string;
  title: string;
  videoUrl?: string;
  thumbUrl?: string | null;
  author: {
    username: string;
  };
}

export const shareUtils = {
  // Share Hot Take link
  shareHotTake: async (hotTake: HotTake) => {
    try {
      haptics.light();
      
      const shareUrl = `https://i65sports.com/hot-take/${hotTake.id}`;
      const message = `🔥 Check out "${hotTake.title}" by @${hotTake.author.username} on i65Sports!\n\n${shareUrl}`;

      await Share.share({
        message,
        url: shareUrl,
        title: hotTake.title,
      });

      haptics.success();
    } catch (error) {
      console.error('Error sharing:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to share',
        position: 'bottom',
      });
    }
  },

  // Share to Instagram Stories (requires video download)
  shareToInstagramStory: async (hotTake: HotTake) => {
    if (!hotTake.videoUrl) {
      Toast.show({
        type: 'error',
        text1: 'No video to share',
        position: 'bottom',
      });
      return;
    }

    try {
      haptics.light();
      
      Toast.show({
        type: 'info',
        text1: 'Downloading video...',
        position: 'bottom',
      });

      // Download video to temp location
      const fileUri = `${FileSystem.cacheDirectory}${hotTake.id}.mp4`;
      const downloadResult = await FileSystem.downloadAsync(hotTake.videoUrl, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'video/mp4',
          dialogTitle: 'Share to Instagram',
        });
        haptics.success();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Sharing not available',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to share to Instagram',
        position: 'bottom',
      });
    }
  },

  // Share to Twitter/X
  shareToTwitter: async (hotTake: HotTake) => {
    try {
      haptics.light();
      
      const shareUrl = `https://i65sports.com/hot-take/${hotTake.id}`;
      const text = `🔥 "${hotTake.title}" by @${hotTake.author.username}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;

      await Share.share({
        message: `${text}\n\n${shareUrl}`,
        url: shareUrl,
      });

      haptics.success();
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to share',
        position: 'bottom',
      });
    }
  },

  // Copy link to clipboard
  copyLink: async (hotTake: HotTake) => {
    try {
      haptics.light();
      
      const shareUrl = `https://i65sports.com/hot-take/${hotTake.id}`;
      
      // For web, use Clipboard API
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // For mobile, we'll use expo-clipboard
        const Clipboard = await import('expo-clipboard');
        await Clipboard.default.setStringAsync(shareUrl);
      }

      haptics.success();
      Toast.show({
        type: 'success',
        text1: 'Link copied!',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error copying link:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to copy link',
        position: 'bottom',
      });
    }
  },
};

