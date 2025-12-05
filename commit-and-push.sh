#!/bin/bash

# Professional Git Commit and Push Script
# Usage: ./commit-and-push.sh [commit-message]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Git Commit and Push Process...${NC}\n"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}❌ Error: Not a git repository${NC}"
    exit 1
fi

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    exit 0
fi

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE} branch: ${CURRENT_BRANCH}${NC}\n"

# Show status
echo -e "${BLUE}📊 Current Status:${NC}"
git status --short
echo ""

# Default commit message if not provided
if [ -z "$1" ]; then
    COMMIT_MSG="feat: Add comprehensive engagement tools system and analytics

Engagement Tools:
- Add EngagementToolsSection component with toggle-based UI
- Implement PollCreator, QuestionCreator, PredictionCreator, and ChallengeCreator components
- Create PollCard, QuestionCard, PredictionCard, and ChallengeCard display components
- Create Challenges API endpoints (create, get, join, progress)
- Create Polls, Questions, and Predictions API endpoints
- Integrate engagement tools into UploadHotTakeScreen
- Update Hot Takes API to include engagement tools data (polls, questions, predictions, challenges)
- Fix requirement field type conversion (int to string) in Challenges API

Analytics:
- Add analytics dashboard API endpoints
- Add view tracking for Hot Takes
- Add daily analytics aggregation

Mobile Components:
- Add date picker and picker dependencies (@react-native-community/datetimepicker, @react-native-picker/picker)
- Update HotTakeDetailScreen to display engagement tools
- Add AnalyticsScreen for mobile analytics dashboard

Backend Improvements:
- Fix Prisma model naming issues across multiple API routes
- Update collections, bookmarks, drafts, conversations APIs
- Improve error handling and logging
- Add proper type assertions for Prisma relations

Features:
- Users can add polls, questions, predictions, and challenges when uploading Hot Takes
- Engagement tools are saved with drafts and created on publish
- Challenge system with progress tracking and completion
- Full CRUD operations for all engagement tool types
- Real-time analytics tracking and dashboard"
else
    COMMIT_MSG="$1"
fi

# Stage all changes
echo -e "${BLUE}📦 Staging changes...${NC}"
git add -A

# Commit with message
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MSG"

# Show commit summary
echo -e "\n${GREEN}✅ Commit created successfully!${NC}"
echo -e "${BLUE}📝 Commit message:${NC}"
echo -e "${YELLOW}$COMMIT_MSG${NC}\n"

# Ask for confirmation before pushing
read -p "Push to remote? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📤 Pushing to remote...${NC}"
    git push origin "$CURRENT_BRANCH"
    echo -e "\n${GREEN}✅ Successfully pushed to ${CURRENT_BRANCH}!${NC}"
else
    echo -e "${YELLOW}⏸️  Push cancelled. Run 'git push' manually when ready.${NC}"
fi

echo -e "\n${GREEN}✨ Done!${NC}"

