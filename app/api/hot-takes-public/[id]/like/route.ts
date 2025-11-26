import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await request.json();
    const hotTakeId = params.id;

    // Check if already liked
    const existingLike = await prisma.reaction.findFirst({
      where: {
        takeId: hotTakeId,
        userId: userId,
        emoji: "LIKE", // Changed from type to emoji
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.reaction.delete({
        where: {
          id: existingLike.id,
        },
      });

      return NextResponse.json({
        success: true,
        liked: false,
        message: "Unliked",
      });
    } else {
      // Like
      await prisma.reaction.create({
        data: {
          takeId: hotTakeId,
          userId: userId,
          emoji: "LIKE", // Changed from type to emoji
        },
      });

      return NextResponse.json({
        success: true,
        liked: true,
        message: "Liked",
      });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Failed to like/unlike" },
      { status: 500 }
    );
  }
}

// Get like count and status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const hotTakeId = params.id;

    const likeCount = await prisma.reaction.count({
      where: {
        takeId: hotTakeId,
        emoji: "LIKE", // Changed from type to emoji
      },
    });

    let isLiked = false;
    if (userId) {
      const userLike = await prisma.reaction.findFirst({
        where: {
          takeId: hotTakeId,
          userId: userId,
          emoji: "LIKE", // Changed from type to emoji
        },
      });
      isLiked = !!userLike;
    }

    return NextResponse.json({
      likeCount,
      isLiked,
    });
  } catch (error) {
    console.error("Get likes error:", error);
    return NextResponse.json(
      { error: "Failed to get likes" },
      { status: 500 }
    );
  }
}

