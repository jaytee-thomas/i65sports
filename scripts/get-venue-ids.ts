/**
 * Quick script to get venue IDs from database
 * Run: npx tsx scripts/get-venue-ids.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏟️  Available Venues:\n');
  
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      sport: true,
      team: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  if (venues.length === 0) {
    console.log('❌ No venues found in database.');
    console.log('💡 Run: npx tsx prisma/seed-venues.ts (if available)');
    return;
  }

  venues.forEach((venue, index) => {
    console.log(`${index + 1}. ${venue.name}`);
    console.log(`   ID: ${venue.id}`);
    console.log(`   Location: ${venue.city}, ${venue.state}`);
    console.log(`   Coordinates: ${venue.latitude}, ${venue.longitude}`);
    if (venue.sport) console.log(`   Sport: ${venue.sport}`);
    if (venue.team) console.log(`   Team: ${venue.team}`);
    console.log('');
  });

  console.log(`\n✅ Found ${venues.length} venue(s)`);
  console.log('\n💡 Use any venue ID above to test the check-in endpoint');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

