import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get question with answers
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const question = await (prisma as any).questions.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Check if current user has answered
    let userAnswer = null;
    const clerkUser = await currentUser();
    if (clerkUser) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      });
      if (dbUser) {
        userAnswer = question.answers.find((a: any) => a.userId === dbUser.id) || null;
      }
    }

    // Format response
    const response = {
      question: {
        id: question.id,
        text: question.text,
        createdAt: question.createdAt,
        totalAnswers: question.answers.length,
        answers: question.answers,
        userAnswer,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[question-get]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

