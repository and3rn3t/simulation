#!/usr/bin/env node
/* eslint-env node */

/**
 * Project Management Workflow Troubleshooter
 * Identifies and helps resolve common project management workflow issues
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Secure command execution with allowlist
 */
const ALLOWED_GIT_COMMANDS = [
  'git rev-parse --is-inside-work-tree',
  'git remote -v',
  'git branch --show-current',
  'git show-ref --verify --quiet refs/heads/develop',
  'git rev-parse --git-dir',
  'git rev-list --count HEAD',
];

const ALLOWED_FIND_COMMANDS = [
  'find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*"',
];

/**
 * Securely execute a command from allowlist
 * @param {string} command - Command to execute
 * @param {Object} options - Execution options
 * @returns {string} Command output
 */
function secureExecSync(command, options = {}) {
  const allowedCommands = [...ALLOWED_GIT_COMMANDS, ...ALLOWED_FIND_COMMANDS];

  // Security check: Only allow whitelisted commands
  if (!allowedCommands.includes(command)) {
    throw new Error(`Command not allowed for security reasons: ${command}`);
  }

  const safeOptions = {
    encoding: 'utf8',
    timeout: 10000, // 10 second timeout
    ...options,
  };

  return execSync(command, safeOptions);
}

console.log('🔧 Project Management Workflow Troubleshooter');
console.log('==============================================\n');

