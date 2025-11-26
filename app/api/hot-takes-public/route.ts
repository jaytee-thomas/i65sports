import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
    console.log("📹 [hot-takes-public] Receiving upload...");
    
    const formData = await request.formData();
    const video = formData.get("video") as File;
    const thumbnail = formData.get("thumbnail") as File | null;
    const title = formData.get("title") as string;
    const venue = formData.get("venue") as string;

    console.log("📝 Title:", title);
    console.log("📍 Venue:", venue);
    console.log("🎥 Video:", video?.name, video?.size, "bytes");
    console.log("🖼️ Thumbnail:", thumbnail ? thumbnail.name : "No thumbnail");

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

    console.log("📤 Uploading video to R2...");

    // Upload video
    const videoArrayBuffer = await video.arrayBuffer();
    const videoBuffer = Buffer.from(videoArrayBuffer);
    const videoFilename = `hot-takes/${Date.now()}-${video.name}`;
    const videoUploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: videoFilename,
      Body: videoBuffer,
      ContentType: video.type || "video/quicktime",
    });
    await s3Client.send(videoUploadCommand);
    const videoUrl = `${process.env.R2_PUBLIC_URL}/${videoFilename}`;
    console.log("✅ Video uploaded to R2:", videoUrl);

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

    // Create or find test user
    let testUser = await prisma.user.findFirst({
      where: { email: "test@i65sports.com" },
    });

    if (!testUser) {
      console.log("Creating test user...");
      testUser = await prisma.user.create({
        data: {
          clerkId: "test-user-id",
          email: "test@i65sports.com",
          username: "testuser",
          role: "USER",
        },
      });
    }

    console.log("💾 Saving to database...");

    // Save to database with thumbnail
    const hotTake = await prisma.hotTake.create({
      data: {
        title,
        videoUrl,
        thumbUrl: thumbUrl,
        venueName: venue || "Unknown Venue",
        authorId: testUser.id,
      },
    });

    console.log("✅ Hot Take saved:", hotTake.id);

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
