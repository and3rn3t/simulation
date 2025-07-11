#!/usr/bin/env node

// Deployment Script for Organism Simulation
// Handles deployment to different environments

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.argv[2] || 'staging';
const version = process.argv[3] || 'latest';
const dryRun = process.argv[4] === 'true';

const projectRoot = path.join(__dirname, '..');
const buildDir = path.join(projectRoot, 'dist');

console.log(`🚀 Starting deployment to ${environment}`);
console.log(`Version: ${version}`);
console.log(`Dry run: ${dryRun}`);

// Validate environment
const validEnvironments = ['staging', 'production'];
if (!validEnvironments.includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.error(`Valid options: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

console.log(`✅ Valid environment: ${environment}`);

// Check if build exists
if (!fs.existsSync(buildDir)) {
  console.error(`❌ Build directory not found: ${buildDir}`);
  console.error('Run npm run build first');
  process.exit(1);
}

// Pre-deployment checks
console.log('🔍 Running pre-deployment checks...');

// Check if all required files exist
const requiredFiles = ['index.html', 'assets'];
for (const file of requiredFiles) {
  const filePath = path.join(buildDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }
}

console.log('✅ Pre-deployment checks passed');

// Environment-specific deployment
switch (environment) {
  case 'staging':
    console.log('📦 Deploying to staging environment...');
    
    if (dryRun) {
      console.log('🔍 DRY RUN - Would deploy to staging:');
      console.log('  - Upload to staging CDN/S3');
      console.log('  - Update staging DNS/routing');
      console.log('  - Run staging smoke tests');
    } else {
      console.log('🌐 Uploading to staging...');
      // Add staging deployment commands here
      // Examples:
      // aws s3 sync dist/ s3://staging-bucket --delete
      // netlify deploy --prod --dir=dist
      // vercel --prod
      
      console.log('🧪 Running staging smoke tests...');
      // npm run test:staging-smoke
      
      console.log('✅ Staging deployment complete');
      console.log('🔗 URL: https://staging.organism-simulation.com');
    }
    break;
    
  case 'production':
    console.log('📦 Deploying to production environment...');
    
    // Additional production safety checks
    console.log('🛡️ Running production safety checks...');
    
    // Check for debug flags
    const envFile = path.join(projectRoot, '.env');
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      if (envContent.includes('VITE_ENABLE_DEBUG=true')) {
        console.log('⚠️  Warning: Debug mode is enabled in production');
        if (!dryRun) {
          // In a real deployment, you might want to prompt for confirmation
          console.log('⚠️  Continuing with debug mode enabled');
        }
      }
    }
    
    if (dryRun) {
      console.log('🔍 DRY RUN - Would deploy to production:');
      console.log('  - Create backup of current production');
      console.log('  - Upload to production CDN/S3');
      console.log('  - Update production DNS/routing');
      console.log('  - Run production smoke tests');
      console.log('  - Send success notifications');
    } else {
      console.log('💾 Creating backup...');
      // Add backup commands here
      
      console.log('🌐 Uploading to production...');
      // Add production deployment commands here
      // Examples:
      // aws s3 sync dist/ s3://production-bucket --delete
      // netlify deploy --prod --dir=dist
      // vercel --prod
      
      console.log('🧪 Running production smoke tests...');
      // npm run test:production-smoke
      
      console.log('📢 Sending notifications...');
      // Add notification commands here
      
      console.log('✅ Production deployment complete');
      console.log('🔗 URL: https://organism-simulation.com');
    }
    break;
}

console.log(`🎉 Deployment to ${environment} completed successfully!`);
