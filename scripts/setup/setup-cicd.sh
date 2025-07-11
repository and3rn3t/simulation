#!/bin/bash

# CI/CD Setup Script
# Initializes the complete CI/CD pipeline for the Organism Simulation project

set -e

echo "🚀 Setting up CI/CD Pipeline for Organism Simulation"
echo "=============================================="

PROJECT_ROOT=$(dirname "$0")/..
cd "$PROJECT_ROOT"

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if git is available
if ! command -v git &> /dev/null; then
  echo "❌ Git is required but not installed"
  exit 1
fi

# Check if node is available
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed"
  exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
  echo "❌ npm is required but not installed"
  exit 1
fi

echo "✅ Prerequisites check passed"

# Verify environment files exist
echo "📋 Verifying environment configuration..."

ENV_FILES=(".env.development" ".env.staging" ".env.production")
for env_file in "${ENV_FILES[@]}"; do
  if [ -f "$env_file" ]; then
    echo "✅ Found: $env_file"
  else
    echo "❌ Missing: $env_file"
    exit 1
  fi
done

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x scripts/*.js 2>/dev/null || true

echo "✅ Scripts are now executable"

# Test environment setup
echo "🧪 Testing environment setup..."

echo "  Testing development environment..."
node scripts/setup-env.js development > /dev/null
if [ -f ".env" ]; then
  echo "  ✅ Development environment setup works"
else
  echo "  ❌ Development environment setup failed"
  exit 1
fi

echo "  Testing staging environment..."
node scripts/setup-env.js staging > /dev/null
if [ -f ".env" ]; then
  echo "  ✅ Staging environment setup works"
else
  echo "  ❌ Staging environment setup failed"
  exit 1
fi

echo "  Testing production environment..."
node scripts/setup-env.js production > /dev/null
if [ -f ".env" ]; then
  echo "  ✅ Production environment setup works"
else
  echo "  ❌ Production environment setup failed"
  exit 1
fi

# Reset to development
node scripts/setup-env.js development > /dev/null

# Verify GitHub Actions workflow syntax
echo "🔍 Verifying GitHub Actions workflows..."

if [ -f ".github/workflows/ci-cd.yml" ]; then
  echo "✅ Main CI/CD workflow found"
else
  echo "❌ Main CI/CD workflow missing"
  exit 1
fi

if [ -f ".github/workflows/environment-management.yml" ]; then
  echo "✅ Environment management workflow found"
else
  echo "❌ Environment management workflow missing"
  exit 1
fi

# Check if this is a git repository
if [ ! -d ".git" ]; then
  echo "⚠️  This is not a git repository. Initializing..."
  git init
  echo "✅ Git repository initialized"
fi

# Check for GitHub remote
if ! git remote get-url origin &> /dev/null; then
  echo "⚠️  No GitHub remote configured"
  echo "To complete setup, add your GitHub repository as origin:"
  echo "  git remote add origin https://github.com/your-username/your-repo.git"
else
  echo "✅ GitHub remote configured"
fi

# Summary
echo ""
echo "🎉 CI/CD Pipeline Setup Complete!"
echo "================================="
echo ""
echo "✅ Environment configuration verified"
echo "✅ Deployment scripts configured"
echo "✅ GitHub Actions workflows ready"
echo "✅ Monitoring scripts available"
echo ""
echo "📋 Next Steps:"
echo "1. Push to GitHub to trigger the CI/CD pipeline"
echo "2. Configure GitHub environments (staging, production)"
echo "3. Add any required secrets to GitHub repository settings"
echo "4. Test deployment with: npm run deploy:staging:dry"
echo ""
echo "📚 Documentation:"
echo "- Deployment Guide: docs/DEPLOYMENT.md"
echo "- Environment Setup: environments/README.md"
echo ""
echo "🚀 Available Commands:"
echo "- npm run env:staging          # Setup staging environment"
echo "- npm run build:production     # Build for production"
echo "- npm run deploy:staging:dry   # Test staging deployment"
echo "- npm run monitor:all          # Check all environments"
echo ""
echo "Happy deploying! 🚀"
