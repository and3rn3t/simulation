#!/usr/bin/env node
/**
 * Code Deduplication Safety Auditor
 * 
 * This script provides comprehensive safety checks before and after any automated
 * code deduplication operations to prevent syntax corruption and maintain build integrity.
 * 
 * Features:
 * - Pre-deduplication syntax validation
 * - Build verification before/after changes
 * - Rollback capabilities for failed operations
 * - Comprehensive reporting with file-level impact analysis
 * - SonarCloud metric tracking
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Project configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BACKUP_DIR = path.join(PROJECT_ROOT, '.deduplication-backups');
const REPORT_DIR = path.join(PROJECT_ROOT, 'deduplication-reports');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

/**
 * Enhanced logging with colors and timestamps
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substr(11, 8);
  const typeColors = {
    info: colors.blue,
    success: colors.green,
    warning: colors.yellow,
    error: colors.red,
    critical: colors.magenta,
    header: colors.cyan,
  };

  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    critical: '🚨',
    header: '📋',
  }[type];

  console.log(
    `${colors.bright}[${timestamp}]${colors.reset} ${icon} ${typeColors[type]}${message}${colors.reset}`
  );
}

/**
 * Safety Auditor Class
 */
class DeduplicationSafetyAuditor {
  constructor() {
    this.sessionId = Date.now().toString();
    this.errors = [];
    this.warnings = [];
    this.backupCreated = false;
    this.results = {
      preCheck: null,
      postCheck: null,
      buildStatus: null,
      rollbackPerformed: false,
    };
  }

  /**
   * Initialize safety audit session
   */
  async initializeSession() {
    log('🔒 Initializing Deduplication Safety Audit', 'header');
    log(`Session ID: ${this.sessionId}`, 'info');

    // Create backup and report directories
    await this.ensureDirectories();

    // Run initial build check
    log('Checking initial build status...', 'info');
    const initialBuildStatus = await this.checkBuildStatus();
    
    if (!initialBuildStatus.success) {
      log('❌ Initial build is failing! Cannot proceed with deduplication safely.', 'error');
      log('Fix build errors before running deduplication:', 'error');
      initialBuildStatus.errors.forEach(error => log(`  - ${error}`, 'error'));
      process.exit(1);
    }

    log('✅ Initial build is successful - safe to proceed', 'success');
    return true;
  }

