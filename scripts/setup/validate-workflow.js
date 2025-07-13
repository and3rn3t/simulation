#!/usr/bin/env node

/**
 * GitHub Actions Workflow Validator
 * Checks CI/CD workflow configuration for common issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 GitHub Actions Workflow Validator');
console.log('====================================\n');

const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'ci-cd.yml');

if (!fs.existsSync(workflowPath)) {
  console.error('❌ CI/CD workflow file not found');
  process.exit(1);
}

console.log('✅ CI/CD workflow file found');

const content = fs.readFileSync(workflowPath, 'utf8');

console.log('\n📋 Configuration Analysis:');
console.log('---------------------------');

// Check environment configurations
const checks = [
  {
    name: 'Staging Environment Format',
    test: () => {
      // Fixed: More specific regex to avoid ReDoS vulnerability
      const stagingEnvRegex = /deploy-staging:[^}]*environment:\s*name:\s*staging/;
      return stagingEnvRegex.test(content);
    },
    fix: 'Use: environment:\\n  name: staging',
  },
  {
    name: 'Production Environment Format',
    test: () => {
      // Fixed: More specific regex to avoid ReDoS vulnerability
      const productionEnvRegex = /deploy-production:[^}]*environment:\s*name:\s*production/;
      return productionEnvRegex.test(content);
    },
    fix: 'Use: environment:\\n  name: production',
  },
  {
    name: 'Staging Branch Condition',
    test: () => content.includes("github.ref == 'refs/heads/develop'"),
    fix: "Add: if: github.ref == 'refs/heads/develop'",
  },
  {
    name: 'Production Branch Condition',
    test: () => content.includes("github.ref == 'refs/heads/main'"),
    fix: "Add: if: github.ref == 'refs/heads/main'",
  },
  {
    name: 'Cloudflare API Token Secret',
    test: () => content.includes('secrets.CLOUDFLARE_API_TOKEN'),
    fix: 'Add CLOUDFLARE_API_TOKEN to environment secrets',
  },
  {
    name: 'Cloudflare Account ID Secret',
    test: () => content.includes('secrets.CLOUDFLARE_ACCOUNT_ID'),
    fix: 'Add CLOUDFLARE_ACCOUNT_ID to environment secrets',
  },
  {
    name: 'Build Dependencies',
    test: () => {
      // Fixed: More specific regex patterns to avoid ReDoS vulnerability
      const stagingNeedsBuild = /deploy-staging:[^}]*needs:\s*build/.test(content);
      const productionNeedsBuild = /deploy-production:[^}]*needs:\s*build/.test(content);
      return stagingNeedsBuild && productionNeedsBuild;
    },
    fix: 'Ensure both deploy jobs have: needs: build',
  },
  {
    name: 'Project Name Consistency',
    test: () => {
      const projectNameMatches = content.match(/projectName:\s*organism-simulation/g);
      return projectNameMatches && projectNameMatches.length >= 2;
    },
    fix: 'Use consistent projectName: organism-simulation',
  },
];

let allPassed = true;

checks.forEach(check => {
  const passed = check.test();
  console.log(`${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) {
    console.log(`   💡 Fix: ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n🔍 Environment Configuration Summary:');
console.log('-------------------------------------');

if (allPassed) {
  console.log('✅ All checks passed! Workflow configuration looks good.');
  console.log('\n🎯 The environment configurations are now correct:');
  console.log('   • Staging: environment.name = "staging"');
  console.log('   • Production: environment.name = "production"');
  console.log('   • Both use proper YAML format');
} else {
  console.log('❌ Configuration issues found. Please fix the above items.');
}

console.log('\n📊 Expected Workflow Behavior:');
console.log('------------------------------');
console.log('🌿 develop branch → deploy-staging job → staging environment');
console.log('🌟 main branch → deploy-production job → production environment');
console.log('🔐 Both require environment secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID');

console.log('\n🛠️  Environment Setup Status:');
console.log('------------------------------');
console.log('• GitHub Environments: https://github.com/and3rn3t/simulation/settings/environments');
console.log('• Check that "staging" and "production" environments exist');
console.log('• Verify secrets are added to BOTH environments');

const now = new Date().toLocaleString();
console.log(`\n⏰ Validation completed: ${now}`);
console.log('🚀 Workflow should now deploy correctly to both environments!');
