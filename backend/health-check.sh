#!/bin/bash

# KLPoster Health Check Script
# This script checks if the backend is running correctly

HOST="${1:-localhost}"
PORT="${2:-3000}"
BASE_URL="http://$HOST:$PORT"

echo "Checking KLPoster backend health at $BASE_URL..."

# Check main health endpoint
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$HEALTH_CHECK" == "200" ]; then
  echo "✅ Main health check passed"
else
  echo "❌ Main health check failed with code $HEALTH_CHECK"
fi

# Check music API health endpoint
MUSIC_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/music/health")
if [ "$MUSIC_HEALTH" == "200" ]; then
  echo "✅ Music API health check passed"
else
  echo "❌ Music API health check failed with code $MUSIC_HEALTH"
fi

# Check authentication (should return 401 if not authenticated)
AUTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/posts")
if [ "$AUTH_CHECK" == "401" ]; then
  echo "✅ Authentication check passed (correctly returns 401 when unauthenticated)"
else
  echo "❌ Authentication check failed with code $AUTH_CHECK (expected 401)"
fi

# Summary
if [ "$HEALTH_CHECK" == "200" ] && [ "$MUSIC_HEALTH" == "200" ] && [ "$AUTH_CHECK" == "401" ]; then
  echo "✅ All health checks passed - KLPoster backend is working correctly"
  exit 0
else
  echo "❌ Some health checks failed - KLPoster backend may have issues"
  exit 1
fi 