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
  onProgress?: (progress: UploadProgress) => void,
  authToken?: string,
  sport?: string,
  editMetadata?: any
): Promise<any> => {
  try {
    console.log('🚀 Starting upload...');
    console.log('📹 Video URI:', videoUri);
    console.log('📝 Title:', title);
    console.log('🏀 Sport:', sport);
    console.log('✏️ Edit Metadata:', editMetadata);
    
    // Verify video file exists
    console.log('🔍 Checking if video file exists...');
    const videoInfo = await FileSystem.getInfoAsync(videoUri);
    console.log('📁 Video info:', videoInfo);
    
    if (!videoInfo.exists) {
      throw new Error('Video file not found at URI');
    }

    // Try to generate thumbnail (but don't fail if it doesn't work)
    let thumbnailUri = null;
    try {
      console.log('🖼️ Generating thumbnail...');
      thumbnailUri = await generateThumbnail(videoUri);
      console.log('✅ Thumbnail generated:', thumbnailUri);
    } catch (thumbError) {
      console.warn('⚠️ Thumbnail generation failed (continuing anyway):', thumbError);
      // Continue without thumbnail
    }
    
    // Create form data
    console.log('📦 Creating form data...');
    const formData = new FormData();
    
    // Add video file to form data
    const filename = videoUri.split('/').pop() || 'video.mov';
    console.log('📹 Adding video file:', filename);
    
    formData.append('video', {
      uri: videoUri,
      type: 'video/quicktime',
      name: filename,
    } as any);

    // Add thumbnail if generated
    if (thumbnailUri) {
      const thumbFilename = `thumb-${filename}.jpg`;
      console.log('🖼️ Adding thumbnail:', thumbFilename);
      formData.append('thumbnail', {
        uri: thumbnailUri,
        type: 'image/jpeg',
        name: thumbFilename,
      } as any);
    }

    // Add metadata
    console.log('📝 Adding metadata...');
    formData.append('title', title);
    if (venue) {
      formData.append('venue', venue);
    }
    if (sport) {
      formData.append('sport', sport);
    }
    if (editMetadata) {
      formData.append('editMetadata', JSON.stringify(editMetadata));
    }

    // Build headers with auth token
    const headers: any = {
      'Content-Type': 'multipart/form-data',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      console.log('🔐 Auth token added to headers');
    } else {
      console.warn('⚠️ No auth token provided!');
    }

    const uploadUrl = `${API_URL}/hot-takes-public`;
    console.log('🌐 Uploading to:', uploadUrl);

    // Upload to your backend with timeout
    const response = await axios.post(uploadUrl, formData, {
      headers,
      timeout: 60000, // 60 second timeout
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`📊 Upload progress: ${percentage}%`);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });

    console.log('✅ Upload successful!', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('🌐 Axios error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timed out. Please check your connection and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 413) {
        throw new Error('Video file is too large. Maximum size is 100MB.');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
    
    throw new Error('Upload failed. Please try again.');
  }
};
