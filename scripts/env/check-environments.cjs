#!/usr/bin/env node

/**
 * Environment Configuration Checker
 * Validates GitHub and Cloudflare environment setup for CI/CD pipeline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Environment Configuration Checker');
console.log('=====================================');

// Check if we're in a Git repository
function checkGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    console.log('✅ Git repository detected');
    return true;
  } catch (_) {
    console.log('❌ Not in a Git repository');
    return false;
  }
}

// Check GitHub remote
function checkGitHubRemote() {
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    if (remote.includes('github.com') && remote.includes('simulation')) {
      console.log('✅ GitHub remote configured:', remote);
      return true;
    } else {
      console.log('⚠️  GitHub remote might not be correct:', remote);
      return false;
    }
  } catch (_) {
    console.log('❌ Could not get Git remote');
    return false;
  }
}

// Check current branch
function checkCurrentBranch() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📍 Current branch: ${branch}`);
    
    if (branch === 'main' || branch === 'develop') {
      console.log('✅ On main deployment branch');
    } else {
      console.log('ℹ️  On feature branch (normal for development)');
    }
    
    return branch;
  } catch (error) {
    console.log('❌ Could not determine current branch');
    return null;
  }
}

// Check CI/CD workflow file
function checkWorkflowFile() {
  const workflowPath = path.join(__dirname, '..', '..', '.github', 'workflows', 'ci-cd.yml');
  
  if (fs.existsSync(workflowPath)) {
    console.log('✅ CI/CD workflow file exists');
    
    const content = fs.readFileSync(workflowPath, 'utf8');
    
    // Check for environment references
    const hasStaging = content.includes('name: staging');
    const hasProduction = content.includes('name: production');
    const hasCloudflareAction = content.includes('cloudflare/pages-action');
    
    console.log(`${hasStaging ? '✅' : '❌'} Staging environment configured`);
    console.log(`${hasProduction ? '✅' : '❌'} Production environment configured`);
    console.log(`${hasCloudflareAction ? '✅' : '❌'} Cloudflare Pages action configured`);
    
    return { hasStaging, hasProduction, hasCloudflareAction };
  } else {
    console.log('❌ CI/CD workflow file not found');
    return null;
  }
}

// Check Cloudflare configuration
function checkCloudflareConfig() {
  const wranglerPath = path.join(__dirname, '..', '..', 'wrangler.toml');
  
  if (fs.existsSync(wranglerPath)) {
    console.log('✅ Cloudflare wrangler.toml exists');
    
    const content = fs.readFileSync(wranglerPath, 'utf8');
    
    const hasProduction = content.includes('[env.production.vars]') || content.includes('[env.production]');
    const hasPreview = content.includes('[env.preview.vars]') || content.includes('[env.preview]');
    const hasProjectName = content.includes('name = "organism-simulation"');
    
    console.log(`${hasProduction ? '✅' : '❌'} Production environment in wrangler.toml`);
    console.log(`${hasPreview ? '✅' : '❌'} Preview environment in wrangler.toml`);
    console.log(`${hasProjectName ? '✅' : '❌'} Project name configured`);
    
    return { hasProduction, hasPreview, hasProjectName };
  } else {
    console.log('❌ Cloudflare wrangler.toml not found');
    return null;
  }
}

// Check environment files
function checkEnvironmentFiles() {
  const envFiles = ['.env.development', '.env.staging', '.env.production'];
  const results = {};
  
  envFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', '..', file);
    const exists = fs.existsSync(filePath);
    console.log(`${exists ? '✅' : '⚠️'} ${file} ${exists ? 'exists' : 'missing'}`);
    results[file] = exists;
  });
  
  return results;
}

// Check package.json scripts
function checkPackageScripts() {
  const packagePath = path.join(__dirname, '..', '..', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = pkg.scripts || {};
    
    const requiredScripts = [
      'build',
      'dev',
      'test',
      'lint',
      'type-check'
    ];
    
    console.log('\n📦 Package.json scripts:');
    requiredScripts.forEach(script => {
      const exists = scripts[script];
      console.log(`${exists ? '✅' : '❌'} ${script}: ${exists || 'missing'}`);
    });
    
    return scripts;
  } else {
    console.log('❌ package.json not found');
    return null;
  }
}

// Main function
function main() {
  console.log('\n🔍 Checking Git setup...');
  const isGitRepo = checkGitRepository();
  if (isGitRepo) {
    checkGitHubRemote();
    checkCurrentBranch();
  }
  
  console.log('\n🔍 Checking CI/CD configuration...');
  checkWorkflowFile();
  
  console.log('\n🔍 Checking Cloudflare configuration...');
  checkCloudflareConfig();
  
  console.log('\n🔍 Checking environment files...');
  checkEnvironmentFiles();
  
  console.log('\n🔍 Checking build configuration...');
  checkPackageScripts();
  
  console.log('\n📋 Next Steps:');
  console.log('1. Visit your GitHub repository settings to configure environments');
  console.log('2. Go to: https://github.com/and3rn3t/simulation/settings/environments');
  console.log('3. Create "staging" and "production" environments');
  console.log('4. Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID secrets');
  console.log('5. Set up Cloudflare Pages project: https://dash.cloudflare.com/pages');
  console.log('\n📖 Full setup guide: docs/ENVIRONMENT_SETUP_GUIDE.md');
}

main();
