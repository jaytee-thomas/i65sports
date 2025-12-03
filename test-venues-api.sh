#!/bin/bash

# Test script for Venues API endpoints
# Usage: ./test-venues-api.sh [CLERK_TOKEN]

CLERK_TOKEN=${1:-"YOUR_CLERK_TOKEN"}
BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Venues API Endpoints"
echo "================================="
echo ""

# Test 1: Nearby Venues (Nashville coordinates)
echo "📍 Test 1: Get nearby venues (Nashville, 5km radius)"
echo "---------------------------------------------------"
curl -s "${BASE_URL}/venues/nearby?latitude=36.1627&longitude=-86.7816&radius=5" \
  -H "Authorization: Bearer ${CLERK_TOKEN}" \
  | jq '.' || echo "❌ Request failed or jq not installed"
echo ""
echo ""

# Test 2: Check if server is running
echo "🔍 Test 2: Check server status"
echo "-------------------------------"
curl -s "${BASE_URL}/venues/nearby?latitude=36.1627&longitude=-86.7816" \
  -H "Authorization: Bearer ${CLERK_TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n" || echo "❌ Server not running or endpoint not found"
echo ""

# Instructions
echo "📝 To get your Clerk token:"
echo "   1. Sign in to your app (mobile or web)"
echo "   2. Open browser DevTools → Network tab"
echo "   3. Make any authenticated request"
echo "   4. Copy the 'Authorization: Bearer ...' token from request headers"
echo ""
echo "   OR use Clerk Dashboard → Users → Select user → Sessions → Copy token"
echo ""

