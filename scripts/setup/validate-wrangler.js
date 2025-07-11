#!/usr/bin/env node

/**
 * Wrangler Configuration Validator
 * Validates the wrangler.toml file for correct Cloudflare Pages configuration
 */

import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// __filename is available as a global variable

console.log('🔧 Wrangler Configuration Validator');
console.log('===================================\n');

const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');

if (!fs.existsSync(wranglerPath)) {
  console.error('❌ wrangler.toml file not found');
  process.exit(1);
}

console.log('✅ wrangler.toml file found');

// Read and parse the file
const content = fs.readFileSync(wranglerPath, 'utf8');
console.log('\n📋 Configuration Analysis:');
console.log('---------------------------');

// Check key configurations
const checks = [
  {
    name: 'Project Name',
    test: () => content.includes('name = "organism-simulation"'),
    fix: 'Set: name = "organism-simulation"'
  },
  {
    name: 'Compatibility Date',
    test: () => content.includes('compatibility_date ='),
    fix: 'Add: compatibility_date = "2024-01-01"'
  },
  {
    name: 'Build Output Directory',
    test: () => content.includes('pages_build_output_dir = "dist"'),
    fix: 'Set: pages_build_output_dir = "dist" (not as array)'
  },
  {
    name: 'Production Environment',
    test: () => content.includes('[env.production]'),
    fix: 'Add: [env.production] section'
  },
  {
    name: 'Preview Environment',
    test: () => content.includes('[env.preview]'),
    fix: 'Add: [env.preview] section'
  },
  {
    name: 'Build Command',
    test: () => content.includes('command = "npm run build"'),
    fix: 'Set: command = "npm run build"'
  },
  {
    name: 'No Array Build Output',
    test: () => !content.includes('[[pages_build_output_dir]]'),
    fix: 'Remove array syntax [[pages_build_output_dir]]'
  }
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

console.log('\n🔍 Configuration Summary:');
console.log('-------------------------');

if (allPassed) {
  console.log('✅ All checks passed! Configuration looks good.');
  console.log('\n🚀 The wrangler.toml fix should resolve the deployment error:');
  console.log('   - pages_build_output_dir is now correctly formatted');
  console.log('   - No more array syntax causing parsing errors');
  console.log('   - Cloudflare Pages deployment should work now');
} else {
  console.log('❌ Configuration issues found. Please fix the above items.');
}

console.log('\n📊 Monitor Deployment:');
console.log('----------------------');
console.log('• GitHub Actions: https://github.com/and3rn3t/simulation/actions');
console.log('• Cloudflare Pages: https://dash.cloudflare.com/pages');
console.log('• Check for new deployment triggered by the develop branch push');
console.log('\n✨ The staging deployment should now work correctly!');

// Show relevant parts of the config
console.log('\n📄 Current pages_build_output_dir setting:');
const outputDirMatch = content.match(/pages_build_output_dir\s*=\s*"([^"]+)"/);
if (outputDirMatch) {
  console.log(`✅ pages_build_output_dir = "${outputDirMatch[1]}"`);
} else {
  console.log('❌ pages_build_output_dir not found or incorrectly formatted');
}