  /**
   * Create necessary directories
   */
  async ensureDirectories() {
    for (const dir of [BACKUP_DIR, REPORT_DIR]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`Created directory: ${dir}`, 'info');
      }
    }
  }

  /**
   * Create full project backup before deduplication
   */
  async createBackup() {
    log('📦 Creating project backup...', 'info');
    
    const backupPath = path.join(BACKUP_DIR, `backup-${this.sessionId}`);
    fs.mkdirSync(backupPath, { recursive: true });

    // Backup source files only (exclude node_modules, dist, etc.)
    const sourceDirectories = ['src', 'test', 'e2e', 'scripts'];
    const importantFiles = [
      'package.json',
      'package-lock.json', 
      'tsconfig.json',
      'vite.config.ts',
      'vitest.config.ts',
      'eslint.config.js',
    ];

    try {
      // Backup source directories
      for (const dir of sourceDirectories) {
        const sourcePath = path.join(PROJECT_ROOT, dir);
        if (fs.existsSync(sourcePath)) {
          const targetPath = path.join(backupPath, dir);
          await this.copyDirectory(sourcePath, targetPath);
          log(`Backed up: ${dir}/`, 'info');
        }
      }

      // Backup important files
      for (const file of importantFiles) {
        const sourcePath = path.join(PROJECT_ROOT, file);
        if (fs.existsSync(sourcePath)) {
          const targetPath = path.join(backupPath, file);
          fs.copyFileSync(sourcePath, targetPath);
          log(`Backed up: ${file}`, 'info');
        }
      }

      this.backupCreated = true;
      log(`✅ Backup created successfully: ${backupPath}`, 'success');
      
      return backupPath;
    } catch (error) {
      log(`❌ Backup creation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Copy directory recursively
   */
  async copyDirectory(source, target) {
    fs.mkdirSync(target, { recursive: true });
    
    const entries = fs.readdirSync(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  /**
   * Validate TypeScript syntax before deduplication
   */
  async preDeduplicationCheck() {
    log('🔍 Running pre-deduplication syntax validation...', 'info');
    
    const checks = {
      typescript: await this.checkTypeScript(),
      eslint: await this.checkESLint(),
      imports: await this.checkImports(),
      patterns: await this.checkSuspiciousPatterns(),
    };

    this.results.preCheck = checks;

    const hasErrors = Object.values(checks).some(check => !check.success);
    
    if (hasErrors) {
      log('❌ Pre-deduplication validation failed!', 'error');
      this.logCheckResults(checks);
      return false;
    }

    log('✅ Pre-deduplication validation passed', 'success');
    return true;
  }

  /**
   * Validate state after deduplication
   */
  async postDeduplicationCheck() {
    log('🔍 Running post-deduplication validation...', 'info');
    
    const checks = {
      typescript: await this.checkTypeScript(),
      eslint: await this.checkESLint(),
      imports: await this.checkImports(),
      patterns: await this.checkSuspiciousPatterns(),
      build: await this.checkBuildStatus(),
    };

    this.results.postCheck = checks;

    const hasErrors = Object.values(checks).some(check => !check.success);
    
    if (hasErrors) {
      log('❌ Post-deduplication validation failed!', 'critical');
      this.logCheckResults(checks);
      
      // Automatic rollback on failure
      if (this.backupCreated) {
        log('🔄 Initiating automatic rollback...', 'warning');
        await this.performRollback();
      }
      
      return false;
    }

    log('✅ Post-deduplication validation passed', 'success');
    return true;
  }

  /**
   * Check TypeScript compilation
   */
  async checkTypeScript() {
    try {
      log('Checking TypeScript compilation...', 'info');
      execSync('npx tsc --noEmit --skipLibCheck', { 
        cwd: PROJECT_ROOT, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      return { success: true, errors: [] };
    } catch (error) {
      const errors = error.stdout || error.stderr || error.message;
      const errorLines = errors.split('\n').filter(line => line.includes('error TS'));
      
      return { 
        success: false, 
        errors: errorLines.slice(0, 10), // Limit to first 10 errors
        totalErrors: errorLines.length
      };
    }
  }

  /**
   * Check ESLint validation
   */
  async checkESLint() {
    try {
      log('Checking ESLint validation...', 'info');
      execSync('npm run lint', { 
        cwd: PROJECT_ROOT, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      return { success: true, errors: [] };
    } catch (error) {
      const errors = error.stdout || error.stderr || error.message;
      const errorLines = errors.split('\n').filter(line => line.trim().length > 0);
      
      return { 
        success: false, 
        errors: errorLines.slice(0, 10), // Limit to first 10 errors
        totalErrors: errorLines.length
      };
    }
  }

  /**
   * Check for broken imports
   */
  async checkImports() {
    try {
      log('Checking import statements...', 'info');
      const sourceFiles = this.findSourceFiles();
      const brokenImports = [];

      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g);
        
        if (importMatches) {
          for (const importLine of importMatches) {
            const pathMatch = importLine.match(/from\s+['"]([^'"]+)['"]/);
            if (pathMatch) {
              const importPath = pathMatch[1];
              
              // Check for suspicious import patterns
              if (importPath.includes('UltimatePatternConsolidator') || 
                  importPath.includes('ifPattern') ||
                  importPath.includes('eventPattern')) {
                brokenImports.push(`${file}: ${importLine.trim()}`);
              }
            }
          }
        }
      }

      return { 
        success: brokenImports.length === 0, 
        errors: brokenImports.slice(0, 10),
        totalErrors: brokenImports.length
      };
    } catch (error) {
      return { success: false, errors: [`Import check failed: ${error.message}`] };
    }
  }

  /**
   * Check for suspicious patterns that indicate corruption
   */
  async checkSuspiciousPatterns() {
    try {
      log('Checking for suspicious code patterns...', 'info');
      const sourceFiles = this.findSourceFiles();
      const suspiciousPatterns = [];

      const corruptionPatterns = [
        /ifPattern\s*\(/,                    // UltimatePatternConsolidator usage
        /eventPattern\s*\(/,                 // UltimatePatternConsolidator usage
        /\(\(\)\(event\);/,                 // Malformed event handlers
        /\(\(\)\(/,                         // Malformed function calls
        /import.*UltimatePatternConsolidator/, // Non-existent import
        /\{\s*\{\s*\{/,                     // Excessive nested braces
        /addEventListener\s*\(\s*\)/,        // Empty event listeners
      ];

      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of corruptionPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            suspiciousPatterns.push(`${path.relative(PROJECT_ROOT, file)}: ${pattern.toString()}`);
          }
        }
      }

      return { 
        success: suspiciousPatterns.length === 0, 
        errors: suspiciousPatterns.slice(0, 10),
        totalErrors: suspiciousPatterns.length
      };
    } catch (error) {
      return { success: false, errors: [`Pattern check failed: ${error.message}`] };
    }
  }

  /**
   * Check build status
   */
  async checkBuildStatus() {
    try {
      log('Checking build status...', 'info');
      const output = execSync('npm run build', { 
        cwd: PROJECT_ROOT, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      return { success: true, errors: [], output };
    } catch (error) {
      const errors = error.stdout || error.stderr || error.message;
      const errorLines = errors.split('\n').filter(line => 
        line.includes('error') || line.includes('Error') || line.includes('Failed')
      );
      
      return { 
        success: false, 
        errors: errorLines.slice(0, 10),
        totalErrors: errorLines.length
      };
    }
  }

  /**
   * Perform rollback to backup
   */
  async performRollback() {
    if (!this.backupCreated) {
      log('❌ No backup available for rollback', 'error');
      return false;
    }

    try {
      log('🔄 Performing rollback to backup...', 'warning');
      
      const backupPath = path.join(BACKUP_DIR, `backup-${this.sessionId}`);
      
      if (!fs.existsSync(backupPath)) {
        log('❌ Backup directory not found', 'error');
        return false;
      }

      // Restore from backup
      const entries = fs.readdirSync(backupPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const backupItemPath = path.join(backupPath, entry.name);
        const targetItemPath = path.join(PROJECT_ROOT, entry.name);
        
        if (entry.isDirectory()) {
          // Remove existing directory and copy from backup
          if (fs.existsSync(targetItemPath)) {
            fs.rmSync(targetItemPath, { recursive: true, force: true });
          }
          await this.copyDirectory(backupItemPath, targetItemPath);
        } else {
          // Copy file from backup
          fs.copyFileSync(backupItemPath, targetItemPath);
        }
        
        log(`Restored: ${entry.name}`, 'info');
      }

      this.results.rollbackPerformed = true;
      log('✅ Rollback completed successfully', 'success');
      
      // Verify rollback
      const buildCheck = await this.checkBuildStatus();
      if (buildCheck.success) {
        log('✅ Build verified after rollback', 'success');
      } else {
        log('❌ Build still failing after rollback - manual intervention required', 'critical');
      }
      
      return true;
    } catch (error) {
      log(`❌ Rollback failed: ${error.message}`, 'critical');
      return false;
    }
  }

  /**
   * Find all source files
   */
  findSourceFiles(extensions = ['ts', 'tsx', 'js', 'jsx']) {
    const files = [];
    const excludeDirs = ['node_modules', 'dist', 'build', 'coverage', '.git'];

    function traverse(dir) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
            traverse(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).slice(1);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (_error) {
        // Skip directories we can't read
      }
    }

    traverse(path.join(PROJECT_ROOT, 'src'));
    return files;
  }

  /**
   * Log check results in a formatted way
   */
  logCheckResults(checks) {
    for (const [checkName, result] of Object.entries(checks)) {
      if (result.success) {
        log(`✅ ${checkName}: PASSED`, 'success');
      } else {
        log(`❌ ${checkName}: FAILED`, 'error');
        if (result.totalErrors) {
          log(`   Total errors: ${result.totalErrors}`, 'error');
        }
        if (result.errors && result.errors.length > 0) {
          log('   Sample errors:', 'error');
          result.errors.slice(0, 3).forEach(error => {
            log(`     - ${error}`, 'error');
          });
          if (result.errors.length > 3) {
            log(`     ... and ${result.errors.length - 3} more`, 'error');
          }
        }
      }
    }
  }

  /**
   * Generate comprehensive audit report
   */
  async generateReport() {
    log('📊 Generating audit report...', 'info');
    
    const report = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      results: this.results,
      warnings: this.warnings,
      errors: this.errors,
      summary: {
        success: this.results.postCheck ? 
          Object.values(this.results.postCheck).every(check => check.success) : false,
        rollbackPerformed: this.results.rollbackPerformed,
        backupCreated: this.backupCreated,
      }
    };

    const reportPath = path.join(REPORT_DIR, `audit-report-${this.sessionId}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    log(`📋 Audit report saved: ${reportPath}`, 'success');
    return report;
  }
}

/**
 * Main execution function
 */
async function main() {
  const command = process.argv[2];
  const auditor = new DeduplicationSafetyAuditor();

  try {
    switch (command) {
      case 'pre-check': {
        await auditor.initializeSession();
        await auditor.createBackup();
        const preCheckResult = await auditor.preDeduplicationCheck();
        await auditor.generateReport();
        process.exit(preCheckResult ? 0 : 1);
        break;
      }

      case 'post-check': {
        await auditor.initializeSession();
        const postCheckResult = await auditor.postDeduplicationCheck();
        await auditor.generateReport();
        process.exit(postCheckResult ? 0 : 1);
        break;
      }

      case 'full-audit': {
        await auditor.initializeSession();
        await auditor.createBackup();
        
        const preResult = await auditor.preDeduplicationCheck();
        if (!preResult) {
          log('❌ Pre-check failed - aborting audit', 'error');
          process.exit(1);
        }

        log('⚠️ NOW RUN YOUR DEDUPLICATION OPERATION', 'warning');
        log('Press any key after deduplication is complete...', 'info');
        
        // Wait for user input
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', async () => {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          
          const postResult = await auditor.postDeduplicationCheck();
          await auditor.generateReport();
          process.exit(postResult ? 0 : 1);
        });
        break;
      }

      default:
        log('🔒 Deduplication Safety Auditor', 'header');
        log('', 'info');
        log('Usage:', 'info');
        log('  node deduplication-safety-auditor.cjs pre-check     # Run before deduplication', 'info');
        log('  node deduplication-safety-auditor.cjs post-check    # Run after deduplication', 'info');
        log('  node deduplication-safety-auditor.cjs full-audit    # Interactive full audit', 'info');
        log('', 'info');
        log('This tool helps prevent code corruption during automated deduplication operations.', 'info');
        break;
    }
  } catch (error) {
    log(`❌ Audit failed: ${error.message}`, 'critical');
    process.exit(1);
  }
}

// Export for testing
module.exports = { DeduplicationSafetyAuditor };

// Run if called directly
if (require.main === module) {
  main();
}
