import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all published Hot Takes
    const hotTakes = await prisma.hotTake.findMany({
      where: { status: 'PUBLISHED' },
      select: { tags: true },
    });

    // Count hashtag frequency
    const hashtagCounts: { [key: string]: number } = {};
    
    hotTakes.forEach(take => {
      take.tags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const trending = Object.entries(hashtagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return NextResponse.json({ hashtags: trending });
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    return NextResponse.json({ error: 'Failed to fetch trending hashtags' }, { status: 500 });
  }
}

