import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get prediction with all entries and results
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const prediction = await (prisma as any).predictions.findUnique({
      where: { id },
      include: {
        predictions: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    const now = new Date();
    const isLocked = new Date(prediction.expiresAt) < now;
    const isResolved = !!prediction.resolvedAt;

    // Calculate predictions for each option
    const predictionCounts = prediction.options.map((option: string, index: number) => {
      const count = prediction.predictions.filter((p: any) => p.optionIndex === index).length;
      return count;
    });

    const totalPredictions = predictionCounts.reduce((sum: number, count: number) => sum + count, 0);

    // Calculate percentages
    const results = prediction.options.map((option: string, index: number) => ({
      option,
      predictions: predictionCounts[index],
      percentage: totalPredictions > 0 ? Math.round((predictionCounts[index] / totalPredictions) * 100) : 0,
      isCorrect: isResolved && prediction.correctOption === index,
    }));

    // Check if user has predicted
    let userPrediction = null;
    let userWon = false;
    const clerkUser = await currentUser();
    if (clerkUser) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      });
      if (dbUser) {
        const entry = prediction.predictions.find((p: any) => p.userId === dbUser.id);
        if (entry) {
          userPrediction = entry.optionIndex;
          userWon = isResolved && entry.optionIndex === prediction.correctOption;
        }
      }
    }

    return NextResponse.json({
      prediction: {
        id: prediction.id,
        question: prediction.question,
        options: prediction.options,
        expiresAt: prediction.expiresAt,
        resolvedAt: prediction.resolvedAt,
        correctOption: prediction.correctOption,
        createdAt: prediction.createdAt,
        totalPredictions,
        results,
        userPrediction,
        userWon,
        isLocked,
        isResolved,
      },
    });
  } catch (error) {
    console.error('[prediction-get]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prediction' },
      { status: 500 }
    );
  }
}
