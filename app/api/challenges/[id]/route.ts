import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get challenge with progress
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const challenge = await (prisma as any).challenges.findUnique({
      where: { id },
      include: {
        completions: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      } as any,
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Check if user has joined/completed
    let userProgress = null;
    const clerkUser = await currentUser();
    if (clerkUser) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      });
      if (dbUser) {
        const completion = (challenge as any).completions?.find(
          (c: any) => c.userId === dbUser.id
        );
        userProgress = completion
          ? {
              completed: true,
              completedAt: completion.completedAt,
            }
          : null;
      }
    }

    // Calculate stats
    const totalParticipants = (challenge as any).completions?.length || 0;
    const completedCount = totalParticipants; // All completions are completed

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        target: challenge.requirement, // Map requirement back to target
        reward: challenge.reward,
        expiresAt: challenge.expiresAt,
        createdAt: challenge.createdAt,
        totalParticipants,
        completedCount,
        userProgress,
      },
    });
  } catch (error) {
    console.error('[challenge-get]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}

