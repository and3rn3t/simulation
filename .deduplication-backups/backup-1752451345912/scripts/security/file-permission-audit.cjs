#!/usr/bin/env node
/**
 * File Permission Security Audit
 *
 * Comprehensive audit script to identify file permission security issues
 * across the entire project. This script checks for:
 * - Files created without permission setting
 * - Overly permissive file permissions
 * - Docker security issues
 * - Missing security patterns
 */

const fs = require('fs');
const path = require('path');

// Project root directory
const PROJECT_ROOT = path.resolve(__dirname, '../..');

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
  };

  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    critical: '🚨',
  }[type];

  console.log(
    `${colors.bright}[${timestamp}]${colors.reset} ${icon} ${typeColors[type]}${message}${colors.reset}`
  );
}

/**
 * Find files with specific patterns
 */
function findFiles(
  directory,
  extensions = ['js', 'mjs', 'cjs', 'ts'],
  excludeDirs = ['node_modules', '.git', 'dist', 'coverage']
) {
  const files = [];

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
    } catch (error) {
      log(`Error reading directory ${dir}: ${error.message}`, 'warning');
    }
  }

  traverse(directory);
  return files;
}

/**
 * Check if file has secure wrapper patterns
 */
function hasSecureWrapperPatterns(content) {
  return (
    content.includes('secureFileCreation') ||
    content.includes('secureFileCopy') ||
    content.includes('secure')
  );
}

/**
 * Detect file operations in content
 */
function detectFileOperations(content) {
  return {
    writeFileSync: content.includes('writeFileSync'),
    copyFileSync: content.includes('copyFileSync'),
    createWriteStream: content.includes('createWriteStream'),
    chmodSync: content.includes('chmodSync'),
  };
}

/**
 * Check if file operations are secure
 */
function hasInsecureFileOperations(operations, content) {
  const hasFileOps =
    operations.writeFileSync || operations.copyFileSync || operations.createWriteStream;
  const hasPermissionSetting = operations.chmodSync;
  const hasSecureWrapper = hasSecureWrapperPatterns(content);

  return hasFileOps && !hasPermissionSetting && !hasSecureWrapper;
}

/**
 * Audit a single file for insecure operations
 */
function auditSingleFile(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const operations = detectFileOperations(content);

    if (hasInsecureFileOperations(operations, content)) {
      return {
        file: path.relative(PROJECT_ROOT, file),
        operations: {
          writeFileSync: operations.writeFileSync,
          copyFileSync: operations.copyFileSync,
          createWriteStream: operations.createWriteStream,
        },
      };
    }

    return null;
  } catch (error) {
    log(`Error reading ${file}: ${error.message}`, 'warning');
    return null;
  }
}

/**
 * Check for file operations without permission setting
 */
function auditFileOperations() {
  log('\n🔍 Auditing file operations for missing permission settings...', 'info');

  const jsFiles = findFiles(PROJECT_ROOT);
  const vulnerableFiles = [];

  for (const file of jsFiles) {
    const result = auditSingleFile(file);
    if (result) {
      vulnerableFiles.push(result);
    }
  }

  if (vulnerableFiles.length === 0) {
    log('✅ All file operations include proper permission setting', 'success');
    return true;
  } else {
    log(`❌ Found ${vulnerableFiles.length} files with unsafe file operations:`, 'error');
    vulnerableFiles.forEach(item => {
      log(`  ${item.file}`, 'error');
      Object.entries(item.operations).forEach(([op, present]) => {
        if (present) {
          log(`    - ${op} without chmodSync`, 'warning');
        }
      });
    });
    return false;
  }
}

/**
 * Check for overly broad permissions in Docker content
 */
function checkDockerPermissions(content, fileName) {
  const issues = [];

  if (content.includes('chmod -R 755') || content.includes('chmod -R 777')) {
    issues.push({
      file: fileName,
      issue: 'Overly broad permission setting (chmod -R)',
      severity: 'high',
    });
  }

  return issues;
}

/**
 * Check for missing user directives in Docker content
 */
function checkDockerUserSecurity(content, fileName) {
  const issues = [];

  if (content.includes('FROM') && !content.includes('USER ')) {
    issues.push({
      file: fileName,
      issue: 'Running as root user (missing USER directive)',
      severity: 'high',
    });
  }

  return issues;
}

/**
 * Check for proper ownership settings in Docker content
 */
function checkDockerOwnership(content, fileName) {
  const issues = [];

  if (content.includes('COPY') && !content.includes('chown')) {
    issues.push({
      file: fileName,
      issue: 'COPY without proper ownership setting',
      severity: 'medium',
    });
  }

  return issues;
}

/**
 * Audit a single Docker file for security issues
 */
function auditSingleDockerFile(dockerFile) {
  const filePath = path.join(PROJECT_ROOT, dockerFile);
  const issues = [];

  if (!fs.existsSync(filePath)) {
    return issues;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Run all security checks
    issues.push(...checkDockerPermissions(content, dockerFile));
    issues.push(...checkDockerUserSecurity(content, dockerFile));
    issues.push(...checkDockerOwnership(content, dockerFile));
  } catch (error) {
    log(`Error reading ${dockerFile}: ${error.message}`, 'warning');
  }

  return issues;
}

/**
 * Check Docker files for security issues
 */
