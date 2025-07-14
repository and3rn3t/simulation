#!/usr/bin/env node

/**
 * Quick Workflow Verification Script
 * Tests that all project management components are working
 */

import { execSync } from 'child_process';
import fs from 'fs';

// Security: Whitelist of allowed commands to prevent command injection
const ALLOWED_COMMANDS = [
  'npm --version',
  'node --version',
  'git --version',
  'npm run lint',
  'npm run build',
  'npm test',
  'npm run test:unit',
  'npm run workflow:validate',
  'npm run env:check',
  'npm run type-check',
  'git status --porcelain',
  'git remote -v',
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
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 30000, // 30 second timeout
    ...options,
  };

  return execSync(command, safeOptions);
}

console.log('🔍 Quick Workflow Verification');
console.log('==============================\n');

async function runTest(name, command, expectSuccess = true) {
  try {
    console.log(`Testing: ${name}`);
    const result = secureExecSync(command);
    if (expectSuccess) {
      console.log(`   ✅ PASS: ${name}`);
      return true;
    }
  } catch (error) {
    if (!expectSuccess) {
      console.log(`   ✅ PASS: ${name} (expected to fail)`);
      return true;
    }
    console.log(`   ❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message.split('\n')[0]}`);
    return false;
  }
}

async function verifyFiles() {
  console.log('📁 Checking Required Files...');

  const requiredFiles = [
    'package.json',
    '.github/workflows/ci-cd.yml',
    '.github/workflows/project-management.yml',
    'github-integration/labels.json',
    'github-integration/milestones.json',
    'github-integration/project-config.json',
  ];

  let allPresent = true;
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ Missing: ${file}`);
      allPresent = false;
    }
  }

  console.log('');
  return allPresent;
}

async function runAllTests() {
  const tests = [
    // File verification
    ['Required Files', () => verifyFiles()],

    // Script tests
    ['Workflow Validation', 'npm run workflow:validate'],
    ['Environment Check', 'npm run env:check'],
    ['Lint Check', 'npm run lint'],
    ['Type Check', 'npm run type-check'],
    ['Build Test', 'npm run build'],

    // Git tests
    ['Git Status', 'git status --porcelain'],
    ['Git Remote', 'git remote -v'],
  ];

  let passedTests = 0;

  for (const [name, command] of tests) {
    if (typeof command === 'function') {
      if (await command()) passedTests++;
    } else {
      if (await runTest(name, command)) passedTests++;
    }
  }

  console.log(`\n📊 Results: ${passedTests}/${tests.length} tests passed`);

  if (passedTests === tests.length) {
    console.log('\n🎉 All systems operational! Your workflow is ready.');
    console.log('\n🚀 Next steps:');
    console.log('1. Set up GitHub project board');
    console.log('2. Create milestones and issues');
    console.log('3. Start development with `npm run dev`');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    console.log('💡 Run `npm run workflow:troubleshoot` for detailed analysis');
  }
}

runAllTests().catch(console.error);
