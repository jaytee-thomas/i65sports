import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Create a challenge
export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { takeId, title, description, type, target, reward, expiresAt } = body;

    // Validation
    if (!takeId || !title || !type || !target) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the Hot Take exists
    const hotTake = await prisma.hotTake.findUnique({
      where: { id: takeId },
    });

    if (!hotTake) {
      return NextResponse.json({ error: 'Hot Take not found' }, { status: 404 });
    }

    // Verify user owns the Hot Take
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser || hotTake.authorId !== dbUser.id) {
      return NextResponse.json(
        { error: 'You can only add challenges to your own Hot Takes' },
        { status: 403 }
      );
    }

    // Create the challenge (schema uses 'requirement' instead of 'target')
    const challenge = await (prisma as any).challenges.create({
      data: {
        takeId,
        title,
        description,
        type,
        requirement: target.toString(), // Convert to string (schema expects String)
        reward: reward || 'Badge',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error('[challenges-post]:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
