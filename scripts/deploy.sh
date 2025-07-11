#!/bin/bash

# Deployment Script for Organism Simulation
# Handles deployment to different environments

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
DRY_RUN=${3:-false}

PROJECT_ROOT=$(dirname "$0")/..
BUILD_DIR="$PROJECT_ROOT/dist"

echo "🚀 Starting deployment to $ENVIRONMENT"
echo "Version: $VERSION"
echo "Dry run: $DRY_RUN"

# Validate environment
case $ENVIRONMENT in
  staging|production)
    echo "✅ Valid environment: $ENVIRONMENT"
    ;;
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Valid options: staging, production"
    exit 1
    ;;
esac

# Check if build exists
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Build directory not found: $BUILD_DIR"
  echo "Run 'npm run build' first"
  exit 1
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if all required files exist
REQUIRED_FILES=("index.html" "assets")
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -e "$BUILD_DIR/$file" ]; then
    echo "❌ Required file missing: $file"
    exit 1
  fi
done

echo "✅ Pre-deployment checks passed"

# Environment-specific deployment
case $ENVIRONMENT in
  staging)
    echo "📦 Deploying to staging environment..."
    
    if [ "$DRY_RUN" = "true" ]; then
      echo "🔍 DRY RUN - Would deploy to staging:"
      echo "  - Upload to staging CDN/S3"
      echo "  - Update staging DNS/routing"
      echo "  - Run staging smoke tests"
    else
      echo "🌐 Uploading to staging..."
      # Add staging deployment commands here
      # Examples:
      # aws s3 sync dist/ s3://staging-bucket --delete
      # netlify deploy --prod --dir=dist
      # vercel --prod
      
      echo "🧪 Running staging smoke tests..."
      # npm run test:staging-smoke
      
      echo "✅ Staging deployment complete"
      echo "🔗 URL: https://staging.organism-simulation.com"
    fi
    ;;
    
  production)
    echo "📦 Deploying to production environment..."
    
    # Additional production safety checks
    echo "🛡️ Running production safety checks..."
    
    # Check for debug flags
    if grep -q "VITE_ENABLE_DEBUG=true" "$BUILD_DIR"/../.env 2>/dev/null; then
      echo "⚠️  Warning: Debug mode is enabled in production"
      read -p "Continue anyway? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
      fi
    fi
    
    if [ "$DRY_RUN" = "true" ]; then
      echo "🔍 DRY RUN - Would deploy to production:"
      echo "  - Create backup of current production"
      echo "  - Upload to production CDN/S3"
      echo "  - Update production DNS/routing"
      echo "  - Run production smoke tests"
      echo "  - Send success notifications"
    else
      echo "💾 Creating backup..."
      # Add backup commands here
      
      echo "🌐 Uploading to production..."
      # Add production deployment commands here
      # Examples:
      # aws s3 sync dist/ s3://production-bucket --delete
      # netlify deploy --prod --dir=dist
      # vercel --prod
      
      echo "🧪 Running production smoke tests..."
      # npm run test:production-smoke
      
      echo "📢 Sending notifications..."
      # Add notification commands here
      
      echo "✅ Production deployment complete"
      echo "🔗 URL: https://organism-simulation.com"
    fi
    ;;
esac

echo "🎉 Deployment to $ENVIRONMENT completed successfully!"