function auditDockerFiles() {
  log('\n🐳 Auditing Docker files for security issues...', 'info');

  const dockerFiles = [
    'Dockerfile',
    'Dockerfile.dev',
    'docker-compose.yml',
    'docker-compose.override.yml',
  ];
  const allIssues = [];

  // Audit each Docker file
  for (const dockerFile of dockerFiles) {
    const issues = auditSingleDockerFile(dockerFile);
    allIssues.push(...issues);
  }

  // Report results
  if (allIssues.length === 0) {
    log('✅ Docker files follow security best practices', 'success');
    return true;
  } else {
    log(`❌ Found ${allIssues.length} Docker security issues:`, 'error');
    allIssues.forEach(issue => {
      const severity = issue.severity === 'high' ? 'critical' : 'warning';
      log(`  ${issue.file}: ${issue.issue}`, severity);
    });
    return false;
  }
}

/**
 * Check file system permissions
 */
function auditFileSystemPermissions() {
  log('\n📁 Auditing file system permissions...', 'info');

  const criticalFiles = [
    '.env.development',
    '.env.staging',
    '.env.production',
    '.env.local',
    'package.json',
    'package-lock.json',
  ];

  const issues = [];

  for (const file of criticalFiles) {
    const filePath = path.join(PROJECT_ROOT, file);

    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        const permissions = stats.mode & parseInt('777', 8);

        // Check for world-writable files
        if (permissions & 0o002) {
          issues.push({
            file,
            permissions: permissions.toString(8),
            issue: 'World-writable file (security risk)',
          });
        }

        // Check environment files have restrictive permissions
        if (file.startsWith('.env') && permissions !== 0o600 && permissions !== 0o644) {
          issues.push({
            file,
            permissions: permissions.toString(8),
            issue: 'Environment file should have 600 or 644 permissions',
          });
        }
      } catch (error) {
        log(`Error checking permissions for ${file}: ${error.message}`, 'warning');
      }
    }
  }

  if (issues.length === 0) {
    log('✅ File system permissions are secure', 'success');
    return true;
  } else {
    log(`❌ Found ${issues.length} file permission issues:`, 'error');
    issues.forEach(issue => {
      log(`  ${issue.file} (${issue.permissions}): ${issue.issue}`, 'error');
    });
    return false;
  }
}

/**
 * Check for security patterns in new code
 */
function auditSecurityPatterns() {
  log('\n🔒 Auditing security patterns implementation...', 'info');

  const templateFile = path.join(PROJECT_ROOT, 'scripts', 'templates', 'secure-script-template.js');
  const hasSecureTemplate = fs.existsSync(templateFile);

  const securityDocs = [
    'docs/security/FILE_PERMISSION_SECURITY_LESSONS.md',
    'docs/security/FILE_PERMISSION_BEST_PRACTICES.md',
  ];

  const missingDocs = securityDocs.filter(doc => !fs.existsSync(path.join(PROJECT_ROOT, doc)));

  let score = 0;
  let total = 3; // Template + 2 docs

  if (hasSecureTemplate) {
    log('✅ Secure script template available', 'success');
    score++;
  } else {
    log('❌ Missing secure script template', 'error');
  }

  if (missingDocs.length === 0) {
    log('✅ Security documentation complete', 'success');
    score += 2;
  } else {
    log(`❌ Missing security documentation: ${missingDocs.join(', ')}`, 'error');
  }

  const passed = score === total;
  log(`Security patterns score: ${score}/${total}`, passed ? 'success' : 'warning');

  return passed;
}

/**
 * Generate security report
 */
function generateSecurityReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    auditResults: results,
    summary: {
      totalChecks: Object.keys(results).length,
      passedChecks: Object.values(results).filter(Boolean).length,
      score: 0,
    },
  };

  report.summary.score = ((report.summary.passedChecks / report.summary.totalChecks) * 100).toFixed(
    1
  );

  const reportPath = path.join(PROJECT_ROOT, 'security-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  fs.chmodSync(reportPath, 0o644); // Apply our own security best practice!

  log(`📊 Security audit report saved: ${reportPath}`, 'info');
  return report;
}

/**
 * Main audit function
 */
function runSecurityAudit() {
  console.log(`${colors.bright}🔒 File Permission Security Audit${colors.reset}`);
  console.log('=====================================\n');

  const results = {
    fileOperations: auditFileOperations(),
    dockerSecurity: auditDockerFiles(),
    fileSystemPermissions: auditFileSystemPermissions(),
    securityPatterns: auditSecurityPatterns(),
  };

  const report = generateSecurityReport(results);

  console.log('\n' + '='.repeat(50));
  console.log(`${colors.bright}📋 SECURITY AUDIT SUMMARY${colors.reset}`);
  console.log('='.repeat(50));

  Object.entries(results).forEach(([check, passed]) => {
    const status = passed
      ? `${colors.green}✅ PASSED${colors.reset}`
      : `${colors.red}❌ FAILED${colors.reset}`;
    const checkName = check.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${checkName.padEnd(25)}: ${status}`);
  });

  const score = parseFloat(report.summary.score);
  console.log(`\n${colors.bright}📊 Overall Security Score: ${score}%${colors.reset}`);

  if (score >= 90) {
    log('🎉 Excellent security posture!', 'success');
    return 0;
  } else if (score >= 75) {
    log('⚠️ Good security, but room for improvement', 'warning');
    return 0;
  } else if (score >= 50) {
    log('🚨 Security needs attention', 'error');
    return 1;
  } else {
    log('💥 Critical security issues found', 'critical');
    return 1;
  }
}

// Run audit if called directly
if (require.main === module) {
  try {
    const exitCode = runSecurityAudit();
    process.exit(exitCode);
  } catch (error) {
    log(`Audit failed: ${error.message}`, 'critical');
    process.exit(1);
  }
}

module.exports = {
  runSecurityAudit,
  auditFileOperations,
  auditDockerFiles,
  auditFileSystemPermissions,
  auditSecurityPatterns,
};
