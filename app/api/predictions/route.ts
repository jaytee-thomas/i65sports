import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Create a prediction
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

    if (options.length < 2 || options.length > 6) {
      return NextResponse.json(
        { error: 'Prediction must have 2-6 options' },
        { status: 400 }
      );
    }

    if (!expiresAt) {
      return NextResponse.json(
        { error: 'Expiration time is required for predictions' },
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
        { error: 'You can only add predictions to your own Hot Takes' },
        { status: 403 }
      );
    }

    // Create the prediction
    const prediction = await (prisma as any).predictions.create({
      data: {
        takeId,
        question,
        options,
        expiresAt: new Date(expiresAt),
      },
    });

    return NextResponse.json({ prediction }, { status: 201 });
  } catch (error) {
    console.error('[predictions-post]:', error);
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    );
  }
}
