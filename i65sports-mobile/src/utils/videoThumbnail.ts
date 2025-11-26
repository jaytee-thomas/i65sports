import * as VideoThumbnails from 'expo-video-thumbnails';

export const generateThumbnail = async (videoUri: string): Promise<string | null> => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000, // Get thumbnail at 1 second
      quality: 0.7,
    });
    return uri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
};

