#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Environment Setup Script (Node.js ES Modules)
// Configures the build environment and loads appropriate environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.argv[2] || 'development';
const projectRoot = path.join(__dirname, '..');

console.log(`🔧 Setting up environment: ${environment}`);

// Validate environment
const validEnvironments = ['development', 'staging', 'production'];
if (!validEnvironments.includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.error(`Valid options: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

console.log(`✅ Valid environment: ${environment}`);

// Copy environment file
const envFile = path.join(projectRoot, `.env.${environment}`);
const targetFile = path.join(projectRoot, '.env');

if (!fs.existsSync(envFile)) {
  console.error(`❌ Environment file not found: ${envFile}`);
  process.exit(1);
}

console.log(`📋 Copying ${envFile} to ${targetFile}`);
fs.copyFileSync(envFile, targetFile);

// Add build metadata
const buildMetadata = [
  '',
  '# Build Metadata (auto-generated)',
  `VITE_BUILD_DATE=${new Date().toISOString()}`,
];

// Add git commit if available
try {
  const gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  buildMetadata.push(`VITE_GIT_COMMIT=${gitCommit}`);
  console.log(`📝 Added git commit: ${gitCommit.substring(0, 8)}`);
} catch (error) {
  console.log('⚠️  Git not available or not in a git repository');
}

// Append build metadata to .env file
fs.appendFileSync(targetFile, buildMetadata.join('\n') + '\n');

console.log(`✅ Environment setup complete for: ${environment}`);
console.log('');
console.log('📄 Current environment configuration:');
console.log('----------------------------------------');

// Display current configuration
const envContent = fs.readFileSync(targetFile, 'utf8');
const envLines = envContent
  .split('\n')
  .filter(line => line.startsWith('NODE_ENV') || line.startsWith('VITE_'))
  .slice(0, 10);

envLines.forEach(line => console.log(line));
console.log('----------------------------------------');
