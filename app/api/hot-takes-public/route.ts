import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { VideoProcessor } from "../../../backend/services/videoProcessor";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

// Cloudflare R2 setup
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    // Get authenticated user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    console.log("📹 [hot-takes-public] Receiving upload from:", clerkUser.id);
    
    const formData = await request.formData();
    const video = formData.get("video") as File;
    const thumbnail = formData.get("thumbnail") as File | null;
    const title = formData.get("title") as string;
    const venue = formData.get("venue") as string;
    const sport = formData.get("sport") as string | null;
    const editMetadataStr = formData.get("editMetadata") as string | null;

    console.log("📝 Title:", title);
    console.log("📍 Venue:", venue);
    console.log("🎥 Video:", video?.name, video?.size, "bytes");
    console.log("🖼️ Thumbnail:", thumbnail ? thumbnail.name : "No thumbnail");
    console.log("✏️ Edit Metadata:", editMetadataStr);

    // Validation
    if (!video) {
      console.error("❌ No video provided");
      return NextResponse.json(
        { error: "No video provided" },
        { status: 400 }
      );
    }

    if (!title) {
      console.error("❌ No title provided");
      return NextResponse.json(
        { error: "No title provided" },
        { status: 400 }
      );
    }

    // Parse edit metadata if provided
    let editMetadata = null;
    if (editMetadataStr) {
      try {
        editMetadata = JSON.parse(editMetadataStr);
        console.log("✅ Parsed edit metadata:", editMetadata);
      } catch (error) {
        console.warn("⚠️ Failed to parse editMetadata, continuing without processing:", error);
      }
    }

    // Process video if editMetadata exists
    let videoBuffer: Buffer;
    let finalVideoFilename: string;
    let tempInputPath: string | null = null;
    let tempOutputPath: string | null = null;

    if (editMetadata && editMetadata.trimStart !== undefined) {
      console.log("🎬 Processing video with edits...");
      
      try {
        // Create temp directory if it doesn't exist
        const tempDir = path.join(process.cwd(), "tmp", "videos");
        await mkdir(tempDir, { recursive: true });

        // Save uploaded video to temp file
        const videoArrayBuffer = await video.arrayBuffer();
        tempInputPath = path.join(tempDir, `input-${Date.now()}-${video.name}`);
        fs.writeFileSync(tempInputPath, Buffer.from(videoArrayBuffer));
        console.log("💾 Saved input video to:", tempInputPath);

        // Process video
        const processingResult = await VideoProcessor.processVideo(
          tempInputPath,
          {
            trimStart: editMetadata.trimStart || 0,
            trimEnd: editMetadata.trimEnd || 0,
            playbackSpeed: editMetadata.playbackSpeed || 1.0,
            filter: editMetadata.filter || "none",
            textOverlays: editMetadata.textOverlays || [],
          },
          tempDir
        );

        tempOutputPath = processingResult.outputPath;
        console.log("✅ Video processed:", processingResult);

        // Read processed video
        videoBuffer = fs.readFileSync(tempOutputPath);
        finalVideoFilename = `hot-takes/${Date.now()}-processed-${path.basename(tempOutputPath)}`;
      } catch (processingError) {
        console.error("❌ Video processing failed:", processingError);
        // Fall back to original video
        const videoArrayBuffer = await video.arrayBuffer();
        videoBuffer = Buffer.from(videoArrayBuffer);
        finalVideoFilename = `hot-takes/${Date.now()}-${video.name}`;
        console.log("⚠️ Using original video due to processing error");
      }
    } else {
      // No processing needed, use original video
      console.log("📤 Uploading original video to R2...");
      const videoArrayBuffer = await video.arrayBuffer();
      videoBuffer = Buffer.from(videoArrayBuffer);
      finalVideoFilename = `hot-takes/${Date.now()}-${video.name}`;
    }

    // Upload video to R2
    const videoUploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: finalVideoFilename,
      Body: videoBuffer,
      ContentType: video.type || "video/mp4",
    });
    await s3Client.send(videoUploadCommand);
    const videoUrl = `${process.env.R2_PUBLIC_URL}/${finalVideoFilename}`;
    console.log("✅ Video uploaded to R2:", videoUrl);

    // Clean up temporary files
    if (tempInputPath) {
      try {
        await VideoProcessor.cleanup(tempInputPath);
      } catch (error) {
        console.warn("⚠️ Failed to cleanup input file:", error);
      }
    }
    if (tempOutputPath) {
      try {
        await VideoProcessor.cleanup(tempOutputPath);
      } catch (error) {
        console.warn("⚠️ Failed to cleanup output file:", error);
      }
    }

    // Upload thumbnail if provided
    let thumbUrl = null;
    if (thumbnail) {
      console.log("📤 Uploading thumbnail to R2...");
      const thumbArrayBuffer = await thumbnail.arrayBuffer();
      const thumbBuffer = Buffer.from(thumbArrayBuffer);
      const thumbFilename = `thumbnails/${Date.now()}-${thumbnail.name}`;
      const thumbUploadCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: thumbFilename,
        Body: thumbBuffer,
        ContentType: thumbnail.type || "image/jpeg",
      });
      await s3Client.send(thumbUploadCommand);
      thumbUrl = `${process.env.R2_PUBLIC_URL}/${thumbFilename}`;
      console.log("✅ Thumbnail uploaded to R2:", thumbUrl);
    }

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      // Create user if doesn't exist (shouldn't happen with webhook, but just in case)
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0].emailAddress,
          username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress.split('@')[0],
          role: 'USER',
        },
      });
      console.log("✅ Created user in database:", dbUser.id);
    }

    console.log("💾 Saving to database...");

    // Save to database with authenticated user
    const hotTake = await prisma.hotTake.create({
      data: {
        title,
        videoUrl,
        thumbUrl: thumbUrl,
        venueName: venue || "Unknown Venue",
        sport: sport || null,
        authorId: dbUser.id, // Use the real user's ID!
        // Video has been processed with editMetadata if provided
      },
    });

    console.log("✅ Hot Take saved:", hotTake.id, "by user:", dbUser.username);

    return NextResponse.json({
      success: true,
      hotTake: {
        id: hotTake.id,
        title: hotTake.title,
        videoUrl: hotTake.videoUrl,
        thumbUrl: hotTake.thumbUrl,
        venueName: hotTake.venueName,
      },
      message: "Hot Take uploaded successfully! 🔥",
    });
  } catch (error) {
    console.error("❌ [hot-takes-public] Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "Hot Takes Public API is working!" 
  });
}
