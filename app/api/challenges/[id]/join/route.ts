import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Join a challenge
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: challengeId } = params;

    // Get user
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username:
            clerkUser.username ||
            clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] ||
            'user',
        },
      });
    }

    // Get challenge
    const challenge = await (prisma as any).challenges.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Check if already joined (completed)
    const existing = await (prisma as any).challenge_completions.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: dbUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already joined', joined: true });
    }

    // Join challenge (create completion entry)
    await (prisma as any).challenge_completions.create({
      data: {
        challengeId,
        userId: dbUser.id,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Challenge joined', joined: true }, { status: 201 });
  } catch (error) {
    console.error('[challenge-join]:', error);
    return NextResponse.json(
      { error: 'Failed to join challenge' },
      { status: 500 }
    );
  }
}

