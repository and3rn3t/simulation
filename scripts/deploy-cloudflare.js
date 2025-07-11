#!/usr/bin/env node

/**
 * Cloudflare Pages Deployment Script
 * Helps set up and deploy to Cloudflare Pages
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupCloudflarePages() {
  console.log('🚀 Setting up Cloudflare Pages deployment...');

  try {
    // Set environment variables for build
    const buildDate = new Date().toISOString();
    const gitCommit = process.env.GITHUB_SHA || execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const gitBranch = process.env.GITHUB_REF_NAME || execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    
    console.log(`📅 Build Date: ${buildDate}`);
    console.log(`📝 Git Commit: ${gitCommit}`);
    console.log(`🌿 Git Branch: ${gitBranch}`);

    // Create .env.local for build
    const envContent = `VITE_BUILD_DATE=${buildDate}
VITE_GIT_COMMIT=${gitCommit}
VITE_GIT_BRANCH=${gitBranch}
VITE_APP_VERSION=${process.env.npm_package_version || '1.0.0'}
VITE_ENVIRONMENT=${process.env.NODE_ENV || 'development'}
`;

    writeFileSync('.env.local', envContent);
    console.log('✅ Environment variables set for Cloudflare build');

    // Check if Wrangler is available
    try {
      execSync('npx wrangler --version', { stdio: 'pipe' });
      console.log('✅ Wrangler CLI is available');
    } catch (error) {
      console.log('⚠️  Wrangler CLI not found, install with: npm install -D wrangler');
    }

    // Check for wrangler.toml
    if (existsSync('wrangler.toml')) {
      console.log('✅ wrangler.toml configuration found');
    } else {
      console.log('⚠️  wrangler.toml not found - this will be created by Cloudflare Pages');
    }

    console.log('🎉 Cloudflare Pages setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Connect your GitHub repo to Cloudflare Pages');
    console.log('2. Set build command: npm run build');
    console.log('3. Set output directory: dist');
    console.log('4. Add environment variables in Cloudflare dashboard');
    console.log('5. Configure GitHub secrets for CI/CD');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

function deployToCloudflare(environment = 'preview') {
  console.log(`🚀 Deploying to Cloudflare Pages (${environment})...`);

  try {
    // Build the project first
    console.log('📦 Building project...');
    execSync('npm run build', { stdio: 'inherit' });

    // Deploy using Wrangler
    const projectName = 'organism-simulation';
    const deployCommand = environment === 'production' 
      ? `npx wrangler pages deploy dist --project-name=${projectName} --compatibility-date=2024-01-01`
      : `npx wrangler pages deploy dist --project-name=${projectName}`;

    console.log(`🚀 Deploying with: ${deployCommand}`);
    execSync(deployCommand, { stdio: 'inherit' });

    console.log('🎉 Deployment successful!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// CLI handling
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupCloudflarePages();
    break;
  case 'deploy': {
    const environment = process.argv[3] || 'preview';
    deployToCloudflare(environment);
    break;
  }
  default:
    console.log('📖 Usage:');
    console.log('  node scripts/deploy-cloudflare.js setup    - Setup Cloudflare Pages');
    console.log('  node scripts/deploy-cloudflare.js deploy   - Deploy to preview');
    console.log('  node scripts/deploy-cloudflare.js deploy production - Deploy to production');
}
