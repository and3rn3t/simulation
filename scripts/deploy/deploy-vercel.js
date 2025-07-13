#!/usr/bin/env node

/**
 * Vercel Deployment Script
 * Sets up environment variables and deploys to Vercel
 */

import fs from 'fs';
import path from 'path';
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

    // Security: Sanitize environment variables to prevent injection
    const safeGitCommit = gitCommit.replace(/[^a-zA-Z0-9]/g, '');
    const safeBuildDate = buildDate.replace(/[^a-zA-Z0-9\-:T.Z]/g, '');
    const safeVersion = (process.env.npm_package_version || '1.0.0').replace(/[^a-zA-Z0-9.-]/g, '');

    // Create .env.local for Vercel build with sanitized content
    const envContent = `VITE_BUILD_DATE=${safeBuildDate}
VITE_GIT_COMMIT=${safeGitCommit}
VITE_APP_VERSION=${safeVersion}
`;

    // Security: Use absolute path for file write
    const envFilePath = path.resolve(process.cwd(), '.env.local');
    fs.writeFileSync(envFilePath, envContent);

    // Security: Set read-only permissions on created file
    fs.chmodSync(envFilePath, 0o644); // Read-write for owner, read-only for group and others
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
