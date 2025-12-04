import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const unlink = promisify(fs.unlink);

// Lazy load FFmpeg to avoid webpack bundling issues
let ffmpegInstance: any = null;
let ffmpegPathConfigured = false;

async function getFfmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  
  // Dynamic import only on server-side
  if (typeof window === 'undefined') {
    const ffmpeg = require('fluent-ffmpeg');
    
    // Configure FFmpeg path if available
    if (!ffmpegPathConfigured) {
      try {
        const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
        if (ffmpegInstaller && ffmpegInstaller.path) {
          ffmpeg.setFfmpegPath(ffmpegInstaller.path);
          console.log('✅ FFmpeg path configured:', ffmpegInstaller.path);
          ffmpegPathConfigured = true;
        }
      } catch (error) {
        console.warn('⚠️ Could not configure FFmpeg path automatically:', error);
      }
    }
    
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  }
  
  throw new Error('FFmpeg can only be used server-side');
}

interface EditMetadata {
  trimStart: number;
  trimEnd: number;
  playbackSpeed: number;
  filter: string;
  textOverlays: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
  }>;
}

interface ProcessingResult {
  outputPath: string;
  duration: number;
  size: number;
}

export class VideoProcessor {
  /**
   * Process a video with editing metadata
   */
  static async processVideo(
    inputPath: string,
    editMetadata: EditMetadata,
    outputDir: string
  ): Promise<ProcessingResult> {
    // Get FFmpeg instance (lazy loaded)
    const ffmpeg = await getFfmpeg();
    
    console.log('🎬 Starting video processing...');
    console.log('📹 Input:', inputPath);
    console.log('✏️ Edits:', editMetadata);

    // Generate output filename
    const timestamp = Date.now();
    const outputFilename = `processed-${timestamp}.mp4`;
    const outputPath = path.join(outputDir, outputFilename);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // 1. TRIM VIDEO
      if (editMetadata.trimStart > 0 || editMetadata.trimEnd > 0) {
        const duration = editMetadata.trimEnd - editMetadata.trimStart;
        console.log(`✂️ Trimming: ${editMetadata.trimStart}s to ${editMetadata.trimEnd}s (duration: ${duration}s)`);
        
        command = command
          .setStartTime(editMetadata.trimStart)
          .setDuration(duration);
      }

      // 2. BUILD FILTER CHAIN
      const filters: string[] = [];

      // Speed adjustment
      if (editMetadata.playbackSpeed !== 1.0) {
        console.log(`⚡ Speed: ${editMetadata.playbackSpeed}x`);
        const speed = editMetadata.playbackSpeed;
        // Speed up/slow down video and audio
        filters.push(`setpts=${1/speed}*PTS`);
        command = command.audioFilters(`atempo=${speed}`);
      }

      // Color filters
      if (editMetadata.filter && editMetadata.filter !== 'none') {
        console.log(`🎨 Filter: ${editMetadata.filter}`);
        const filterEffect = this.getFilterEffect(editMetadata.filter);
        if (filterEffect) {
          filters.push(filterEffect);
        }
      }

      // Add text overlays if present
      let textFilter = '';
      if (editMetadata.textOverlays && editMetadata.textOverlays.length > 0) {
        console.log(`📝 Adding ${editMetadata.textOverlays.length} text overlay(s)`);
        
        textFilter = editMetadata.textOverlays
          .map((overlay) => {
            // Use actual video dimensions (portrait: 1080x1920)
            const videoWidth = 1080;
            const videoHeight = 1920;
            
            // Calculate position based on actual dimensions
            const x = Math.round((overlay.x / 100) * videoWidth);
            const y = Math.round((overlay.y / 100) * videoHeight);
            
            // Much larger font size for mobile viewing (increased from 32 to 80)
            const fontSize = Math.max(80, overlay.fontSize * 2.5);
            
            // Convert hex color to 0x format for FFmpeg
            const color = overlay.color.replace('#', '0x');
            
            return `drawtext=text='${overlay.text.replace(/'/g, "\\'")}':fontsize=${fontSize}:fontcolor=${color}:x=${x}:y=${y}:fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:shadowcolor=black@0.8:shadowx=3:shadowy=3`;
          })
          .join(',');
      }
      
      // Add text filter to filters array if present
      if (textFilter) {
        filters.push(textFilter);
      }

      // Apply all video filters
      if (filters.length > 0) {
        command = command.videoFilters(filters.join(','));
      }

      // Output settings
      command
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset fast',
          '-crf 23',
          '-movflags +faststart', // Enable streaming
        ])
        .on('start', (commandLine) => {
          console.log('🚀 FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`📊 Processing: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log('✅ Video processing complete!');
          
          // Get output file stats
          const stats = fs.statSync(outputPath);
          
          resolve({
            outputPath,
            duration: editMetadata.trimEnd - editMetadata.trimStart,
            size: stats.size,
          });
        })
        .on('error', (err, stdout, stderr) => {
          console.error('❌ FFmpeg error:', err.message);
          console.error('FFmpeg stderr:', stderr);
          reject(new Error(`Video processing failed: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * Get FFmpeg filter string for color filters
   */
  private static getFilterEffect(filterName: string): string | null {
    const filters: Record<string, string> = {
      'bw': 'hue=s=0', // Black & white (remove saturation)
      'vintage': 'curves=vintage,colorbalance=rs=.3:gs=-.1:bs=-.3', // Sepia/vintage
      'vibrant': 'eq=saturation=1.5:contrast=1.1', // Boost saturation
      'cool': 'colorbalance=bs=.3:gs=.1', // Blue tint
      'warm': 'colorbalance=rs=.3:gs=.1', // Orange tint
    };

    return filters[filterName] || null;
  }

  /**
   * Clean up temporary files
   */
  static async cleanup(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
        console.log('🗑️ Cleaned up:', filePath);
      }
    } catch (error) {
      console.error('⚠️ Cleanup error:', error);
    }
  }
}

