import { NextResponse } from 'next/server';

import { currentUser } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';



// Get poll with results

export async function GET(

  request: Request,

  { params }: { params: { id: string } }

) {

  try {

    const { id } = params;



    const poll = await prisma.polls.findUnique({

      where: { id },

      include: {

        votes: {  // ✅ Changed from poll_votes to votes

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



    if (!poll) {

      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });

    }



    // Calculate vote counts for each option

    const voteCounts = poll.options.map((option, index) => {

      const count = poll.votes.filter((v) => v.optionIndex === index).length;

      return count;

    });



    const totalVotes = voteCounts.reduce((sum, count) => sum + count, 0);



    // Calculate percentages

    const results = poll.options.map((option, index) => ({

      option,

      votes: voteCounts[index],

      percentage: totalVotes > 0 ? Math.round((voteCounts[index] / totalVotes) * 100) : 0,

    }));



    // Check if user has voted

    let userVote = null;

    const clerkUser = await currentUser();

    if (clerkUser) {

      const dbUser = await prisma.user.findUnique({

        where: { clerkId: clerkUser.id },

      });

      if (dbUser) {

        const vote = poll.votes.find((v) => v.userId === dbUser.id);

        userVote = vote ? vote.optionIndex : null;

      }

    }



    return NextResponse.json({

      poll: {

        id: poll.id,

        question: poll.question,

        options: poll.options,

        expiresAt: poll.expiresAt,

        createdAt: poll.createdAt,

        totalVotes,

        results,

        userVote,

      },

    });

  } catch (error) {

    console.error('[poll-get]:', error);

    return NextResponse.json(

      { error: 'Failed to fetch poll' },

      { status: 500 }

    );

  }

}
