import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Create a question
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { takeId, text } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Question text required' },
        { status: 400 }
      );
    }

    // Verify user owns the Hot Take
    const hotTake = await prisma.hotTake.findFirst({
      where: {
        id: takeId,
        authorId: dbUser.id,
      },
    });

    if (!hotTake) {
      return NextResponse.json(
        { error: 'Hot Take not found or unauthorized' },
        { status: 404 }
      );
    }

    const question = await (prisma as any).questions.create({
      data: {
        takeId,
        text,
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}

