import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VENUES = [
  // NFL Stadiums
  {
    name: "AT&T Stadium",
    city: "Arlington",
    state: "TX",
    latitude: 32.7473,
    longitude: -97.0945,
    capacity: 80000,
    sport: "NFL",
    team: "Dallas Cowboys",
  },
  {
    name: "Lincoln Financial Field",
    city: "Philadelphia",
    state: "PA",
    latitude: 39.9008,
    longitude: -75.1675,
    capacity: 69176,
    sport: "NFL",
    team: "Philadelphia Eagles",
  },
  {
    name: "Lambeau Field",
    city: "Green Bay",
    state: "WI",
    latitude: 44.5013,
    longitude: -88.0622,
    capacity: 81441,
    sport: "NFL",
    team: "Green Bay Packers",
  },
  // NBA Arenas
  {
    name: "Chase Center",
    city: "San Francisco",
    state: "CA",
    latitude: 37.7680,
    longitude: -122.3877,
    capacity: 18064,
    sport: "NBA",
    team: "Golden State Warriors",
  },
  {
    name: "Crypto.com Arena",
    city: "Los Angeles",
    state: "CA",
    latitude: 34.0430,
    longitude: -118.2673,
    capacity: 19068,
    sport: "NBA",
    team: "Los Angeles Lakers",
  },
  // MLB Stadiums
  {
    name: "Yankee Stadium",
    city: "Bronx",
    state: "NY",
    latitude: 40.8296,
    longitude: -73.9262,
    capacity: 46537,
    sport: "MLB",
    team: "New York Yankees",
  },
  {
    name: "Fenway Park",
    city: "Boston",
    state: "MA",
    latitude: 42.3467,
    longitude: -71.0972,
    capacity: 37755,
    sport: "MLB",
    team: "Boston Red Sox",
  },
  // NHL Arenas
  {
    name: "Bell Centre",
    city: "Montreal",
    state: "QC",
    latitude: 45.4961,
    longitude: -73.5693,
    capacity: 21302,
    sport: "NHL",
    team: "Montreal Canadiens",
  },
  {
    name: "Scotiabank Arena",
    city: "Toronto",
    state: "ON",
    latitude: 43.6435,
    longitude: -79.3791,
    capacity: 19800,
    sport: "NHL",
    team: "Toronto Maple Leafs",
  },
];

async function main() {
  console.log("🏟️  Seeding venues...");

  for (const venue of VENUES) {
    await prisma.venue.upsert({
      where: {
        name_city: {
          name: venue.name,
          city: venue.city,
        },
      },
      update: venue,
      create: venue,
    });
    console.log(`✅ ${venue.name} (${venue.team})`);
  }

  console.log("✅ Venue seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

