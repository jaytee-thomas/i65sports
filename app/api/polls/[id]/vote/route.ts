import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Vote on a poll
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: pollId } = params;
    const body = await request.json();
    const { optionIndex } = body;

    // Validation
    if (typeof optionIndex !== 'number') {
      return NextResponse.json(
        { error: 'Option index is required' },
        { status: 400 }
      );
    }

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

    // Get poll
    const poll = await (prisma as any).polls.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return NextResponse.json(
        { error: 'Invalid option index' },
        { status: 400 }
      );
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Poll has expired' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await (prisma as any).poll_votes.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId: dbUser.id,
        },
      },
    });

    if (existingVote) {
      // Update their vote
      await (prisma as any).poll_votes.update({
        where: { id: existingVote.id },
        data: { optionIndex },
      });
      return NextResponse.json({ message: 'Vote updated', voted: true });
    } else {
      // Create new vote
      await (prisma as any).poll_votes.create({
        data: {
          id: `pv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          pollId,
          userId: dbUser.id,
          optionIndex,
        },
      });
      return NextResponse.json({ message: 'Vote recorded', voted: true }, { status: 201 });
    }
  } catch (error) {
    console.error('[poll-vote]:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
