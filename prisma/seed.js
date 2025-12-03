const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.hotTake.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      clerkId: 'user_test123',
      email: 'test@i65sports.com',
      username: 'sportsking',
      bio: '🏀 NBA fanatic | 🏈 Hot Takes creator',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      clerkId: 'user_test456',
      email: 'fan@i65sports.com',
      username: 'sportsfan',
      bio: '⚾ Baseball lover | 🎯 Always right',
    },
  });

  // Create Hot Takes with STATUS field
  const hotTake1 = await prisma.hotTake.create({
    data: {
      title: 'LeBron is the GOAT! 🐐',
      textBody: 'No debate. 4 championships, 4 Finals MVPs. Greatest all-around player ever.',
      videoUrl: 'https://pub-42dbf98a0dac4f35997c1d3a73bb06e9.r2.dev/test-video.mp4',
      thumbUrl: 'https://pub-42dbf98a0dac4f35997c1d3a73bb06e9.r2.dev/test-thumbnail.jpg',
      sport: 'NBA',
      status: 'PUBLISHED', // THIS IS KEY
      authorId: user1.id,
    },
  });

  const hotTake2 = await prisma.hotTake.create({
    data: {
      title: 'Chiefs Dynasty is Real 🏆',
      textBody: 'Mahomes is building a legacy. Best QB of this generation.',
      videoUrl: 'https://pub-42dbf98a0dac4f35997c1d3a73bb06e9.r2.dev/test-video.mp4',
      thumbUrl: 'https://pub-42dbf98a0dac4f35997c1d3a73bb06e9.r2.dev/test-thumbnail.jpg',
      sport: 'NFL',
      status: 'PUBLISHED',
      authorId: user2.id,
    },
  });

  const hotTake3 = await prisma.hotTake.create({
    data: {
      title: 'Yankees Need to Rebuild ⚾',
      textBody: 'Time to admit it. This core is not winning a championship.',
      videoUrl: 'https://pub-42dbf98a0dac4f35997c1d3a73bb06e9.r2.dev/test-video.mp4',
      thumbUrl: 'https://pub-42dbf98a0dac4f35997c1d3a73bb06e9.r2.dev/test-thumbnail.jpg',
      sport: 'MLB',
      status: 'PUBLISHED',
      authorId: user1.id,
    },
  });

  // Create some reactions
  await prisma.reaction.create({
    data: {
      userId: user2.id,
      takeId: hotTake1.id,
      emoji: '❤️',
    },
  });

  // Create a follow
  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log('  - 2 users');
  console.log('  - 3 Hot Takes');
  console.log('  - 1 reaction');
  console.log('  - 1 follow');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
