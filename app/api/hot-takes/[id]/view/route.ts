import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: takeId } = params;

    console.log('📊 View tracking request for takeId:', takeId);

    // Verify Hot Take exists
    const hotTake = await prisma.hotTake.findUnique({
      where: { id: takeId },
    });

    if (!hotTake) {
      console.error('❌ Hot Take not found:', takeId);
      return NextResponse.json(
        { error: 'Hot Take not found' },
        { status: 404 }
      );
    }

    // Try to get authenticated user (optional)
    let dbUserId: string | null = null;
    try {
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const dbUser = await prisma.user.findUnique({
          where: { clerkId },
          select: { id: true },
        });
        dbUserId = dbUser?.id || null;
      }
    } catch (authError) {
      // Anonymous view - that's fine
      console.log('📊 Anonymous view');
    }

    console.log('📊 Creating view record, userId:', dbUserId || 'anonymous');

    // Create view record with generated ID
    await (prisma as any).views.create({
      data: {
        id: randomUUID(),
        takeId,
        userId: dbUserId,
      },
    });

    console.log('✅ View record created');

    // Update or create daily analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    console.log('📊 Updating daily analytics for date:', today);

    await (prisma as any).daily_analytics.upsert({
      where: {
        takeId_date: {
          takeId,
          date: today,
        },
      },
      create: {
        id: randomUUID(),
        takeId,
        date: today,
        views: 1,
        likes: 0,
        comments: 0,
        shares: 0,
      },
      update: {
        views: {
          increment: 1,
        },
      },
    });

    console.log('✅ Daily analytics updated');

    return NextResponse.json({
      success: true,
      message: 'View tracked',
    });
  } catch (error) {
    console.error('❌ Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

