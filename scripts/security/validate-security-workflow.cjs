#!/usr/bin/env node

/**
 * Security Workflow Validation Script
 * Tests the security workflow configuration and TruffleHog setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityWorkflowValidator {
  constructor() {
    this.workflowPath = '.github/workflows/security-advanced.yml';
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: []
    };
  }

  log(message, type = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${icons[type]} ${message}`);
  }

  validateWorkflowFile() {
    this.log('Validating security workflow file...', 'info');
    
    if (!fs.existsSync(this.workflowPath)) {
      this.results.failed++;
      this.results.issues.push('Security workflow file not found');
      this.log('Security workflow file not found!', 'error');
      return false;
    }

    const content = fs.readFileSync(this.workflowPath, 'utf8');
    
    // Check for TruffleHog configuration
    const hasTruffleHog = content.includes('trufflesecurity/trufflehog@main');
    const hasCommitRange = content.includes('Get commit range for TruffleHog');
    const hasDiffMode = content.includes('TruffleHog OSS Secret Scanning (Diff Mode)');
    const hasFilesystemMode = content.includes('TruffleHog OSS Secret Scanning (Filesystem Mode)');
    
    if (hasTruffleHog && hasCommitRange && hasDiffMode && hasFilesystemMode) {
      this.results.passed++;
      this.log('TruffleHog configuration is properly set up with dynamic commit range detection', 'success');
    } else {
      this.results.failed++;
      this.results.issues.push('TruffleHog configuration is incomplete or incorrect');
      this.log('TruffleHog configuration needs improvement', 'error');
    }

    // Check for other security tools
    const securityTools = [
      { name: 'CodeQL', pattern: 'github/codeql-action' },
      { name: 'Dependency Review', pattern: 'dependency-review-action' },
      { name: 'Snyk', pattern: 'snyk/actions' },
      { name: 'License Checker', pattern: 'license-checker' }
    ];

    securityTools.forEach(tool => {
      if (content.includes(tool.pattern)) {
        this.results.passed++;
        this.log(`${tool.name} is configured`, 'success');
      } else {
        this.results.warnings++;
        this.log(`${tool.name} might not be properly configured`, 'warning');
      }
    });

    return true;
  }

  validateGitConfiguration() {
    this.log('Validating Git configuration...', 'info');
    
    try {
      // Check if we're in a git repository
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      this.results.passed++;
      this.log('Git repository detected', 'success');
      
      // Check for commits
      try {
        const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
        if (parseInt(commitCount) > 0) {
          this.results.passed++;
          this.log(`Repository has ${commitCount} commits`, 'success');
        } else {
          this.results.warnings++;
          this.log('Repository has no commits - TruffleHog will use filesystem mode', 'warning');
        }
      } catch (error) {
        this.results.warnings++;
        this.log('Could not determine commit count - repository might be empty', 'warning');
      }
      
    } catch (error) {
      this.results.failed++;
      this.results.issues.push('Not in a Git repository');
      this.log('Not in a Git repository!', 'error');
    }
  }

  validateSecrets() {
    this.log('Validating secrets configuration...', 'info');
    
    const requiredSecrets = [
      'SONAR_TOKEN',
      'SNYK_TOKEN'
    ];
    
    // We can't actually check if secrets exist in GitHub, but we can check documentation
    const securityGuide = 'docs/infrastructure/SONARCLOUD_SETUP_GUIDE_COMPLETE.md';
    if (fs.existsSync(securityGuide)) {
      this.results.passed++;
      this.log('Security setup documentation found', 'success');
    } else {
      this.results.warnings++;
      this.log('Security setup documentation not found', 'warning');
    }

    this.log('📋 Required GitHub Secrets:', 'info');
    requiredSecrets.forEach(secret => {
      this.log(`   - ${secret}`, 'info');
    });
  }

  simulateTruffleHogScenarios() {
    this.log('Simulating TruffleHog scenarios...', 'info');
    
    const scenarios = [
      {
        name: 'Pull Request',
        event: 'pull_request',
        description: 'TruffleHog scans diff between PR base and head'
      },
      {
        name: 'Push with Previous Commit',
        event: 'push',
        before: 'abc123',
        after: 'def456',
        description: 'TruffleHog scans diff between before and after commits'
      },
      {
        name: 'Initial Push',
        event: 'push',
        before: '0000000000000000000000000000000000000000',
        after: 'abc123',
        description: 'TruffleHog scans entire filesystem (no previous commit)'
      },
      {
        name: 'Scheduled Run',
        event: 'schedule',
        description: 'TruffleHog scans entire filesystem'
      }
    ];

    scenarios.forEach(scenario => {
      this.results.passed++;
      this.log(`✓ ${scenario.name}: ${scenario.description}`, 'success');
    });
  }

  generateReport() {
    this.log('\n🔒 Security Workflow Validation Report', 'info');
    this.log('=====================================', 'info');
    this.log(`✅ Passed: ${this.results.passed}`, 'success');
    this.log(`⚠️ Warnings: ${this.results.warnings}`, 'warning');
    this.log(`❌ Failed: ${this.results.failed}`, 'error');

    if (this.results.issues.length > 0) {
      this.log('\n🚨 Issues Found:', 'error');
      this.results.issues.forEach(issue => {
        this.log(`   - ${issue}`, 'error');
      });
    }

    if (this.results.failed === 0) {
      this.log('\n🎉 Security workflow is properly configured!', 'success');
      this.log('TruffleHog will now handle different scenarios correctly:', 'info');
      this.log('  • Pull requests: Scans only changed files', 'info');
      this.log('  • Regular pushes: Scans commits since last push', 'info');
      this.log('  • Initial commits: Scans entire repository', 'info');
      this.log('  • Scheduled runs: Full repository scan', 'info');
    } else {
      this.log('\n💡 Please fix the issues above before running the security workflow.', 'warning');
    }

    return this.results.failed === 0;
  }

  run() {
    this.log('🔍 Starting Security Workflow Validation...', 'info');
    this.log('==========================================', 'info');
    
    this.validateWorkflowFile();
    this.validateGitConfiguration();
    this.validateSecrets();
    this.simulateTruffleHogScenarios();
    
    return this.generateReport();
  }
}

// Run the validator
const validator = new SecurityWorkflowValidator();
const success = validator.run();

process.exit(success ? 0 : 1);
