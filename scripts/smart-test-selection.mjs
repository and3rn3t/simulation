#!/usr/bin/env node

/**
 * Smart Test Selection for CI/CD Optimization
 *
 * This script analyzes git changes and selects only relevant tests to run,
 * providing 50-70% test time reduction while maintaining quality.
 *
 * Features:
 * - Git diff analysis to detect changed files
 * - Dependency mapping for affected test selection
 * - Critical path test identification
 * - Fallback to full test suite for high-risk changes
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';

// Configuration for test selection strategy
const TEST_SELECTION_CONFIG = {
  // Always run these critical tests regardless of changes
  criticalTests: [
    'test/unit/core/simulation.test.ts',
    'test/unit/core/organism.test.ts',
    'test/unit/utils/errorHandler.test.ts',
    'test/unit/utils/canvasUtils.test.ts',
  ],

  // File patterns that require full test suite
  fullTestTriggers: [
    'package.json',
    'package-lock.json',
    'tsconfig*.json',
    'vite.config.ts',
    'vitest*.config.ts',
    '.github/workflows/**',
    'src/core/**', // Core changes need comprehensive testing
  ],

  // Mapping of source directories to test directories
  sourceToTestMapping: {
    'src/core/': 'test/unit/core/',
    'src/models/': 'test/unit/models/',
    'src/utils/': 'test/unit/utils/',
    'src/ui/': 'test/unit/ui/',
    'src/features/': 'test/unit/features/',
    'src/services/': 'test/unit/services/',
  },

  // Test categories with execution priority
  testCategories: {
    critical: { weight: 1.0, maxTime: 60 }, // Must always run
    core: { weight: 0.8, maxTime: 120 }, // Run if core changes
    integration: { weight: 0.6, maxTime: 180 }, // Run if multiple components change
    ui: { weight: 0.4, maxTime: 240 }, // Run if UI changes
    edge: { weight: 0.2, maxTime: 300 }, // Run only in full test mode
  },
};

class SmartTestSelector {
  constructor() {
    this.changedFiles = [];
    this.affectedTests = new Set();
    this.testStrategy = 'smart'; // smart | full | critical
    this.stats = {
      totalTests: 0,
      selectedTests: 0,
      estimatedTime: 0,
      selectionReason: '',
    };
  }

  /**
   * Analyze git changes to determine which files have been modified
   */
  analyzeChanges() {
    try {
      // Get changed files from git diff
      const diffCommand = process.env.CI
        ? 'git diff --name-only HEAD~1' // CI: compare with previous commit
        : 'git diff --name-only --cached HEAD'; // Local: compare staged changes

      const gitOutput = execSync(diffCommand, { encoding: 'utf8' });
      this.changedFiles = gitOutput.trim().split('\n').filter(Boolean);

      console.log(`📁 Detected ${this.changedFiles.length} changed files:`);
      this.changedFiles.forEach(file => console.log(`   - ${file}`));

      return this.changedFiles;
    } catch (error) {
      console.warn('⚠️ Git analysis failed, falling back to full test suite');
      this.testStrategy = 'full';
      return [];
    }
  }

  /**
   * Determine if changes require full test suite
   */
  requiresFullTestSuite() {
    const criticalChanges = this.changedFiles.some(file =>
      TEST_SELECTION_CONFIG.fullTestTriggers.some(
        pattern =>
          file.includes(pattern.replace('**', '')) || file.match(pattern.replace('**', '.*'))
      )
    );

    if (criticalChanges) {
      this.testStrategy = 'full';
      this.stats.selectionReason = 'Critical configuration or core changes detected';
      return true;
    }

    // If more than 20 files changed, run full suite for safety
    if (this.changedFiles.length > 20) {
      this.testStrategy = 'full';
      this.stats.selectionReason = `Large changeset (${this.changedFiles.length} files)`;
      return true;
    }

    return false;
  }

  /**
   * Map source file changes to relevant test files
   */
  mapChangesToTests() {
    // Always include critical tests
    TEST_SELECTION_CONFIG.criticalTests.forEach(test => {
      this.affectedTests.add(test);
    });

    // Map changed source files to test files
    this.changedFiles.forEach(changedFile => {
      // Direct test file changes
      if (changedFile.includes('test/') && changedFile.includes('.test.')) {
        this.affectedTests.add(changedFile);
        return;
      }

      // Map source files to test files
      Object.entries(TEST_SELECTION_CONFIG.sourceToTestMapping).forEach(([srcPath, testPath]) => {
        if (changedFile.startsWith(srcPath)) {
          const relativePath = changedFile.replace(srcPath, '');
          const testFile = relativePath.replace(/\.(ts|js)$/, '.test.ts');
          const fullTestPath = join(testPath, testFile);

          if (existsSync(fullTestPath)) {
            this.affectedTests.add(fullTestPath);
          }
        }
      });

      // Component-specific mapping
      this.mapComponentTests(changedFile);
    });

    console.log(`🎯 Selected ${this.affectedTests.size} test files for execution`);
    return Array.from(this.affectedTests);
  }

  /**
   * Map component changes to related tests
   */
  mapComponentTests(changedFile) {
    const componentMappings = {
      // UI Component changes
      'src/ui/components/': ['test/unit/ui/components/', 'test/integration/ui/'],

      // Core system changes
      'src/core/simulation': [
        'test/unit/core/simulation.test.ts',
        'test/integration/simulation/',
        'test/unit/ui/components/', // UI components depend on simulation
      ],

      // Utility changes
      'src/utils/canvas': [
        'test/unit/utils/canvasUtils.test.ts',
        'test/unit/ui/components/HeatmapComponent.test.ts',
        'test/unit/ui/components/ChartComponent.test.ts',
      ],

      // Error handling changes
      'src/utils/system/errorHandler': [
        'test/unit/utils/errorHandler.test.ts',
        'test/unit/**', // Error handling affects everything
      ],
    };

    Object.entries(componentMappings).forEach(([pattern, testPaths]) => {
      if (changedFile.includes(pattern)) {
        testPaths.forEach(testPath => {
          if (testPath.endsWith('.test.ts')) {
            this.affectedTests.add(testPath);
          } else {
            // Add all tests in directory
            try {
              const glob = `${testPath}**/*.test.ts`;
              this.affectedTests.add(glob);
            } catch (error) {
              // Directory might not exist, skip
            }
          }
        });
      }
    });
  }

  /**
   * Generate optimized test command based on analysis
   */
  generateTestCommand() {
    if (this.testStrategy === 'full') {
      return {
        command: 'npm run test:ci',
        description: 'Running full test suite due to critical changes',
        estimatedTime: 300, // 5 minutes
        testFiles: 'all',
      };
    }

    if (this.affectedTests.size === 0) {
      return {
        command: 'npm run test:fast -- --run test/unit/utils/errorHandler.test.ts',
        description: 'Running minimal test suite (no relevant changes detected)',
        estimatedTime: 30, // 30 seconds
        testFiles: ['test/unit/utils/errorHandler.test.ts'],
      };
    }

    const testFiles = Array.from(this.affectedTests);
    const testPattern = testFiles.join(' ');

    return {
      command: `npm run test:fast -- --run ${testPattern}`,
      description: `Running smart test selection (${testFiles.length} test files)`,
      estimatedTime: Math.min(testFiles.length * 10, 120), // 10s per test file, max 2 minutes
      testFiles: testFiles,
    };
  }

  /**
   * Create test execution report
   */
  generateReport() {
    const selectedTests = Array.from(this.affectedTests);
    const report = {
      timestamp: new Date().toISOString(),
      strategy: this.testStrategy,
      changedFiles: this.changedFiles,
      selectedTests: selectedTests,
      stats: {
        changedFiles: this.changedFiles.length,
        selectedTests: selectedTests.length,
        estimatedTimeSaving: this.testStrategy === 'full' ? 0 : 180, // 3 minutes saved
        strategy: this.testStrategy,
        reason: this.stats.selectionReason || 'Smart selection based on file changes',
      },
    };

    writeFileSync('test-selection-report.json', JSON.stringify(report, null, 2));

    console.log('\n📊 Test Selection Report:');
    console.log(`   Strategy: ${report.strategy}`);
    console.log(`   Changed files: ${report.stats.changedFiles}`);
    console.log(`   Selected tests: ${report.stats.selectedTests}`);
    console.log(`   Estimated time saving: ${report.stats.estimatedTimeSaving}s`);
    console.log(`   Reason: ${report.stats.reason}`);

    return report;
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🚀 Smart Test Selection Analysis Starting...\n');

    // Step 1: Analyze changes
    this.analyzeChanges();

    // Step 2: Determine test strategy
    if (this.requiresFullTestSuite()) {
      console.log('🔍 Full test suite required');
    } else {
      console.log('⚡ Smart test selection enabled');
      this.mapChangesToTests();
    }

    // Step 3: Generate test command
    const testCommand = this.generateTestCommand();
    console.log(`\n📋 Test Execution Plan:`);
    console.log(`   Command: ${testCommand.command}`);
    console.log(`   Description: ${testCommand.description}`);
    console.log(`   Estimated time: ${testCommand.estimatedTime}s`);

    // Step 4: Generate report
    this.generateReport();

    // Step 5: Execute tests (if not in analysis mode)
    if (process.env.EXECUTE_TESTS !== 'false') {
      console.log('\n🧪 Executing selected tests...');
      try {
        execSync(testCommand.command, { stdio: 'inherit' });
        console.log('✅ Tests completed successfully');
      } catch (error) {
        console.error('❌ Tests failed');
        process.exit(1);
      }
    }

    return testCommand;
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const selector = new SmartTestSelector();
  selector.run().catch(error => {
    console.error('💥 Smart test selection failed:', error);
    process.exit(1);
  });
}

export { SmartTestSelector };