class WorkflowTroubleshooter {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
  }

  // Check GitHub integration setup
  checkGitHubIntegration() {
    console.log('📋 Checking GitHub Integration Setup...');

    const integrationDir = path.join(process.cwd(), 'github-integration');

    if (!fs.existsSync(integrationDir)) {
      this.issues.push('GitHub integration directory missing');
      this.recommendations.push(
        'Run: npm run github:setup or node scripts/github-integration-setup.js'
      );
      return false;
    }

    // Check required files
    const requiredFiles = ['labels.json', 'milestones.json', 'project-config.json', 'README.md'];
    const missingFiles = requiredFiles.filter(
      file => !fs.existsSync(path.join(integrationDir, file))
    );

    if (missingFiles.length > 0) {
      this.issues.push(`Missing integration files: ${missingFiles.join(', ')}`);
      this.recommendations.push('Run: node scripts/github-integration-setup.js');
    }

    // Check issues directory
    const issuesDir = path.join(integrationDir, 'issues');
    if (!fs.existsSync(issuesDir)) {
      this.warnings.push('No issues directory found - may need to generate initial issues');
    } else {
      const issueFiles = fs.readdirSync(issuesDir).filter(f => f.endsWith('.md'));
      console.log(`   ✅ Found ${issueFiles.length} generated issue templates`);
    }

    console.log('   ✅ GitHub integration setup looks good\n');
    return true;
  }

  // Check workflow files
  checkWorkflowFiles() {
    console.log('🔄 Checking GitHub Actions Workflows...');

    const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
    const requiredWorkflows = ['ci-cd.yml', 'project-management.yml'];

    for (const workflow of requiredWorkflows) {
      const workflowPath = path.join(workflowsDir, workflow);
      if (!fs.existsSync(workflowPath)) {
        this.issues.push(`Missing workflow: ${workflow}`);
      } else {
        console.log(`   ✅ ${workflow} exists`);

        // Check workflow content
        const content = fs.readFileSync(workflowPath, 'utf8');

        if (workflow === 'ci-cd.yml') {
          this.checkCIWorkflow(content);
        } else if (workflow === 'project-management.yml') {
          this.checkProjectManagementWorkflow(content);
        }
      }
    }
    console.log('');
  }

  checkCIWorkflow(content) {
    // Check for required secrets
    const requiredSecrets = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'];
    const missingSecrets = requiredSecrets.filter(secret => !content.includes(`secrets.${secret}`));

    if (missingSecrets.length > 0) {
      this.warnings.push(`CI workflow missing secrets: ${missingSecrets.join(', ')}`);
      this.recommendations.push('Add missing secrets to GitHub repository settings');
    }

    // Check for environment configurations
    if (!content.includes('environment:')) {
      this.warnings.push('No environment protection configured in CI workflow');
    }
  }

  checkProjectManagementWorkflow(content) {
    // Check for project automation
    if (!content.includes('add-to-project')) {
      this.warnings.push('No automatic project assignment configured');
      this.recommendations.push('Consider adding GitHub project automation');
    }
  }

  // Check issue templates
  checkIssueTemplates() {
    console.log('📝 Checking Issue Templates...');

    const templatesDir = path.join(process.cwd(), '.github', 'ISSUE_TEMPLATE');

    if (!fs.existsSync(templatesDir)) {
      this.warnings.push('No issue templates directory found');
      this.recommendations.push('Create issue templates for consistent issue creation');
      return;
    }

    const templates = fs
      .readdirSync(templatesDir)
      .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    console.log(`   ✅ Found ${templates.length} issue templates`);

    // Check for required templates
    const expectedTemplates = [
      'bug-report',
      'feature-request',
      'epic-feature',
      'implementation-task',
    ];
    const missingTemplates = expectedTemplates.filter(
      template => !templates.some(t => t.includes(template))
    );

    if (missingTemplates.length > 0) {
      this.warnings.push(`Missing issue templates: ${missingTemplates.join(', ')}`);
    }
    console.log('');
  }

  // Check project scripts
  checkProjectScripts() {
    console.log('📦 Checking Project Scripts...');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const projectManagementScripts = ['workflow:validate', 'env:check', 'quality:check'];

    const missingScripts = projectManagementScripts.filter(script => !packageJson.scripts[script]);

    if (missingScripts.length > 0) {
      this.warnings.push(`Missing package.json scripts: ${missingScripts.join(', ')}`);
    } else {
      console.log('   ✅ All project management scripts available');
    }
    console.log('');
  }

  // Check Git configuration
  checkGitConfiguration() {
    console.log('🔧 Checking Git Configuration...');

    try {
      // Check if we're in a git repository
      secureExecSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
      console.log('   ✅ Git repository detected');

      // Check remote configuration
      const remotes = secureExecSync('git remote -v');
      if (remotes.includes('github.com')) {
        console.log('   ✅ GitHub remote configured');
      } else {
        this.issues.push('No GitHub remote configured');
      }

      // Check current branch
      const currentBranch = secureExecSync('git branch --show-current').trim();
      console.log(`   📍 Current branch: ${currentBranch}`);

      // Check for develop branch (needed for staging deployments)
      try {
        secureExecSync('git show-ref --verify --quiet refs/heads/develop', { stdio: 'ignore' });
        console.log('   ✅ Develop branch exists');
      } catch {
        this.warnings.push('No develop branch found - needed for staging deployments');
        this.recommendations.push(
          'Create develop branch: git checkout -b develop && git push -u origin develop'
        );
      }
    } catch {
      this.issues.push('Not in a Git repository or Git not available');
    }
    console.log('');
  }

  // Check environment files
  checkEnvironmentFiles() {
    console.log('🌍 Checking Environment Configuration...');

    const envFiles = ['.env.development', '.env.staging', '.env.production'];
    const missingEnvFiles = envFiles.filter(file => !fs.existsSync(file));

    if (missingEnvFiles.length > 0) {
      this.warnings.push(`Missing environment files: ${missingEnvFiles.join(', ')}`);
      this.recommendations.push('Run: npm run env:check to see setup guide');
    } else {
      console.log('   ✅ All environment files present');
    }
    console.log('');
  }

  // Check for common project management issues
  checkCommonIssues() {
    console.log('🕵️ Checking for Common Issues...');

    // Check for large files that might cause issues
    const largeFiles = this.findLargeFiles();
    if (largeFiles.length > 0) {
      this.warnings.push(`Large files detected: ${largeFiles.join(', ')}`);
      this.recommendations.push('Consider using Git LFS for large files');
    }

    // Check for node_modules in git
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      if (!gitignore.includes('node_modules')) {
        this.issues.push('node_modules not in .gitignore');
      }
    }

    console.log('   ✅ Common issues check completed');
    console.log('');
  }

  findLargeFiles() {
    // Simple check for files over 10MB
    const largeFiles = [];
    try {
      const files = secureExecSync(
        'find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*"'
      ).trim();
      if (files) {
        largeFiles.push(...files.split('\n'));
      }
    } catch {
      // find command not available on Windows or not allowed
    }
    return largeFiles;
  }

  // Run all checks
  async runAllChecks() {
    console.log('🚀 Starting comprehensive project management workflow check...\n');

    this.checkGitHubIntegration();
    this.checkWorkflowFiles();
    this.checkIssueTemplates();
    this.checkProjectScripts();
    this.checkGitConfiguration();
    this.checkEnvironmentFiles();
    this.checkCommonIssues();

    this.generateReport();
  }

  // Generate troubleshooting report
  generateReport() {
    console.log('📊 TROUBLESHOOTING REPORT');
    console.log('========================\n');

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('🎉 No issues found! Your project management workflow looks healthy.\n');
      this.showOptimizationTips();
      return;
    }

    if (this.issues.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      this.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️ WARNINGS:');
      this.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
      console.log('');
    }

    if (this.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:');
      this.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
      console.log('');
    }

    this.showQuickFixes();
  }

  showQuickFixes() {
    console.log('🔧 QUICK FIXES:');
    console.log('===============');
    console.log('1. Run environment check: npm run env:check');
    console.log('2. Validate workflows: npm run workflow:validate');
    console.log('3. Generate GitHub issues: node scripts/github-integration-setup.js');
    console.log('4. Check code quality: npm run quality:check');
    console.log('5. Test CI pipeline: git push origin develop');
    console.log('');
  }

  showOptimizationTips() {
    console.log('🚀 OPTIMIZATION TIPS:');
    console.log('=====================');
    console.log('1. Set up GitHub project board with generated config');
    console.log('2. Create milestones from generated-milestones.json');
    console.log('3. Add GitHub secrets for CI/CD deployment');
    console.log('4. Enable branch protection rules');
    console.log('5. Set up automated project management workflows');
    console.log('');
    console.log('📖 For detailed setup: see github-integration/README.md');
  }
}

// Run the troubleshooter
const troubleshooter = new WorkflowTroubleshooter();
troubleshooter.runAllChecks().catch(console.error);
