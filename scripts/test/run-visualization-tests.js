#!/usr/bin/env node

/**
 * Test Runner for Enhanced Visualization and User Preferences
 * 
 * This script runs comprehensive tests for the visualization and preferences features
 * that were implemented for the organism simulation project.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running Enhanced Visualization & User Preferences Tests\n');

// Test categories to run
const testCategories = [
  {
    name: 'Unit Tests - Chart Components',
    pattern: 'test/unit/ui/components/ChartComponent.test.ts',
    description: 'Tests for Chart.js integration and chart components'
  },
  {
    name: 'Unit Tests - Heatmap Components', 
    pattern: 'test/unit/ui/components/HeatmapComponent.test.ts',
    description: 'Tests for canvas-based heatmap visualization'
  },
  {
    name: 'Unit Tests - Settings Panel',
    pattern: 'test/unit/ui/components/SettingsPanelComponent.test.ts',
    description: 'Tests for user preferences interface'
  },
  {
    name: 'Unit Tests - User Preferences Manager',
    pattern: 'test/unit/services/UserPreferencesManager.test.ts',
    description: 'Tests for preference persistence and management'
  },
  {
    name: 'Integration Tests - Visualization System',
    pattern: 'test/integration/visualization-system.integration.test.ts',
    description: 'End-to-end tests for complete visualization system'
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function runTestCategory(category) {
  console.log(`${colors.cyan}${colors.bright}📋 ${category.name}${colors.reset}`);
  console.log(`${colors.blue}${category.description}${colors.reset}\n`);
  
  try {
    const testFile = path.join(process.cwd(), category.pattern);
    
    // Check if test file exists
    if (!fs.existsSync(testFile)) {
      console.log(`${colors.yellow}⚠️  Test file not found: ${category.pattern}${colors.reset}\n`);
      return { success: false, reason: 'File not found' };
    }
    
    // Run the test
    const result = execSync(`npx vitest run ${category.pattern}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(`${colors.green}✅ ${category.name} - PASSED${colors.reset}\n`);
    return { success: true };
    
  } catch (error) {
    console.log(`${colors.red}❌ ${category.name} - FAILED${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}\n`);
    return { success: false, reason: error.message };
  }
}

function runAllTests() {
  console.log(`${colors.bright}🚀 Starting Enhanced Visualization & User Preferences Test Suite${colors.reset}\n`);
  
  const results = [];
  let passedTests = 0;
  let failedTests = 0;
  
  for (const category of testCategories) {
    const result = runTestCategory(category);
    results.push({ category: category.name, ...result });
    
    if (result.success) {
      passedTests++;
    } else {
      failedTests++;
    }
  }
  
  // Summary
  console.log(`${colors.bright}📊 Test Summary${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failedTests}${colors.reset}`);
  console.log(`${colors.cyan}📝 Total: ${testCategories.length}${colors.reset}\n`);
  
  // Detailed results
  console.log(`${colors.bright}📋 Detailed Results:${colors.reset}`);
  results.forEach(result => {
    const status = result.success ? 
      `${colors.green}✅ PASS${colors.reset}` : 
      `${colors.red}❌ FAIL${colors.reset}`;
    console.log(`  ${status} ${result.category}`);
    if (!result.success && result.reason) {
      console.log(`    ${colors.yellow}Reason: ${result.reason}${colors.reset}`);
    }
  });
  
  console.log();
  
  if (failedTests === 0) {
    console.log(`${colors.green}${colors.bright}🎉 All tests passed! The enhanced visualization and user preferences features are working correctly.${colors.reset}`);
    return 0;
  } else {
    console.log(`${colors.red}${colors.bright}⚠️  Some tests failed. Please review the errors above and fix the issues.${colors.reset}`);
    return 1;
  }
}

// Feature verification
function verifyFeatureImplementation() {
  console.log(`${colors.bright}🔍 Verifying Enhanced Visualization & User Preferences Implementation${colors.reset}\n`);
  
  const requiredFiles = [
    'src/ui/components/ChartComponent.ts',
    'src/ui/components/HeatmapComponent.ts', 
    'src/ui/components/OrganismTrailComponent.ts',
    'src/ui/components/SettingsPanelComponent.ts',
    'src/ui/components/VisualizationDashboard.ts',
    'src/services/UserPreferencesManager.ts',
    'src/ui/styles/visualization-components.css',
    'public/enhanced-visualization-demo.html'
  ];
  
  let allFilesExist = true;
  
  console.log(`${colors.cyan}📁 Checking required files:${colors.reset}`);
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    const status = exists ? 
      `${colors.green}✅${colors.reset}` : 
      `${colors.red}❌${colors.reset}`;
    console.log(`  ${status} ${file}`);
    if (!exists) allFilesExist = false;
  });
  
  console.log();
  
  if (allFilesExist) {
    console.log(`${colors.green}✅ All required files are present${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Some required files are missing${colors.reset}\n`);
  }
  
  return allFilesExist;
}

// Main execution
function main() {
  console.log(`${colors.bright}Enhanced Visualization & User Preferences Test Suite${colors.reset}`);
  console.log(`${colors.cyan}====================================================${colors.reset}\n`);
  
  // Verify implementation first
  const implementationComplete = verifyFeatureImplementation();
  
  if (!implementationComplete) {
    console.log(`${colors.yellow}⚠️  Implementation appears incomplete. Some tests may fail.${colors.reset}\n`);
  }
  
  // Run tests
  const exitCode = runAllTests();
  
  // Final recommendations
  console.log(`${colors.bright}🔧 Next Steps:${colors.reset}`);
  if (exitCode === 0) {
    console.log(`${colors.green}1. ✅ All tests passed - features are ready for production${colors.reset}`);
    console.log(`${colors.green}2. ✅ Integration with main simulation can proceed${colors.reset}`);
    console.log(`${colors.green}3. ✅ Demo page is available at /public/enhanced-visualization-demo.html${colors.reset}`);
  } else {
    console.log(`${colors.yellow}1. 🔧 Fix failing tests before proceeding${colors.reset}`);
    console.log(`${colors.yellow}2. 🔧 Review error messages and update implementations${colors.reset}`);
    console.log(`${colors.yellow}3. 🔧 Re-run tests after fixes: npm run test:visualization${colors.reset}`);
  }
  
  console.log();
  process.exit(exitCode);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runAllTests, verifyFeatureImplementation };
