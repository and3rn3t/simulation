#!/bin/bash

# Environment Setup Script
# Configures the build environment and loads appropriate environment variables

set -e

ENVIRONMENT=${1:-development}
PROJECT_ROOT=$(dirname "$0")/..

echo "🔧 Setting up environment: $ENVIRONMENT"

# Validate environment
case $ENVIRONMENT in
  development|staging|production)
    echo "✅ Valid environment: $ENVIRONMENT"
    ;;
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Valid options: development, staging, production"
    exit 1
    ;;
esac

# Copy environment file
ENV_FILE="$PROJECT_ROOT/.env.$ENVIRONMENT"
TARGET_FILE="$PROJECT_ROOT/.env"

if [ -f "$ENV_FILE" ]; then
  echo "📋 Copying $ENV_FILE to $TARGET_FILE"
  cp "$ENV_FILE" "$TARGET_FILE"
else
  echo "❌ Environment file not found: $ENV_FILE"
  exit 1
fi

# Add build metadata
echo "" >> "$TARGET_FILE"
echo "# Build Metadata (auto-generated)" >> "$TARGET_FILE"
echo "VITE_BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$TARGET_FILE"

# Add git commit if available
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
  GIT_COMMIT=$(git rev-parse HEAD)
  echo "VITE_GIT_COMMIT=$GIT_COMMIT" >> "$TARGET_FILE"
  echo "📝 Added git commit: ${GIT_COMMIT:0:8}"
fi

echo "✅ Environment setup complete for: $ENVIRONMENT"
echo ""
echo "📄 Current environment configuration:"
echo "----------------------------------------"
cat "$TARGET_FILE" | grep -E "^(NODE_ENV|VITE_)" | head -10
echo "----------------------------------------"
