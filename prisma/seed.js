const { PrismaClient, Role, TakeKind, TakeStatus, ReplyKind, ReelStatus, RecordingStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Start from a clean slate so the seed is idempotent during dev
  await prisma.$transaction([
    prisma.reaction.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.reply.deleteMany(),
    prisma.recordingDraft.deleteMany(),
    prisma.hotTake.deleteMany(),
    prisma.fanReel.deleteMany(),
    prisma.game.deleteMany(),
    prisma.article.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const [columnist, analyst] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'columnist@example.com',
        username: 'sideline_scribe',
        clerkId: 'clerk_columnist',
        role: Role.COLUMNIST,
      },
    }),
    prisma.user.create({
      data: {
        email: 'analyst@example.com',
        username: 'press_box_pro',
        clerkId: 'clerk_analyst',
        role: Role.COLUMNIST,
      },
    }),
  ]);

  const [fan, superFan] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'fan@example.com',
        username: 'reel_deal',
        clerkId: 'clerk_fan',
        role: Role.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'superfan@example.com',
        username: 'bleacher_beat',
        clerkId: 'clerk_superfan',
        role: Role.USER,
      },
    }),
  ]);

  await prisma.follow.createMany({
    data: [
      { followerId: fan.id, followeeId: columnist.id },
      { followerId: fan.id, followeeId: analyst.id },
      { followerId: superFan.id, followeeId: columnist.id },
    ],
  });

  const articles = await Promise.all([
    prisma.article.create({
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
    }),
    prisma.article.create({
      data: {
        columnistId: analyst.id,
        title: 'Film Room Focus: Defending the Two-Minute Drill',
        slug: 'film-room-two-minute-drill',
        body: {
          blocks: [
            { type: 'paragraph', text: 'Clock management and disguise are the keys to surviving late-game chaos.' },
          ],
        },
        tags: ['strategy', 'defense'],
      },
    }),
  ]);

  const games = await Promise.all([
    prisma.game.create({
      data: {
        league: 'NFL',
        homeTeam: 'Indianapolis Colts',
        awayTeam: 'Chicago Bears',
        venue: 'Lucas Oil Stadium',
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
        seasonKey: '2025-preseason',
      },
    }),
    prisma.game.create({
      data: {
        league: 'NBA',
        homeTeam: 'Indiana Pacers',
        awayTeam: 'Boston Celtics',
        venue: 'Gainbridge Fieldhouse',
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 48),
        seasonKey: '2025-regular',
      },
    }),
  ]);

  const hotTakePayload = [
    {
      authorId: columnist.id,
      kind: TakeKind.TEXT,
      title: 'The AFC Runs Through Indy',
      textBody: 'If the Colts keep their offensive rhythm, the AFC crown is theirs to lose.',
      tags: ['colts', 'afc', 'bold'],
    },
    {
      authorId: analyst.id,
      kind: TakeKind.TEXT,
      title: 'Celtics Will Blitz the Pacers from Deep',
      textBody: 'Boston’s bench units are raining threes. Indiana must tighten perimeter closeouts or brace for a shootout.',
      tags: ['nba', 'pacers', 'celtics'],
    },
    {
      authorId: columnist.id,
      kind: TakeKind.TEXT,
      title: 'Jonathan Taylor: MVP Dark Horse',
      textBody: 'If Indy leans heavy on Taylor’s touches, he sneaks into MVP chatter by December.',
      tags: ['mvp', 'colts', 'taylor'],
    },
  ];

  const hotTakes = await Promise.all(
    hotTakePayload.map((take) =>
      prisma.hotTake.create({
        data: {
          ...take,
          status: TakeStatus.PUBLISHED,
        },
      }),
    ),
  );

  await prisma.reply.createMany({
    data: [
      {
        takeId: hotTakes[0].id,
        authorId: fan.id,
        kind: ReplyKind.TEXT,
        textBody: 'Love the optimism, but that defense needs to tighten up first!',
      },
      {
        takeId: hotTakes[0].id,
        authorId: superFan.id,
        kind: ReplyKind.TEXT,
        textBody: 'Taylor plus Pittman will keep defenses honest. Book it.',
      },
      {
        takeId: hotTakes[1].id,
        authorId: fan.id,
        kind: ReplyKind.TEXT,
        textBody: 'Pacers need to push tempo to wear down those Celtics legs.',
      },
    ],
  });

  const reels = await Promise.all([
    prisma.fanReel.create({
      data: {
        authorId: fan.id,
        gameId: games[0].id,
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
    }),
    prisma.fanReel.create({
      data: {
        authorId: superFan.id,
        gameId: games[1].id,
        title: 'Halftime Fanfare',
        videoUrl: 'https://example.com/reels/pacers-halftime.mp4',
        thumbUrl: 'https://example.com/reels/pacers-halftime-thumb.jpg',
        duration: 35,
        width: 1080,
        height: 1920,
        tags: ['pacers', 'halftime'],
        status: ReelStatus.PUBLISHED,
      },
    }),
  ]);

  await prisma.reaction.createMany({
    data: [
      {
        takeId: hotTakes[0].id,
        userId: fan.id,
        emoji: '🔥',
      },
      {
        takeId: hotTakes[1].id,
        userId: superFan.id,
        emoji: '👀',
      },
      {
        fanReelId: reels[0].id,
        userId: columnist.id,
        emoji: '👏',
      },
      {
        fanReelId: reels[1].id,
        userId: analyst.id,
        emoji: '🎉',
      },
    ],
  });

  await prisma.comment.createMany({
    data: [
      {
        authorId: fan.id,
        articleId: articles[0].id,
        body: 'This is the kind of insight that keeps me reading every week.',
      },
      {
        authorId: columnist.id,
        takeId: hotTakes[0].id,
        body: 'Appreciate the feedback—defense is on my radar for next week.',
      },
      {
        authorId: superFan.id,
        fanReelId: reels[0].id,
        body: 'Caught this in person—crowd was electric!',
      },
      {
        authorId: fan.id,
        articleId: articles[1].id,
        body: 'Great breakdown. Need a podcast episode on this.',
      },
    ],
  });

  await prisma.recordingDraft.createMany({
    data: [
      {
        userId: fan.id,
        duration: 58,
        sizeBytes: 24_000_000,
        mimeType: 'video/webm',
        status: RecordingStatus.SUBMITTED,
        notes: 'Awaiting moderator review.',
      },
      {
        userId: superFan.id,
        duration: 42,
        sizeBytes: 18_500_000,
        mimeType: 'video/webm',
        status: RecordingStatus.DRAFT,
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
