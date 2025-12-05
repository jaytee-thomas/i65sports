import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Create a poll
export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { takeId, question, options, expiresAt } = body;

    // Validation
    if (!takeId || !question || !options || !Array.isArray(options)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (options.length < 2 || options.length > 4) {
      return NextResponse.json(
        { error: 'Poll must have 2-4 options' },
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
        { error: 'You can only add polls to your own Hot Takes' },
        { status: 403 }
      );
    }

    // Create the poll
    const poll = await (prisma as any).polls.create({
      data: {
        id: `poll_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        takeId,
        question,
        options,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ poll }, { status: 201 });
  } catch (error) {
    console.error('[polls-post]:', error);
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}
