#!/usr/bin/env node
/* eslint-env node */
/* global process, console */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Test runner that validates the CI/CD pipeline locally
 * This script simulates the GitHub Actions workflow
 */

// Security: Whitelist of allowed commands to prevent command injection
const ALLOWED_COMMANDS = [
  "npm --version",
  "node --version",
  "git --version",
  "npm ci",
  "npm run lint",
  "npm run build",
  "npm test",
  "npm run test:unit",
  "npm run test:coverage",
  "npm audit",
  "npm outdated",
];

/**
 * Securely execute a whitelisted command
 * @param {string} command - Command to execute (must be in whitelist)
 * @param {Object} options - Execution options
 * @returns {string} Command output
 */
function secureExecSync(command, options = {}) {
  // Security check: Only allow whitelisted commands
  if (!ALLOWED_COMMANDS.includes(command)) {
    throw new Error(`Command not allowed: ${command}`);
  }

  const safeOptions = {
    encoding: "utf8",
    stdio: "pipe",
    timeout: 60000, // 60 second timeout for build commands
    ...options,
  };

  return execSync(command, safeOptions);
}

const projectRoot = process.cwd();
let testsPassed = 0;
let testsFailed = 0;

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function logError(message) {
  console.error(`[${new Date().toISOString()}] ❌ ${message}`);
}

function logSuccess(message) {
  console.log(`[${new Date().toISOString()}] ✅ ${message}`);
}

/**
 * Run a command and handle errors gracefully
 */
function runCommand(command, description, continueOnError = false) {
  log(`Running: ${description}`);
  try {
    const output = secureExecSync(command, {
      cwd: projectRoot,
      stdio: "pipe",
      encoding: "utf8",
    });
    logSuccess(`${description} - PASSED`);
    testsPassed++;
    return output;
  } catch (error) {
    if (continueOnError) {
      console.warn(`⚠️ ${description} - FAILED (continuing): ${error.message}`);
      return "";
    } else {
      logError(`${description} - FAILED: ${error.message}`);
      testsFailed++;
      throw error;
    }
  }
}

/**
 * Check if required files exist
 */
function checkRequiredFiles() {
  log("Checking required files...");

  const requiredFiles = [
    "package.json",
    "config/typescript/tsconfig.json",
    "vite.config.ts",
    "vitest.config.ts",
    "eslint.config.js",
    ".github/workflows/ci-cd.yml",
    "src/main.ts",
    "test/setup.ts",
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath)) {
      logError(`Required file missing: ${file}`);
      testsFailed++;
    } else {
      log(`✓ Found: ${file}`);
    }
  }

  logSuccess("File check completed");
  testsPassed++;
}

/**
 * Run all tests
 */
async function runTests() {
  log("🚀 Starting CI/CD pipeline validation\n");

  try {
    // 1. Check required files
    checkRequiredFiles();

    // 2. Install dependencies
    runCommand("npm ci", "Install dependencies");

    // 3. Run linter
    runCommand("npm run lint", "ESLint");

    // 4. Run type check
    runCommand("npm run type-check", "TypeScript type check");

    // 5. Run unit tests
    runCommand("npm run test:run", "Unit tests");

    // 6. Run performance tests (optional)
    runCommand("npm run test:performance", "Performance tests", true);

    // 7. Run security audit
    runCommand("npm run security:audit", "Security audit", true);

    // 8. Test build process
    runCommand("npm run build", "Build application");

    // 9. Check if build artifacts exist
    const distPath = path.join(projectRoot, "dist");
    if (!fs.existsSync(distPath)) {
      logError("Build artifacts not found in dist/ directory");
      testsFailed++;
    } else {
      logSuccess("Build artifacts created successfully");
      testsPassed++;
    }

    // 10. Test environment setup
    runCommand(
      "node scripts/env/setup-env.cjs development",
      "Environment setup"
    );

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎯 CI/CD PIPELINE VALIDATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Tests passed: ${testsPassed}`);
    console.log(`❌ Tests failed: ${testsFailed}`);
    console.log(
      `📊 Success rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`
    );

    if (testsFailed === 0) {
      console.log("\n🎉 ALL TESTS PASSED! The CI/CD pipeline is ready.");
      process.exit(0);
    } else {
      console.log("\n💥 Some tests failed. Please fix the issues above.");
      process.exit(1);
    }
  } catch (error) {
    logError(`Pipeline validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Check if running in CI environment
if (process.env.CI) {
  log("Detected CI environment");
}

// Run the tests
runTests();
