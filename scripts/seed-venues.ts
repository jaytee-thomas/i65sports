import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const venues = [
  // Nashville Venues
  {
    id: 'venue_bridgestone_arena',
    name: 'Bridgestone Arena',
    city: 'Nashville',
    state: 'TN',
    latitude: 36.1591,
    longitude: -86.7784,
    capacity: 17159,
    sport: 'NHL',
    team: 'Nashville Predators',
  },
  {
    id: 'venue_nissan_stadium',
    name: 'Nissan Stadium',
    city: 'Nashville',
    state: 'TN',
    latitude: 36.1665,
    longitude: -86.7713,
    capacity: 69143,
    sport: 'NFL',
    team: 'Tennessee Titans',
  },
  {
    id: 'venue_firstbank_stadium',
    name: 'FirstBank Stadium',
    city: 'Nashville',
    state: 'TN',
    latitude: 36.1447,
    longitude: -86.8027,
    capacity: 40350,
    sport: 'NCAA',
    team: 'Vanderbilt Commodores',
  },
  {
    id: 'venue_first_horizon_park',
    name: 'First Horizon Park',
    city: 'Nashville',
    state: 'TN',
    latitude: 36.1664,
    longitude: -86.7678,
    capacity: 10000,
    sport: 'MiLB',
    team: 'Nashville Sounds',
  },
  
  // NFL Stadiums
  {
    id: 'venue_sofi_stadium',
    name: 'SoFi Stadium',
    city: 'Inglewood',
    state: 'CA',
    latitude: 33.9535,
    longitude: -118.3392,
    capacity: 70240,
    sport: 'NFL',
    team: 'LA Rams / LA Chargers',
  },
  {
    id: 'venue_metlife_stadium',
    name: 'MetLife Stadium',
    city: 'East Rutherford',
    state: 'NJ',
    latitude: 40.8128,
    longitude: -74.0742,
    capacity: 82500,
    sport: 'NFL',
    team: 'NY Giants / NY Jets',
  },
  {
    id: 'venue_lambeau_field',
    name: 'Lambeau Field',
    city: 'Green Bay',
    state: 'WI',
    latitude: 44.5013,
    longitude: -88.0622,
    capacity: 81441,
    sport: 'NFL',
    team: 'Green Bay Packers',
  },
  {
    id: 'venue_arrowhead_stadium',
    name: 'Arrowhead Stadium',
    city: 'Kansas City',
    state: 'MO',
    latitude: 39.0489,
    longitude: -94.4839,
    capacity: 76416,
    sport: 'NFL',
    team: 'Kansas City Chiefs',
  },
  
  // NBA Arenas
  {
    id: 'venue_madison_square_garden',
    name: 'Madison Square Garden',
    city: 'New York',
    state: 'NY',
    latitude: 40.7505,
    longitude: -73.9934,
    capacity: 19812,
    sport: 'NBA',
    team: 'New York Knicks',
  },
  {
    id: 'venue_staples_center',
    name: 'Crypto.com Arena',
    city: 'Los Angeles',
    state: 'CA',
    latitude: 34.0430,
    longitude: -118.2673,
    capacity: 19068,
    sport: 'NBA',
    team: 'LA Lakers / LA Clippers',
  },
  {
    id: 'venue_united_center',
    name: 'United Center',
    city: 'Chicago',
    state: 'IL',
    latitude: 41.8807,
    longitude: -87.6742,
    capacity: 20917,
    sport: 'NBA',
    team: 'Chicago Bulls',
  },
  {
    id: 'venue_td_garden',
    name: 'TD Garden',
    city: 'Boston',
    state: 'MA',
    latitude: 42.3662,
    longitude: -71.0621,
    capacity: 19156,
    sport: 'NBA',
    team: 'Boston Celtics',
  },
  
  // MLB Stadiums
  {
    id: 'venue_yankee_stadium',
    name: 'Yankee Stadium',
    city: 'Bronx',
    state: 'NY',
    latitude: 40.8296,
    longitude: -73.9262,
    capacity: 46537,
    sport: 'MLB',
    team: 'New York Yankees',
  },
  {
    id: 'venue_fenway_park',
    name: 'Fenway Park',
    city: 'Boston',
    state: 'MA',
    latitude: 42.3467,
    longitude: -71.0972,
    capacity: 37755,
    sport: 'MLB',
    team: 'Boston Red Sox',
  },
  {
    id: 'venue_wrigley_field',
    name: 'Wrigley Field',
    city: 'Chicago',
    state: 'IL',
    latitude: 41.9484,
    longitude: -87.6553,
    capacity: 41649,
    sport: 'MLB',
    team: 'Chicago Cubs',
  },
  {
    id: 'venue_dodger_stadium',
    name: 'Dodger Stadium',
    city: 'Los Angeles',
    state: 'CA',
    latitude: 34.0739,
    longitude: -118.2400,
    capacity: 56000,
    sport: 'MLB',
    team: 'Los Angeles Dodgers',
  },
  
  // NHL Arenas
  {
    id: 'venue_scotiabank_arena',
    name: 'Scotiabank Arena',
    city: 'Toronto',
    state: 'ON',
    latitude: 43.6435,
    longitude: -79.3791,
    capacity: 18800,
    sport: 'NHL',
    team: 'Toronto Maple Leafs',
  },
  {
    id: 'venue_bell_centre',
    name: 'Bell Centre',
    city: 'Montreal',
    state: 'QC',
    latitude: 45.4961,
    longitude: -73.5693,
    capacity: 21302,
    sport: 'NHL',
    team: 'Montreal Canadiens',
  },
  
  // College Football
  {
    id: 'venue_neyland_stadium',
    name: 'Neyland Stadium',
    city: 'Knoxville',
    state: 'TN',
    latitude: 35.9551,
    longitude: -83.9251,
    capacity: 101915,
    sport: 'NCAA',
    team: 'Tennessee Volunteers',
  },
  {
    id: 'venue_alabama_stadium',
    name: 'Bryant-Denny Stadium',
    city: 'Tuscaloosa',
    state: 'AL',
    latitude: 33.2081,
    longitude: -87.5503,
    capacity: 100077,
    sport: 'NCAA',
    team: 'Alabama Crimson Tide',
  },
  {
    id: 'venue_ohio_stadium',
    name: 'Ohio Stadium',
    city: 'Columbus',
    state: 'OH',
    latitude: 40.0018,
    longitude: -83.0196,
    capacity: 102780,
    sport: 'NCAA',
    team: 'Ohio State Buckeyes',
  },
  {
    id: 'venue_michigan_stadium',
    name: 'Michigan Stadium',
    city: 'Ann Arbor',
    state: 'MI',
    latitude: 42.2658,
    longitude: -83.7487,
    capacity: 107601,
    sport: 'NCAA',
    team: 'Michigan Wolverines',
  },
  
  // MLS Stadiums
  {
    id: 'venue_geodis_park',
    name: 'GEODIS Park',
    city: 'Nashville',
    state: 'TN',
    latitude: 36.1359,
    longitude: -86.7673,
    capacity: 30000,
    sport: 'MLS',
    team: 'Nashville SC',
  },
  {
    id: 'venue_mercedes_benz_stadium',
    name: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    state: 'GA',
    latitude: 33.7553,
    longitude: -84.4006,
    capacity: 42500,
    sport: 'MLS',
    team: 'Atlanta United FC',
  },
];

async function main() {
  console.log('🏟️  Starting venue seeding...\n');

  let created = 0;
  let skipped = 0;

  for (const venue of venues) {
    try {
      await (prisma as any).venues.upsert({
        where: { id: venue.id },
        update: {}, // Don't update if exists
        create: venue,
      });
      console.log(`✅ Created: ${venue.name} (${venue.city}, ${venue.state})`);
      created++;
    } catch (error) {
      console.log(`⏭️  Skipped: ${venue.name} (already exists)`);
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📍 Total venues: ${venues.length}`);
  console.log('\n🎉 Venue seeding complete!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding venues:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

