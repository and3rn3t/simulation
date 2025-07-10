@echo off
REM Build script for Windows
setlocal EnableDelayedExpansion

echo 🏗️  Starting build process...

REM Check Node.js version
echo 📦 Node.js version:
node --version
echo 📦 npm version:
npm --version

REM Install dependencies
echo 📦 Installing dependencies...
npm ci
if !errorlevel! neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Run quality checks
echo 🔍 Running quality checks...
npm run quality:check
if !errorlevel! neq 0 (
    echo ❌ Quality checks failed
    exit /b 1
)

REM Run security scan
echo 🔒 Running security scan...
npm run security:audit
if !errorlevel! neq 0 (
    echo ⚠️  Security scan completed with warnings
)

REM Run tests
echo 🧪 Running tests...
npm run test:coverage
if !errorlevel! neq 0 (
    echo ❌ Tests failed
    exit /b 1
)

REM Build application
echo 🏗️  Building application...
npm run build
if !errorlevel! neq 0 (
    echo ❌ Build failed
    exit /b 1
)

echo ✅ Build completed successfully!

REM Optional: Run additional checks if in CI
if "%CI%"=="true" (
    echo 🔍 Running additional CI checks...
    npm run test:e2e
    npm run sonar
)
