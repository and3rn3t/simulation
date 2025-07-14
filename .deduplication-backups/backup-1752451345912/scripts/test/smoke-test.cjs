#!/usr/bin/env node
/* eslint-env node */
/* global process, console */

const https = require('https');

/**
 * Simple smoke test for deployed environments
 * Tests basic functionality of the deployed application
 */

const environment = process.argv[2] || 'staging';
const timeout = 30000; // 30 seconds

// Environment URLs
const urls = {
  staging: 'https://organism-simulation-staging.pages.dev',
  production: 'https://organism-simulation.pages.dev',
};

const testUrl = urls[environment];

if (!testUrl) {
  console.error(`❌ Unknown environment: ${environment}`);
  console.error(`Available environments: ${Object.keys(urls).join(', ')}`);
  process.exit(1);
}

console.log(`🔍 Running smoke tests for ${environment} environment`);
console.log(`🌐 Testing URL: ${testUrl}`);

/**
 * Test if the main page loads successfully
 */
function testMainPage() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    https
      .get(testUrl, { timeout }, res => {
        const duration = Date.now() - startTime;

        if (res.statusCode === 200) {
          console.log(`✅ Main page loaded successfully (${res.statusCode}) in ${duration}ms`);
          resolve(true);
        } else {
          console.error(`❌ Main page failed with status: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      })
      .on('error', err => {
        console.error(`❌ Main page request failed: ${err.message}`);
        reject(err);
      })
      .on('timeout', () => {
        console.error(`❌ Main page request timed out after ${timeout}ms`);
        reject(new Error('Request timeout'));
      });
  });
}

/**
 * Test if assets are served correctly
 */
function testAssets() {
  return new Promise((resolve, reject) => {
    const assetUrl = `${testUrl}/assets`;

    https
      .get(assetUrl, { timeout }, res => {
        if (res.statusCode === 200 || res.statusCode === 403) {
          // 403 is expected for directory listing, which means assets directory exists
          console.log(`✅ Assets directory accessible (${res.statusCode})`);
          resolve(true);
        } else {
          console.error(`❌ Assets check failed with status: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      })
      .on('error', err => {
        console.error(`❌ Assets request failed: ${err.message}`);
        reject(err);
      })
      .on('timeout', () => {
        console.error(`❌ Assets request timed out after ${timeout}ms`);
        reject(new Error('Request timeout'));
      });
  });
}

/**
 * Run all smoke tests
 */
async function runSmokeTests() {
  try {
    console.log('🚀 Starting smoke tests...\n');

    await testMainPage();
    await testAssets();

    console.log('\n🎉 All smoke tests passed!');
    console.log(`✅ ${environment} deployment is healthy`);
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Smoke tests failed!');
    console.error(`❌ ${environment} deployment has issues`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
runSmokeTests();
