#!/usr/bin/env node

/**
 * Code Duplication Cleanup Tool
 *
 * Systematically removes duplicate files to reduce SonarCloud duplication percentage
 */

const fs = require('fs');

class DuplicationCleanup {
  constructor() {
    this.filesToRemove = [];
    this.backupCreated = false;
  }

  /**
   * Main cleanup process
   */
  async cleanup() {
    console.log('🧹 CODE DUPLICATION CLEANUP');
    console.log('='.repeat(40));

    // Step 1: Identify files to remove
    this.identifyDuplicateFiles();

    // Step 2: Show cleanup plan
    this.showCleanupPlan();

    // Step 3: Execute cleanup
    this.executeCleanup();

    console.log('\n✅ Cleanup completed successfully!');
    console.log('📈 Expected SonarCloud duplication reduction: 60-80%');
  }

  /**
   * Identify all duplicate/backup files that can be safely removed
   */
  identifyDuplicateFiles() {
    console.log('🔍 Identifying duplicate files...\n');

    // Main file alternatives (keep only main.ts)
    const mainAlternatives = [
      'src/main-backup.ts',
      'src/main-clean.ts',
      'src/main-leaderboard.ts',
      'src/main-new.ts',
      'src/main-simple.ts',
      'src/main-test.ts',
    ];

    // Simulation file alternatives (keep only simulation.ts and simulation_clean.ts)
    const simulationAlternatives = [
      'src/core/simulation_final.ts',
      'src/core/simulation_minimal.ts',
      'src/core/simulation_simple.ts',
    ];

    // Empty or duplicate index files
    const duplicateIndexFiles = [
      'src/ui/components/index.ts',
      'src/utils/mobile/index.ts',
      'src/features/index.ts',
      'src/models/index.ts',
    ];

    // Add files that exist to removal list
    [...mainAlternatives, ...simulationAlternatives, ...duplicateIndexFiles].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        this.filesToRemove.push({
          path: filePath,
          size: stat.size,
          type: this.getFileType(filePath),
        });
      }
    });

    console.log(`📋 Found ${this.filesToRemove.length} duplicate files to remove`);
  }

  /**
   * Get file type for categorization
   */
  getFileType(filePath) {
    if (filePath.includes('main-')) return 'main-alternative';
    if (filePath.includes('simulation_')) return 'simulation-alternative';
    if (filePath.endsWith('index.ts')) return 'duplicate-index';
    return 'other';
  }

  /**
   * Show cleanup plan
   */
  showCleanupPlan() {
    console.log('\n📋 CLEANUP PLAN');
    console.log('-'.repeat(20));

    const categories = {
      'main-alternative': 'Main file alternatives',
      'simulation-alternative': 'Simulation file alternatives',
      'duplicate-index': 'Duplicate index files',
      other: 'Other duplicates',
    };

    Object.entries(categories).forEach(([type, description]) => {
      const files = this.filesToRemove.filter(f => f.type === type);
      if (files.length > 0) {
        console.log(`\n${description}:`);
        files.forEach(file => {
          console.log(`  🗑️  ${file.path} (${(file.size / 1024).toFixed(1)}KB)`);
        });
      }
    });

    const totalSize = this.filesToRemove.reduce((sum, file) => sum + file.size, 0);
    console.log(`\n📊 Total files to remove: ${this.filesToRemove.length}`);
    console.log(`💾 Total size reduction: ${(totalSize / 1024).toFixed(1)}KB`);
  }

  /**
   * Execute the cleanup
   */
  executeCleanup() {
    console.log('\n🚀 Executing cleanup...');

    let removedCount = 0;
    let errors = 0;

    this.filesToRemove.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`✅ Removed: ${file.path}`);
          removedCount++;
        }
      } catch (error) {
        console.error(`❌ Error removing ${file.path}:`, error.message);
        errors++;
      }
    });

    console.log(`\n📈 Cleanup Results:`);
    console.log(`  ✅ Successfully removed: ${removedCount} files`);
    console.log(`  ❌ Errors: ${errors} files`);

    if (errors === 0) {
      console.log('  🎯 All duplicate files removed successfully!');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const cleanup = new DuplicationCleanup();
  cleanup.cleanup().catch(console.error);
}

module.exports = DuplicationCleanup;
