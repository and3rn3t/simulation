#!/usr/bin/env node

/**
 * Deployment Status Checker
 * Provides links and instructions to check CI/CD deployment status
 */

console.log('🚀 Deployment Status Checker');
console.log('============================\n');

console.log('📊 GitHub Actions Status:');
console.log('https://github.com/and3rn3t/simulation/actions\n');

console.log('☁️  Cloudflare Pages Deployments:');
console.log('https://dash.cloudflare.com/pages\n');

console.log('🔍 What to Check:');
console.log('------------------');
console.log('1. GitHub Actions: Look for the latest workflow run');
console.log('   • ✅ All jobs should be green (test, security, build, deploy-production)');
console.log('   • 🟡 Yellow means in progress');
console.log('   • ❌ Red means failed - check logs');
console.log('');
console.log('2. Cloudflare Pages: Check deployment status');
console.log('   • Look for "organism-simulation" project');
console.log('   • Latest deployment should show as "Success"');
console.log('   • Note the deployment URL');
console.log('');

console.log('🌐 Live Site URLs:');
console.log('-------------------');
console.log('Production: https://organisms.andernet.dev');
console.log('Cloudflare: https://organism-simulation.pages.dev');
console.log('');

console.log('🔧 Troubleshooting:');
console.log('--------------------');
console.log('If deployment fails:');
console.log('1. Check GitHub Actions logs for error details');
console.log('2. Verify secrets are correctly set in both environments');
console.log('3. Check Cloudflare Pages project settings');
console.log('4. Run: npm run env:check');
console.log('');

console.log('✅ Success Indicators:');
console.log('-----------------------');
console.log('□ GitHub Actions workflow completed successfully');
console.log('□ Cloudflare Pages deployment shows "Success"');
console.log('□ Live site loads with your latest changes');
console.log('□ No errors in browser console');
console.log('');

// Get current timestamp
const now = new Date();
console.log(`⏰ Last checked: ${now.toLocaleString()}`);
console.log('💡 Tip: Refresh the GitHub Actions page to see live updates');
