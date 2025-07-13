#!/usr/bin/env node

/**
 * Vercel Deployment Script
 * Sets up environment variables and deploys to Vercel
 */

import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Secure wrapper for execSync with timeout and error handling
 * @param {string} command - Command to execute
 * @param {object} options - Options for execSync
 * @returns {string} - Command output
 */
function secureExecSync(command, options = {}) {
  const safeOptions = {
    encoding: 'utf8',
    timeout: 30000, // 30 second default timeout
    stdio: 'pipe',
    ...options,
  };

  return execSync(command, safeOptions);
}

async function deployToVercel() {
  console.log('🚀 Starting Vercel deployment...');

  try {
    // Set environment variables for build
    const buildDate = new Date().toISOString();
    const gitCommit =
      process.env.GITHUB_SHA || secureExecSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

    console.log(`📅 Build Date: ${buildDate}`);
    console.log(`📝 Git Commit: ${gitCommit}`);

    // Create .env.local for Vercel build
    const envContent = `VITE_BUILD_DATE=${buildDate}
VITE_GIT_COMMIT=${gitCommit}
VITE_APP_VERSION=${process.env.npm_package_version || '1.0.0'}
`;

    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Environment variables set for Vercel build');

    // The actual deployment will be handled by Vercel's GitHub integration
    console.log('🎉 Ready for Vercel deployment!');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  deployToVercel();
}

export { deployToVercel };
