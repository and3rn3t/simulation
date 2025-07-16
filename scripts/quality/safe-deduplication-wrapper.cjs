#!/usr/bin/env node
/**
 * Safe Deduplication Wrapper
 *
 * This script provides a safe wrapper around any deduplication operation,
 * ensuring proper validation before and after changes.
 */

const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const AUDITOR_SCRIPT = path.join(__dirname, 'deduplication-safety-auditor.cjs');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substr(11, 8);
  const typeColors = {
    info: colors.blue,
    success: colors.green,
    warning: colors.yellow,
    error: colors.red,
    critical: colors.magenta,
    header: colors.cyan,
  };

  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    critical: '🚨',
    header: '🛡️',
  }[type];

  console.log(
    `${colors.bright}[${timestamp}]${colors.reset} ${icon} ${typeColors[type]}${message}${colors.reset}`
  );
}

async function runSafeDeduplication(operation) {
  log('🛡️ Starting Safe Deduplication Process', 'header');

  try {
    // Step 1: Pre-deduplication safety check
    log('Running pre-deduplication safety check...', 'info');
    execSync(`node "${AUDITOR_SCRIPT}" pre-check`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    log('✅ Pre-check passed - safe to proceed', 'success');

    // Step 2: Run the deduplication operation
    log(`Running deduplication operation: ${operation}`, 'info');
    try {
      execSync(operation, {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
      });
      log('✅ Deduplication operation completed', 'success');
    } catch (error) {
      log('❌ Deduplication operation failed', 'error');
      throw error;
    }

    // Step 3: Post-deduplication validation
    log('Running post-deduplication validation...', 'info');
    execSync(`node "${AUDITOR_SCRIPT}" post-check`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    log('✅ Post-check passed - deduplication successful', 'success');
  } catch {
    log('❌ Safe deduplication process failed', 'critical');
    log('Check the audit report for details and potential rollback information', 'error');
    process.exit(1);
  }
}

// Get the operation from command line arguments
const operation = process.argv.slice(2).join(' ');

if (!operation) {
  log('🛡️ Safe Deduplication Wrapper', 'header');
  log('', 'info');
  log('Usage: node safe-deduplication-wrapper.cjs <command>', 'info');
  log('', 'info');
  log('Examples:', 'info');
  log('  node safe-deduplication-wrapper.cjs "npm run sonar"', 'info');
  log('  node safe-deduplication-wrapper.cjs "eslint src/ --fix"', 'info');
  log('  node safe-deduplication-wrapper.cjs "custom-dedup-script.js"', 'info');
  log('', 'info');
  log('This wrapper ensures safe execution with automatic backup and rollback.', 'info');
  process.exit(0);
}

runSafeDeduplication(operation);
