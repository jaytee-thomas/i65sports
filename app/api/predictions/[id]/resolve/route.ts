import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Resolve a prediction (mark correct answer)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: predictionId } = params;
    const body = await request.json();
    const { correctOption } = body;

    // Validation
    if (typeof correctOption !== 'number') {
      return NextResponse.json(
        { error: 'Correct option index is required' },
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

    // Get prediction with Hot Take
    const prediction = await (prisma as any).predictions.findUnique({
      where: { id: predictionId },
      include: {
        HotTake: true,
      },
    });

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    // Verify user owns the Hot Take
    if (prediction.HotTake.authorId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Only the creator can resolve predictions' },
        { status: 403 }
      );
    }

    // Validate option index
    if (correctOption < 0 || correctOption >= prediction.options.length) {
      return NextResponse.json(
        { error: 'Invalid option index' },
        { status: 400 }
      );
    }

    // Check if already resolved
    if (prediction.resolvedAt) {
      return NextResponse.json(
        { error: 'Prediction already resolved' },
        { status: 400 }
      );
    }

    // Resolve the prediction
    await (prisma as any).predictions.update({
      where: { id: predictionId },
      data: {
        correctOption,
        resolvedAt: new Date(),
      },
    });

    // Award points to winners (10 points per correct prediction)
    const winners = await (prisma as any).user_predictions.findMany({
      where: {
        predictionId,
        optionIndex: correctOption,
      },
    });

    await (prisma as any).user_predictions.updateMany({
      where: {
        predictionId,
        optionIndex: correctOption,
      },
      data: {
        points: 10,
      },
    });

    return NextResponse.json({
      message: 'Prediction resolved',
      winners: winners.length,
      pointsAwarded: winners.length * 10,
    });
  } catch (error) {
    console.error('[prediction-resolve]:', error);
    return NextResponse.json(
      { error: 'Failed to resolve prediction' },
      { status: 500 }
    );
    }
}

