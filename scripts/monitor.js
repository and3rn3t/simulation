#!/usr/bin/env node

// Deployment Monitor Script
// Monitors deployment status and sends notifications

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  environments: {
    staging: {
      url: 'https://staging.organism-simulation.com',
      healthEndpoint: '/health',
      expectedStatus: 200,
      timeout: 10000
    },
    production: {
      url: 'https://organism-simulation.com',
      healthEndpoint: '/health',
      expectedStatus: 200,
      timeout: 10000
    }
  },
  notifications: {
    slack: process.env.SLACK_WEBHOOK,
    discord: process.env.DISCORD_WEBHOOK
  }
};

async function checkHealth(environment) {
  const env = config.environments[environment];
  if (!env) {
    throw new Error(`Unknown environment: ${environment}`);
  }

  const url = env.url + env.healthEndpoint;
  console.log(`🏥 Checking health for ${environment}: ${url}`);

  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: env.timeout }, (res) => {
      const isHealthy = res.statusCode === env.expectedStatus;
      
      console.log(`📊 Status: ${res.statusCode} ${isHealthy ? '✅' : '❌'}`);
      
      resolve({
        environment,
        url,
        status: res.statusCode,
        healthy: isHealthy,
        timestamp: new Date().toISOString()
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Health check failed for ${environment}:`, error.message);
      resolve({
        environment,
        url,
        status: 0,
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`⏰ Health check timeout for ${environment}`);
      resolve({
        environment,
        url,
        status: 0,
        healthy: false,
        error: 'Timeout',
        timestamp: new Date().toISOString()
      });
    });
  });
}

async function sendNotification(message, isError = false) {
  const webhook = config.notifications.slack;
  if (!webhook) {
    console.log('📢 No webhook configured, notification skipped');
    return;
  }

  const payload = {
    text: message,
    username: 'Deployment Monitor',
    icon_emoji: isError ? ':red_circle:' : ':green_circle:'
  };

  // Implementation would depend on your notification service
  console.log(`📢 Notification: ${message}`);
}

async function monitorEnvironment(environment) {
  try {
    const result = await checkHealth(environment);
    
    if (result.healthy) {
      console.log(`✅ ${environment} is healthy`);
      await sendNotification(`✅ ${environment} deployment is healthy and running normally`);
    } else {
      console.error(`❌ ${environment} is unhealthy`);
      await sendNotification(
        `❌ ${environment} deployment is unhealthy: ${result.error || `Status ${result.status}`}`,
        true
      );
    }

    return result;
  } catch (error) {
    console.error(`💥 Monitor error for ${environment}:`, error.message);
    await sendNotification(`💥 Monitor error for ${environment}: ${error.message}`, true);
    return null;
  }
}

async function main() {
  const environment = process.argv[2];
  const action = process.argv[3] || 'check';

  if (action === 'check') {
    if (environment) {
      console.log(`🔍 Monitoring single environment: ${environment}`);
      await monitorEnvironment(environment);
    } else {
      console.log('🔍 Monitoring all environments');
      const environments = Object.keys(config.environments);
      const results = await Promise.all(
        environments.map(env => monitorEnvironment(env))
      );
      
      const summary = results.filter(r => r).reduce((acc, result) => {
        acc[result.environment] = result.healthy;
        return acc;
      }, {});
      
      console.log('\n📋 Health Summary:');
      Object.entries(summary).forEach(([env, healthy]) => {
        console.log(`  ${env}: ${healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      });
    }
  } else if (action === 'watch') {
    console.log(`👀 Starting continuous monitoring for ${environment || 'all environments'}`);
    const interval = 60000; // 1 minute
    
    setInterval(async () => {
      if (environment) {
        await monitorEnvironment(environment);
      } else {
        const environments = Object.keys(config.environments);
        await Promise.all(environments.map(env => monitorEnvironment(env)));
      }
      console.log(`⏰ Next check in ${interval / 1000} seconds...`);
    }, interval);
  } else {
    console.error('❌ Unknown action. Use: check, watch');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Monitoring stopped');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Monitor failed:', error);
    process.exit(1);
  });
}
