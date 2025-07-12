#!/usr/bin/env node

/**
 * Preview/Staging Deployment Tester
 * Tests and validates the staging deployment workflow
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security: Whitelist of allowed commands to prevent command injection
const ALLOWED_COMMANDS = [
  'git branch --show-current',
  'git status --porcelain',
  'git branch',
  'git fetch origin develop',
  'git rev-parse develop',
  'git rev-parse origin/develop',
  'git checkout develop',
  'git add staging-test.txt',
  'git rm staging-test.txt',
  'git push origin develop',
];

// Security: Whitelist of allowed git commit patterns
const ALLOWED_COMMIT_PATTERNS = [
  /^git commit -m "test: Staging deployment test - \d{4}-\d{2}-\d{2}"$/,
  /^git commit -m "cleanup: Remove staging test file"$/,
];

function secureExecSync(command, options = {}) {
  // Check if command is in allowlist
  const isAllowed =
    ALLOWED_COMMANDS.includes(command) ||
    ALLOWED_COMMIT_PATTERNS.some(pattern => pattern.test(command));

  if (!isAllowed) {
    throw new Error(`Command not allowed: ${command}`);
  }

  // Add security timeout
  const safeOptions = {
    timeout: 30000, // 30 second timeout
    ...options,
  };

  return execSync(command, safeOptions);
}

// __dirname is available as a global variable in Node.js

console.log('🧪 Preview/Staging Deployment Tester');
console.log('====================================\n');

// Check current git status
function checkGitStatus() {
  try {
    const branch = secureExecSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const hasUncommittedChanges = secureExecSync('git status --porcelain', {
      encoding: 'utf8',
    }).trim();

    console.log('📍 Git Status:');
    console.log(`Current branch: ${branch}`);
    console.log(`Uncommitted changes: ${hasUncommittedChanges ? 'Yes ⚠️' : 'No ✅'}`);

    if (hasUncommittedChanges) {
      console.log('⚠️  Warning: You have uncommitted changes. Consider committing them first.');
    }

    return { branch, hasUncommittedChanges: !!hasUncommittedChanges };
  } catch (error) {
    console.error('❌ Error checking git status:', error.message);
    return null;
  }
}

// Check if develop branch exists and is up to date
function checkDevelopBranch() {
  try {
    console.log('\n🌿 Checking develop branch:');

    // Check if develop branch exists locally
    const branches = secureExecSync('git branch', { encoding: 'utf8' });
    const hasDevelop = branches.includes('develop');
    console.log(`Local develop branch: ${hasDevelop ? 'Exists ✅' : 'Missing ❌'}`);

    if (hasDevelop) {
      // Check if develop is up to date with remote
      try {
        secureExecSync('git fetch origin develop', { stdio: 'ignore' });
        const localCommit = secureExecSync('git rev-parse develop', { encoding: 'utf8' }).trim();
        const remoteCommit = secureExecSync('git rev-parse origin/develop', {
          encoding: 'utf8',
        }).trim();

        console.log(
          `Local/remote sync: ${localCommit === remoteCommit ? 'Synced ✅' : 'Out of sync ⚠️'}`
        );

        if (localCommit !== remoteCommit) {
          console.log('💡 Run: git checkout develop && git pull origin develop');
        }
      } catch {
        console.log('⚠️  Could not check remote develop branch');
      }
    }

    return hasDevelop;
  } catch (error) {
    console.error('❌ Error checking develop branch:', error.message);
    return false;
  }
}

// Check staging environment configuration
function checkStagingConfig() {
  console.log('\n⚙️  Checking staging configuration:');

  // Check .env.staging file
  const envStagingPath = path.join(__dirname, '..', '.env.staging');
  const hasEnvStaging = fs.existsSync(envStagingPath);
  console.log(`Staging env file: ${hasEnvStaging ? 'Exists ✅' : 'Missing ❌'}`);

  if (hasEnvStaging) {
    const content = fs.readFileSync(envStagingPath, 'utf8');
    const hasNodeEnv = content.includes('NODE_ENV=staging');
    console.log(`NODE_ENV=staging: ${hasNodeEnv ? 'Configured ✅' : 'Missing ❌'}`);
  }

  // Check wrangler.toml preview environment
  const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
  if (fs.existsSync(wranglerPath)) {
    const content = fs.readFileSync(wranglerPath, 'utf8');
    const hasPreview = content.includes('[env.preview]');
    console.log(`Cloudflare preview env: ${hasPreview ? 'Configured ✅' : 'Missing ❌'}`);
  }

  return { hasEnvStaging };
}

// Test staging deployment workflow
function testStagingWorkflow() {
  console.log('\n🧪 Testing staging deployment workflow:');

  console.log('1. Create test file for staging deployment...');
  const testFilePath = path.join(__dirname, '..', 'staging-test.txt');
  const timestamp = new Date().toISOString();
  fs.writeFileSync(testFilePath, `Staging test deployment: ${timestamp}\n`);
  console.log('   ✅ Test file created');

  console.log('\n2. Switch to develop branch...');
  try {
    secureExecSync('git checkout develop', { stdio: 'inherit' });
    console.log('   ✅ Switched to develop branch');
  } catch (error) {
    console.log('   ❌ Failed to switch to develop branch');
    // Clean up test file
    fs.unlinkSync(testFilePath);
    return false;
  }

  console.log('\n3. Add and commit test file...');
  try {
    secureExecSync('git add staging-test.txt', { stdio: 'ignore' });
    secureExecSync(`git commit -m "test: Staging deployment test - ${timestamp.split('T')[0]}"`, {
      stdio: 'ignore',
    });
    console.log('   ✅ Test commit created');
  } catch (error) {
    console.log('   ⚠️  Could not create test commit (might already exist)');
  }

  console.log('\n4. Push to develop branch...');
  try {
    secureExecSync('git push origin develop', { stdio: 'inherit' });
    console.log('   ✅ Pushed to develop branch');
    console.log('   🚀 This should trigger the staging deployment!');
  } catch (error) {
    console.log('   ❌ Failed to push to develop branch');
    return false;
  }

  // Clean up test file
  try {
    fs.unlinkSync(testFilePath);
    secureExecSync('git rm staging-test.txt', { stdio: 'ignore' });
    secureExecSync('git commit -m "cleanup: Remove staging test file"', { stdio: 'ignore' });
    secureExecSync('git push origin develop', { stdio: 'ignore' });
    console.log('   🧹 Cleaned up test file');
  } catch (error) {
    console.log('   ⚠️  Could not clean up test file');
  }

  return true;
}

// Main function
function main() {
  console.log('Starting preview deployment test...\n');

  const gitStatus = checkGitStatus();
  if (!gitStatus) {
    console.log('❌ Cannot proceed without git status');
    return;
  }

  const hasDevelop = checkDevelopBranch();
  if (!hasDevelop) {
    console.log('\n❌ Develop branch is required for staging deployments');
    console.log('💡 Create it with: git checkout -b develop && git push -u origin develop');
    return;
  }

  checkStagingConfig();

  // Automatically test staging deployment workflow
  testStagingWorkflow();

  console.log('\n🎯 Next Steps:');
  console.log('1. Check GitHub Actions: https://github.com/and3rn3t/simulation/actions');
  console.log('2. Look for workflow run triggered by develop branch');
  console.log('3. Monitor Cloudflare Pages: https://dash.cloudflare.com/pages');
  console.log('4. Check preview URL in Cloudflare deployment');

  console.log('\n❓ Test staging deployment now? (y/n)');
  console.log('This will:');
  console.log('  • Switch to develop branch');
  console.log('  • Create a test commit');
  console.log('  • Push to trigger staging deployment');
  console.log('  • Clean up afterwards');

  // For automation, we'll skip the interactive prompt
  // In a real scenario, you'd add readline here for user input
  console.log('\n🚀 To manually test staging deployment:');
  console.log('1. git checkout develop');
  console.log('2. Make a small change');
  console.log('3. git add . && git commit -m "test: staging deployment"');
  console.log('4. git push origin develop');
  console.log('5. Check GitHub Actions for the workflow run');
}

main();
