#!/usr/bin/env node

/**
 * Pseudorandom Number Generator Security Assessment Tool
 *
 * This script analyzes the codebase for insecure random number generation
 * and provides recommendations for improving security.
 */

const fs = require('fs');
const path = require('path');

class RandomSecurityAuditor {
  constructor() {
    this.findings = [];
    this.securityLevels = {
      CRITICAL: 'CRITICAL',
      HIGH: 'HIGH',
      MEDIUM: 'MEDIUM',
      LOW: 'LOW',
      INFO: 'INFO',
    };
  }

  /**
   * Audit a file for insecure random usage
   */
  auditFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        this.checkMathRandom(line, index + 1, filePath);
        this.checkDateNow(line, index + 1, filePath);
        this.checkInsecurePatterns(line, index + 1, filePath);
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
    }
  }

  /**
   * Check for Math.random() usage
   */
  checkMathRandom(line, lineNumber, filePath) {
    if (line.includes('Math.random()')) {
      // Skip test files and already secured files
      if (this.isTestFile(filePath) || this.isAlreadySecured(line)) {
        return;
      }

      const severity = this.assessMathRandomSeverity(line, filePath);

      this.findings.push({
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        issue: 'Math.random() usage detected',
        severity,
        recommendation: this.getMathRandomRecommendation(severity),
        context: this.getContext(line),
      });
    }
  }

  /**
   * Check for Date.now() in ID generation
   */
  checkDateNow(line, lineNumber, filePath) {
    if (
      line.includes('Date.now()') &&
      (line.includes('id') || line.includes('ID') || line.includes('session'))
    ) {
      const severity = this.assessDateNowSeverity(line, filePath);

      this.findings.push({
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        issue: 'Timestamp-based ID generation',
        severity,
        recommendation: 'Consider adding cryptographically secure random component',
        context: 'ID generation',
      });
    }
  }

  /**
   * Check for other insecure patterns
   */
  checkInsecurePatterns(line, lineNumber, filePath) {
    const patterns = [
      {
        pattern: /toString\(36\)\.substr/,
        issue: 'Insecure random string generation',
        severity: this.securityLevels.MEDIUM,
        recommendation: 'Use cryptographically secure random string generation',
      },
      {
        pattern: /Math\.floor\(Math\.random\(\)/,
        issue: 'Predictable random integer generation',
        severity: this.securityLevels.MEDIUM,
        recommendation: 'Use secure random integer generation for security-sensitive operations',
      },
    ];

    patterns.forEach(({ pattern, issue, severity, recommendation }) => {
      if (pattern.test(line) && !this.isTestFile(filePath)) {
        this.findings.push({
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          issue,
          severity,
          recommendation,
          context: this.getContext(line),
        });
      }
    });
  }

  /**
   * Assess severity of Math.random usage
   */
  assessMathRandomSeverity(line, filePath) {
    // Critical: Session IDs, tokens, cryptographic operations
    if (this.isCriticalContext(line, filePath)) {
      return this.securityLevels.CRITICAL;
    }

    // High: User IDs, task IDs, authentication
    if (this.isHighSecurityContext(line, filePath)) {
      return this.securityLevels.HIGH;
    }

    // Medium: UI component IDs, analytics
    if (this.isMediumSecurityContext(line, filePath)) {
      return this.securityLevels.MEDIUM;
    }

    // Low: Visual effects, simulation
    return this.securityLevels.LOW;
  }

  /**
   * Assess severity of Date.now usage
   */
  assessDateNowSeverity(line, filePath) {
    if (this.isCriticalContext(line, filePath)) {
      return this.securityLevels.HIGH;
    }
    return this.securityLevels.MEDIUM;
  }

  /**
   * Check if this is a critical security context
   */
  isCriticalContext(line, filePath) {
    const criticalKeywords = ['session', 'token', 'key', 'crypto', 'auth', 'password', 'secret'];

    const lowerLine = line.toLowerCase();
    return criticalKeywords.some(keyword => lowerLine.includes(keyword));
  }

  /**
   * Check if this is a high security context
   */
  isHighSecurityContext(line, filePath) {
    const highKeywords = ['task', 'worker', 'user', 'identifier', 'tracking'];

    const lowerLine = line.toLowerCase();
    return (
      highKeywords.some(keyword => lowerLine.includes(keyword)) ||
      filePath.includes('worker') ||
      filePath.includes('analytics')
    );
  }

  /**
   * Check if this is a medium security context
   */
  isMediumSecurityContext(line, filePath) {
    const mediumKeywords = ['input', 'component', 'element', 'ui', 'helper'];

    const lowerLine = line.toLowerCase();
    return (
      mediumKeywords.some(keyword => lowerLine.includes(keyword)) ||
      filePath.includes('components') ||
      filePath.includes('ui')
    );
  }

  /**
   * Check if file is a test file
   */
  isTestFile(filePath) {
    return filePath.includes('test') || filePath.includes('spec') || filePath.includes('mock');
  }

  /**
   * Check if line is already using secure functions
   */
  isAlreadySecured(line) {
    const securePatterns = [
      'getSimulationRandom',
      'generateSecure',
      'secureRandom',
      'crypto.getRandomValues',
    ];

    return securePatterns.some(pattern => line.includes(pattern));
  }

  /**
   * Get context of the random usage
   */
  getContext(line) {
    if (line.includes('session')) return 'Session management';
    if (line.includes('id') || line.includes('ID')) return 'ID generation';
    if (line.includes('particle')) return 'Visual effects';
    if (line.includes('position') || line.includes('movement')) return 'Simulation physics';
    if (line.includes('component') || line.includes('element')) return 'UI components';
    if (line.includes('analytics')) return 'Analytics';
    return 'General usage';
  }

  /**
   * Get recommendation for Math.random usage
   */
  getMathRandomRecommendation(severity) {
    switch (severity) {
      case this.securityLevels.CRITICAL:
        return 'MUST use crypto.getRandomValues() - security vulnerability';
      case this.securityLevels.HIGH:
        return 'SHOULD use generateSecureTaskId() or similar secure function';
      case this.securityLevels.MEDIUM:
        return 'CONSIDER using generateSecureUIId() for better security';
      case this.securityLevels.LOW:
        return 'OK to use Math.random() for simulation purposes, consider getSimulationRandom() for consistency';
      default:
        return 'Review usage context';
    }
  }

  /**
   * Scan directory recursively
   */
  scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
        this.scanDirectory(fullPath);
      } else if (stat.isFile() && this.shouldAuditFile(item)) {
        this.auditFile(fullPath);
      }
    });
  }

  /**
   * Check if directory should be skipped
   */
  shouldSkipDirectory(dirName) {
    const skipDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      'coverage',
      'playwright-report',
      'test-results',
    ];
    return skipDirs.includes(dirName);
  }

  /**
   * Check if file should be audited
   */
  shouldAuditFile(fileName) {
    return (
      fileName.endsWith('.ts') ||
      fileName.endsWith('.js') ||
      fileName.endsWith('.tsx') ||
      fileName.endsWith('.jsx')
    );
  }

  /**
   * Generate security report
   */
  generateReport() {
    const summary = this.getSummary();
    const recommendations = this.getRecommendations();

    console.log('🔐 PSEUDORANDOM NUMBER GENERATOR SECURITY AUDIT REPORT');
    console.log('='.repeat(60));
    console.log();

    console.log('📊 SUMMARY:');
    console.log(`Total findings: ${this.findings.length}`);
    console.log(`Critical issues: ${summary.critical}`);
    console.log(`High severity: ${summary.high}`);
    console.log(`Medium severity: ${summary.medium}`);
    console.log(`Low severity: ${summary.low}`);
    console.log();

    if (summary.critical > 0) {
      console.log('🚨 CRITICAL SECURITY ISSUES:');
      this.printFindingsByLevel(this.securityLevels.CRITICAL);
      console.log();
    }

    if (summary.high > 0) {
      console.log('⚠️  HIGH SEVERITY ISSUES:');
      this.printFindingsByLevel(this.securityLevels.HIGH);
      console.log();
    }

    if (summary.medium > 0) {
      console.log('📋 MEDIUM SEVERITY ISSUES:');
      this.printFindingsByLevel(this.securityLevels.MEDIUM);
      console.log();
    }

    console.log('💡 RECOMMENDATIONS:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.log();

    console.log('✅ SECURITY BEST PRACTICES:');
    this.printBestPractices();
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    return {
      critical: this.findings.filter(f => f.severity === this.securityLevels.CRITICAL).length,
      high: this.findings.filter(f => f.severity === this.securityLevels.HIGH).length,
      medium: this.findings.filter(f => f.severity === this.securityLevels.MEDIUM).length,
      low: this.findings.filter(f => f.severity === this.securityLevels.LOW).length,
    };
  }

  /**
   * Print findings by security level
   */
  printFindingsByLevel(level) {
    const findings = this.findings.filter(f => f.severity === level);

    findings.forEach((finding, index) => {
      console.log(`  ${index + 1}. ${path.basename(finding.file)}:${finding.line}`);
      console.log(`     Issue: ${finding.issue}`);
      console.log(`     Code: ${finding.code}`);
      console.log(`     Context: ${finding.context}`);
      console.log(`     Fix: ${finding.recommendation}`);
      console.log();
    });
  }

  /**
   * Get security recommendations
   */
  getRecommendations() {
    return [
      'Use crypto.getRandomValues() for all security-sensitive random generation',
      'Replace Math.random() in session/token generation with SecureRandom utilities',
      'Use generateSecureTaskId() for worker task identification',
      'Use generateSecureUIId() for UI component identifiers',
      'Use getSimulationRandom() for organism simulation for consistency',
      'Implement proper entropy sources in production environments',
      'Regular security audits of random number usage',
      'Consider using hardware random number generators for critical applications',
    ];
  }

  /**
   * Print security best practices
   */
  printBestPractices() {
    const practices = [
      'Never use Math.random() for cryptographic purposes',
      'Always validate crypto.getRandomValues availability',
      'Use proper fallbacks with security warnings',
      'Audit third-party libraries for secure random usage',
      'Test randomness quality in security-critical contexts',
      'Document security requirements for random number usage',
    ];

    practices.forEach((practice, index) => {
      console.log(`  ${index + 1}. ${practice}`);
    });
  }
}

// Main execution
if (require.main === module) {
  const auditor = new RandomSecurityAuditor();
  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('Error: src directory not found. Please run from project root.');
    process.exit(1);
  }

  console.log('🔍 Starting pseudorandom security audit...');
  console.log(`📁 Scanning directory: ${srcDir}`);
  console.log();

  auditor.scanDirectory(srcDir);
  auditor.generateReport();

  const summary = auditor.getSummary();
  if (summary.critical > 0) {
    console.log('❌ CRITICAL security issues found. Please address immediately.');
    process.exit(1);
  } else if (summary.high > 0) {
    console.log('⚠️  HIGH severity issues found. Please review and fix.');
    process.exit(1);
  } else {
    console.log('✅ No critical security issues found.');
    process.exit(0);
  }
}

module.exports = RandomSecurityAuditor;
