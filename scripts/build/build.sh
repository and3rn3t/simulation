#!/bin/bash

# Build script for CI/CD pipeline
set -e

echo "🏗️  Starting build process..."

# Check Node.js version
echo "📦 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run quality checks
echo "🔍 Running quality checks..."
npm run quality:check

# Run security scan
echo "🔒 Running security scan..."
npm run security:audit

# Run tests
echo "🧪 Running tests..."
npm run test:coverage

# Build application
echo "🏗️  Building application..."
npm run build

# Check build size
echo "📊 Build size analysis:"
du -sh dist/

echo "✅ Build completed successfully!"

# Optional: Run additional checks
if [ "$CI" = "true" ]; then
    echo "🔍 Running additional CI checks..."
    npm run test:e2e
    npm run sonar
fi
