import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { getOrCreateUserForClerkId } from "@/lib/user-from-clerk";

export async function POST(request: Request) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const video = formData.get("video") as File;
    const duration = parseInt(formData.get("duration") as string);
    const recordedAtVenue = formData.get("recordedAtVenue") === "true";
    
    if (!video) {
      return NextResponse.json({ error: "No video file" }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2
    const videoUrl = await uploadToR2(
      buffer,
      video.name,
      video.type || "video/webm"
    );

    // Get or create user from database
    const user = await getOrCreateUserForClerkId(userId);

    // Create HotTake in database
    const hotTake = await prisma.hotTake.create({
      data: {
        authorId: user.id,
        kind: "VIDEO",
        videoUrl,
        duration,
        status: "PUBLISHED",
        recordedAtVenue,
        venueName: recordedAtVenue ? (formData.get("venueName") as string) : null,
        venueLat: recordedAtVenue ? parseFloat(formData.get("venueLat") as string) : null,
        venueLng: recordedAtVenue ? parseFloat(formData.get("venueLng") as string) : null,
        gameId: recordedAtVenue ? (formData.get("gameId") as string || null) : null,
        shotAt: recordedAtVenue ? new Date() : null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      id: hotTake.id,
      videoUrl 
    });
    
  } catch (error) {
    console.error("[upload] Error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

