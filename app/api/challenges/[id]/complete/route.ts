import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: challengeId } = params;

    // Check if already completed
    const existing = await (prisma as any).challenge_completions.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: dbUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Challenge already completed' },
        { status: 400 }
      );
    }

    const completion = await (prisma as any).challenge_completions.create({
      data: {
        challengeId,
        userId: dbUser.id,
      },
      include: {
        Challenge: true,
      },
    });

    return NextResponse.json({ completion });
  } catch (error) {
    console.error('Error completing challenge:', error);
    return NextResponse.json(
      { error: 'Failed to complete challenge' },
      { status: 500 }
    );
  }
}

