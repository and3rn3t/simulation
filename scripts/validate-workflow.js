#!/usr/bin/env node
/* eslint-env node */

const fs = require('fs');
const path = require('path');

/**
 * Validates the GitHub Actions workflow configuration
 */

const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'ci-cd.yml');

function validateWorkflow() {
  console.log('🔍 Validating GitHub Actions workflow...');

  if (!fs.existsSync(workflowPath)) {
    console.error('❌ Workflow file not found:', workflowPath);
    process.exit(1);
  }

  const workflowContent = fs.readFileSync(workflowPath, 'utf8');

  // Check for required jobs
  const requiredJobs = ['test', 'security', 'build'];
  const missingJobs = requiredJobs.filter(job => !workflowContent.includes(`${job}:`));

  if (missingJobs.length > 0) {
    console.error(`❌ Missing required jobs: ${missingJobs.join(', ')}`);
    process.exit(1);
  }

  // Check for required steps
  const requiredSteps = [
    'Setup Node.js',
    'Install dependencies',
    'Run linter',
    'Run type check',
    'Run unit tests',
    'Run security audit',
    'Build application',
  ];

  const missingSteps = requiredSteps.filter(step => !workflowContent.includes(step));

  if (missingSteps.length > 0) {
    console.warn(`⚠️ Missing recommended steps: ${missingSteps.join(', ')}`);
  }

  // Check for secrets usage
  const secrets = ['CODECOV_TOKEN', 'SNYK_TOKEN', 'CLOUDFLARE_API_TOKEN'];
  const usedSecrets = secrets.filter(secret => workflowContent.includes(`secrets.${secret}`));

  console.log('✅ Workflow validation completed');
  console.log(
    '📊 Jobs found:',
    requiredJobs.filter(job => workflowContent.includes(`${job}:`))
  );
  console.log('🔐 Secrets used:', usedSecrets);

  if (missingJobs.length === 0) {
    console.log('🎉 Workflow configuration is valid!');
  }
}

validateWorkflow();
