import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Submit a prediction
export async function POST(
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

    // Get prediction
    const prediction = await (prisma as any).predictions.findUnique({
      where: { id: predictionId },
    });

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= prediction.options.length) {
      return NextResponse.json(
        { error: 'Invalid option index' },
        { status: 400 }
      );
    }

    // Check if prediction has expired
    if (new Date(prediction.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Prediction has expired' },
        { status: 400 }
      );
    }

    // Check if user already predicted
    const existingPrediction = await (prisma as any).user_predictions.findFirst({
      where: {
        predictionId,
        userId: dbUser.id,
      },
    });

    if (existingPrediction) {
      // Update their prediction
      await (prisma as any).user_predictions.update({
        where: { id: existingPrediction.id },
        data: { optionIndex },
      });
      return NextResponse.json({ message: 'Prediction updated', predicted: true });
    } else {
      // Create new prediction
      await (prisma as any).user_predictions.create({
        data: {
          predictionId,
          userId: dbUser.id,
          optionIndex,
        },
      });
      return NextResponse.json({ message: 'Prediction recorded', predicted: true }, { status: 201 });
    }
  } catch (error) {
    console.error('[prediction-predict]:', error);
    return NextResponse.json(
      { error: 'Failed to record prediction' },
      { status: 500 }
    );
  }
}
