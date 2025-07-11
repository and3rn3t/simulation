#!/usr/bin/env node

/**
 * Custom Preview Domain Setup Helper
 * Guides through setting up custom subdomain for preview deployments
 */

console.log('🌐 Custom Preview Domain Setup Helper');
console.log('====================================\n');

console.log('🎯 GOAL: Set up staging.organisms.andernet.dev for preview deployments\n');

console.log('📋 STEP 1: Cloudflare Pages Dashboard Setup');
console.log('-------------------------------------------');
console.log('1. Go to: https://dash.cloudflare.com/pages');
console.log('2. Click on "organism-simulation" project');
console.log('3. Navigate to Settings → Custom domains');
console.log('4. Click "Set up a custom domain"');
console.log('5. Enter: staging.organisms.andernet.dev');
console.log('6. Select "Preview" environment for this domain');
console.log('7. Click "Continue" and activate the domain\n');

console.log('⚙️  STEP 2: Environment Variables');
console.log('----------------------------------');
console.log('In Cloudflare Pages → Settings → Environment variables:');
console.log('Under "Preview" environment, add:');
console.log('');
console.log('VITE_APP_URL=https://staging.organisms.andernet.dev');
console.log('VITE_ENVIRONMENT=staging');
console.log('VITE_APP_NAME=Organism Simulation (Staging)');
console.log('');

console.log('🧪 STEP 3: Test the Setup');
console.log('--------------------------');
console.log('1. Make a change to develop branch');
console.log('2. Push to trigger preview deployment');
console.log('3. Check that deployment uses custom domain');
console.log('4. Visit: https://staging.organisms.andernet.dev');
console.log('');

console.log('🔍 STEP 4: Verification');
console.log('-----------------------');
console.log('✅ DNS resolves to Cloudflare');
console.log('✅ SSL certificate is active');
console.log('✅ Preview deployments use custom domain');
console.log('✅ Environment variables are properly set');
console.log('');

console.log('💡 DOMAIN STRUCTURE:');
console.log('--------------------');
console.log('Production:  https://organisms.andernet.dev');
console.log('Staging:     https://staging.organisms.andernet.dev');
console.log('Development: https://localhost:5173 (local)');
console.log('');

console.log('🛠️  TROUBLESHOOTING:');
console.log('--------------------');
console.log('• DNS not resolving? Check nameservers point to Cloudflare');
console.log('• SSL issues? Wait 15-30 minutes for certificate provisioning');
console.log('• Domain not used? Verify it\'s set for Preview environment');
console.log('• Still using .pages.dev? Check custom domain activation');
console.log('');

console.log('📞 QUICK COMMANDS:');
console.log('------------------');
console.log('npm run wrangler:validate  # Check wrangler.toml');
console.log('npm run staging:test       # Test staging deployment');
console.log('npm run deploy:check       # Monitor deployments');
console.log('');

console.log('🚀 NEXT STEPS:');
console.log('--------------');
console.log('1. Complete Steps 1-2 in Cloudflare Dashboard');
console.log('2. Test with: git checkout develop && git push origin develop');
console.log('3. Monitor: https://github.com/and3rn3t/simulation/actions');
console.log('4. Verify: https://staging.organisms.andernet.dev loads correctly');

const now = new Date().toLocaleString();
console.log(`\n⏰ Setup guide generated: ${now}`);
console.log('🎉 Custom preview domain will provide professional staging environment!');
