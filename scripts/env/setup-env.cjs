#!/usr/bin/env node
/* eslint-env node */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
// Environment Setup Script (Node.js ES Modules)
// Configures the build environment and loads appropriate environment variables

// __dirname is available as a global variable in CommonJS modules

const environment = process.argv[2] || 'development';
const projectRoot = path.join(__dirname, '..', '..');

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

  // Try to find the file in the environments directory
  const altEnvFile = path.join(projectRoot, 'environments', environment, `.env.${environment}`);
  if (fs.existsSync(altEnvFile)) {
    console.log(`📋 Found environment file at: ${altEnvFile}`);
    console.log(`📋 Copying ${altEnvFile} to ${targetFile}`);
    fs.copyFileSync(altEnvFile, targetFile);
  } else {
    console.error(`❌ Alternative environment file also not found: ${altEnvFile}`);
    console.log('📝 Creating basic environment file...');

    // Create a basic environment file
    const basicEnv = [
      `NODE_ENV=${environment}`,
      `VITE_APP_NAME=Organism Simulation`,
      `VITE_APP_VERSION=1.0.0`,
      `VITE_ENVIRONMENT=${environment}`,
      '',
    ].join('\n');

    fs.writeFileSync(targetFile, basicEnv);
    console.log(`✅ Created basic environment file: ${targetFile}`);
  }
} else {
  console.log(`📋 Copying ${envFile} to ${targetFile}`);
  fs.copyFileSync(envFile, targetFile);
}

// Add build metadata
const buildMetadata = [
  '',
  '# Build Metadata (auto-generated)',
  `VITE_BUILD_DATE=${new Date().toISOString()}`,
];

// Add git commit if available
try {
  const gitCommit = secureExecSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  buildMetadata.push(`VITE_GIT_COMMIT=${gitCommit}`);
  console.log(`📝 Added git commit: ${gitCommit.substring(0, 8)}`);
} catch {
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
