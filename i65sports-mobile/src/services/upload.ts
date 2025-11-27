import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { generateThumbnail } from '../utils/videoThumbnail';

const API_URL = 'http://192.168.86.226:3000/api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadHotTake = async (
  videoUri: string,
  title: string,
  venue?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<any> => {
  try {
    console.log('Starting upload...', videoUri);
    
    // Generate thumbnail
    console.log('Generating thumbnail...');
    const thumbnailUri = await generateThumbnail(videoUri);
    
    // Create form data
    const formData = new FormData();
    
    // Get video file info using legacy API
    const videoInfo = await FileSystem.getInfoAsync(videoUri);
    if (!videoInfo.exists) {
      throw new Error('Video file not found');
    }

    // Add video file to form data
    const filename = videoUri.split('/').pop() || 'video.mov';
    formData.append('video', {
      uri: videoUri,
      type: 'video/quicktime',
      name: filename,
    } as any);

    // Add thumbnail if generated
    if (thumbnailUri) {
      const thumbFilename = `thumb-${filename}.jpg`;
      formData.append('thumbnail', {
        uri: thumbnailUri,
        type: 'image/jpeg',
        name: thumbFilename,
      } as any);
    }

    // Add metadata
    formData.append('title', title);
    if (venue) {
      formData.append('venue', venue);
    }

    console.log('Uploading to:', `${API_URL}/hot-takes-public`);

    // Upload to your backend - NOTE: using /hot-takes-public now!
    const response = await axios.post(`${API_URL}/hot-takes-public`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });

    console.log('Upload successful!', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
