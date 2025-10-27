const { PrismaClient, Role, TakeKind, TakeStatus, ReplyKind, ReelStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Start from a clean slate so the seed is idempotent during dev
  await prisma.$transaction([
    prisma.reaction.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.reply.deleteMany(),
    prisma.hotTake.deleteMany(),
    prisma.fanReel.deleteMany(),
    prisma.game.deleteMany(),
    prisma.article.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const columnist = await prisma.user.create({
    data: {
      email: 'columnist@example.com',
      username: 'sideline_scribe',
      clerkId: 'clerk_columnist',
      role: Role.COLUMNIST,
    },
  });

  const fan = await prisma.user.create({
    data: {
      email: 'fan@example.com',
      username: 'reel_deal',
      clerkId: 'clerk_fan',
      role: Role.USER,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: fan.id,
      followeeId: columnist.id,
    },
  });

  const article = await prisma.article.create({
    data: {
      columnistId: columnist.id,
      title: 'Game-Day Mindset: How Underdogs Upset Favorites',
      slug: 'game-day-mindset-underdogs',
      body: {
        blocks: [
          { type: 'heading', text: 'Mind over matter' },
          { type: 'paragraph', text: 'Preparation and composure flip the script on game day.' },
        ],
      },
      tags: ['analysis', 'mindset'],
    },
  });

  const game = await prisma.game.create({
    data: {
      league: 'NFL',
      homeTeam: 'Indianapolis Colts',
      awayTeam: 'Chicago Bears',
      venue: 'Lucas Oil Stadium',
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
      seasonKey: '2025-preseason',
    },
  });

  const hotTake = await prisma.hotTake.create({
    data: {
      authorId: columnist.id,
      kind: TakeKind.TEXT,
      title: 'The AFC Runs Through Indy',
      textBody: 'If the Colts keep their offensive rhythm, the AFC crown is theirs to lose.',
      tags: ['colts', 'afc', 'bold'],
      status: TakeStatus.PUBLISHED,
    },
  });

  const reply = await prisma.reply.create({
    data: {
      takeId: hotTake.id,
      authorId: fan.id,
      kind: ReplyKind.TEXT,
      textBody: 'Love the optimism, but that defense needs to tighten up first!',
    },
  });

  const fanReel = await prisma.fanReel.create({
    data: {
      authorId: fan.id,
      gameId: game.id,
      title: 'Tunnel Walk Hype',
      videoUrl: 'https://example.com/reels/colts-tunnel.mp4',
      thumbUrl: 'https://example.com/reels/colts-tunnel-thumb.jpg',
      duration: 42,
      width: 1920,
      height: 1080,
      gpsLat: 39.7601,
      gpsLng: -86.1639,
      shotAt: new Date(),
      tags: ['colts', 'fan-cam'],
      status: ReelStatus.PUBLISHED,
    },
  });

  await prisma.reaction.createMany({
    data: [
      {
        takeId: hotTake.id,
        userId: fan.id,
        emoji: '🔥',
      },
      {
        fanReelId: fanReel.id,
        userId: columnist.id,
        emoji: '👏',
      },
    ],
  });

  await prisma.comment.createMany({
    data: [
      {
        authorId: fan.id,
        articleId: article.id,
        body: 'This is the kind of insight that keeps me reading every week.',
      },
      {
        authorId: columnist.id,
        takeId: hotTake.id,
        body: 'Appreciate the feedback—defense is on my radar for next week.',
      },
      {
        authorId: fan.id,
        fanReelId: fanReel.id,
        body: 'Caught this in person—crowd was electric!',
      },
    ],
  });

  console.log('Seed data inserted successfully.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
