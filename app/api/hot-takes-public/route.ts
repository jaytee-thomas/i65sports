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
    const title = formData.get("title") as string;
    const venue = formData.get("venue") as string;

    console.log("📝 Title:", title);
    console.log("📍 Venue:", venue);
    console.log("🎥 Video:", video?.name, video?.size, "bytes");

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

    console.log("📤 Uploading to R2...");

    // Convert file to buffer
    const arrayBuffer = await video.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const filename = `hot-takes/${Date.now()}-${video.name}`;

    // Upload to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: video.type || "video/quicktime",
    });

    await s3Client.send(uploadCommand);

    const videoUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
    console.log("✅ Video uploaded to R2:", videoUrl);

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

    // Save to database
    const hotTake = await prisma.hotTake.create({
      data: {
        title,
        videoUrl,
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
        venue: hotTake.venue,
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
