#!/bin/bash

# Test script for Check-In API endpoint
# Usage: ./test-check-in.sh [CLERK_TOKEN] [VENUE_ID]

CLERK_TOKEN=${1:-"YOUR_CLERK_TOKEN"}
VENUE_ID=${2:-"VENUE_ID_FROM_DATABASE"}
BASE_URL="http://localhost:3000/api"

# Nashville coordinates (Nissan Stadium area)
LATITUDE=36.1627
LONGITUDE=-86.7816

echo "🎫 Testing Check-In API Endpoint"
echo "================================="
echo ""
echo "📍 Coordinates: ${LATITUDE}, ${LONGITUDE}"
echo "🏟️  Venue ID: ${VENUE_ID}"
echo ""

# Test Check-In
echo "✅ Test: Check in at venue"
echo "-------------------------"
curl -X POST "${BASE_URL}/venues/check-in" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CLERK_TOKEN}" \
  -d "{
    \"venueId\": \"${VENUE_ID}\",
    \"latitude\": ${LATITUDE},
    \"longitude\": ${LONGITUDE}
  }" \
  -w "\n\nHTTP Status: %{http_code}\n" | jq '.' || echo "❌ Request failed"
echo ""

# Instructions
echo "📝 To get a Venue ID:"
echo "   1. Run: npx prisma studio"
echo "   2. Open Venues table"
echo "   3. Copy any venue ID"
echo ""
echo "   OR query directly:"
echo "   psql \$DATABASE_URL -c \"SELECT id, name, city FROM venues LIMIT 5;\""
echo ""
echo "📝 To get your Clerk token:"
echo "   - Sign in to your app and check network requests"
echo "   - Or use Clerk Dashboard → Users → Sessions"
echo ""

