#!/usr/bin/env node

/**
 * GitHub Environment Setup Validator
 * Provides instructions for setting up GitHub environments and secrets
 */

console.log('🚀 GitHub Environment Setup Guide');
console.log('==================================\n');

console.log('📍 Repository: https://github.com/and3rn3t/simulation\n');

console.log('🔧 Step 1: Create GitHub Environments');
console.log('--------------------------------------');
console.log('1. Go to: https://github.com/and3rn3t/simulation/settings/environments');
console.log('2. Create two environments:');
console.log('   - Name: "staging"');
console.log('     • Deployment branches: develop');
console.log('     • Required reviewers: (optional)');
console.log('     • Wait timer: 0 minutes');
console.log('');
console.log('   - Name: "production"');
console.log('     • Deployment branches: main');
console.log('     • Required reviewers: Add yourself');
console.log('     • Wait timer: 5 minutes');
console.log('');

console.log('🔐 Step 2: Add Environment Secrets');
console.log('-----------------------------------');
console.log('For BOTH "staging" and "production" environments, add these secrets:');
console.log('');
console.log('Secret 1: CLOUDFLARE_API_TOKEN');
console.log('  ❓ How to get: https://dash.cloudflare.com/profile/api-tokens');
console.log('  📝 Create token with permissions:');
console.log('     • Cloudflare Pages:Edit');
console.log('     • Account:Read');
console.log('     • Zone:Read');
console.log('');
console.log('Secret 2: CLOUDFLARE_ACCOUNT_ID');
console.log('  ❓ How to get: https://dash.cloudflare.com/');
console.log('  📝 Copy from right sidebar "Account ID"');
console.log('');

console.log('☁️  Step 3: Setup Cloudflare Pages');
console.log('-----------------------------------');
console.log('1. Go to: https://dash.cloudflare.com/pages');
console.log('2. Create a project:');
console.log('   • Connect to Git: simulation repository');
console.log('   • Project name: organism-simulation');
console.log('   • Production branch: main');
console.log('   • Build command: npm run build');
console.log('   • Build output: dist');
console.log('');

console.log('🔍 Step 4: Verify Setup');
console.log('------------------------');
console.log('Run: npm run env:check');
console.log('');

console.log('✅ Quick Checklist:');
console.log('-------------------');
console.log('□ GitHub "staging" environment created');
console.log('□ GitHub "production" environment created');
console.log('□ CLOUDFLARE_API_TOKEN added to both environments');
console.log('□ CLOUDFLARE_ACCOUNT_ID added to both environments');
console.log('□ Cloudflare Pages project "organism-simulation" created');
console.log('□ Test deployment successful');
console.log('');

console.log('🆘 Need Help?');
console.log('-------------');
console.log('• Full guide: docs/ENVIRONMENT_SETUP_GUIDE.md');
console.log('• Check configuration: npm run env:check');
console.log('• GitHub Environments: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment');
console.log('• Cloudflare Pages: https://developers.cloudflare.com/pages/');
