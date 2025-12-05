import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Update challenge progress (called by system, not user)
// Note: The schema only tracks completions, not progress. This endpoint
// will mark the challenge as completed when progress >= target
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: challengeId } = params;
    const body = await request.json();
    const { progress } = body;

    if (typeof progress !== 'number') {
      return NextResponse.json(
        { error: 'Progress value is required' },
        { status: 400 }
      );
    }

    // Get user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get challenge
    const challenge = await (prisma as any).challenges.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Parse target from requirement (assuming it's a number string like "100")
    const target = parseInt(challenge.requirement) || 0;

    // Check if completed
    const completed = progress >= target;

    // Check if participation exists
    const participation = await (prisma as any).challenge_completions.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: dbUser.id,
        },
      },
    });

    if (!participation) {
      // Create completion entry if progress meets target
      if (completed) {
        await (prisma as any).challenge_completions.create({
          data: {
            challengeId,
            userId: dbUser.id,
            completedAt: new Date(),
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Not participating in challenge. Join first or reach target.' },
          { status: 404 }
        );
      }
    } else if (completed && !participation.completedAt) {
      // Update completion time if just completed
      await (prisma as any).challenge_completions.update({
        where: { id: participation.id },
        data: {
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      progress,
      completed,
      target,
    });
  } catch (error) {
    console.error('[challenge-progress]:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

