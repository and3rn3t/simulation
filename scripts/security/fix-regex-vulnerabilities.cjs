#!/usr/bin/env node

/**
 * Regex Security Fix Script
 *
 * This script fixes all identified ReDoS (Regular Expression Denial of Service)
 * vulnerabilities across the codebase by replacing vulnerable patterns with
 * secure alternatives.
 *
 * Fixes applied:
 * 1. Mobile device detection regex patterns (ReDoS vulnerable)
 * 2. Ternary operator detection in complexity analysis
 * 3. YAML workflow validation patterns
 * 4. Data URL validation patterns
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix =
    type === 'success'
      ? colors.green + '✅'
      : type === 'warning'
        ? colors.yellow + '⚠️'
        : type === 'error'
          ? colors.red + '❌'
          : colors.cyan + 'ℹ️';

  console.log(`[${timestamp}] ${prefix} ${message}${colors.reset}`);
}

// File patterns to update
const filesToUpdate = [
  'src/utils/mobile/MobileVisualEffects.ts',
  'src/utils/mobile/MobileUIEnhancer.ts',
  'src/utils/mobile/MobilePerformanceManager.ts',
  'src/utils/mobile/MobileCanvasManager.ts',
];

// Security fixes to apply
const securityFixes = [
  {
    // Fix mobile detection regex in multiple mobile utility files
    pattern:
      /\/Android\|webOS\|iPhone\|iPad\|iPod\|BlackBerry\|IEMobile\|Opera Mini\/i\.test\(([^)]+)\)/g,
    replacement: (match, userAgentVar) => {
      return `isMobileDevice(${userAgentVar === 'navigator.userAgent' ? '' : userAgentVar})`;
    },
    description: 'Replace vulnerable mobile detection regex with secure utility function',
    addImport: "import { isMobileDevice } from '../system/mobileDetection';",
  },
];

function applySecurityFixes() {
  log('🔒 Starting Regex Security Fix Process...', 'info');

  let totalFilesFixed = 0;
  let totalVulnerabilitiesFixed = 0;

  filesToUpdate.forEach(filePath => {
    const fullPath = path.resolve(filePath);

    if (!fs.existsSync(fullPath)) {
      log(`File not found: ${filePath}`, 'warning');
      return;
    }

    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      let fileModified = false;
      let vulnerabilitiesInFile = 0;

      securityFixes.forEach(fix => {
        const matches = content.match(fix.pattern);
        if (matches) {
          log(`Found ${matches.length} vulnerable pattern(s) in ${filePath}`, 'warning');

          // Apply the fix
          content = content.replace(fix.pattern, fix.replacement);

          // Add import if needed and not already present
          if (fix.addImport && !content.includes(fix.addImport)) {
            // Find the first import or add at the top
            const importInsertPoint = content.indexOf('import ');
            if (importInsertPoint !== -1) {
              content =
                content.substring(0, importInsertPoint) +
                fix.addImport +
                '\\n' +
                content.substring(importInsertPoint);
            } else {
              content = fix.addImport + '\\n\\n' + content;
            }
          }

          vulnerabilitiesInFile += matches.length;
          fileModified = true;
        }
      });

      if (fileModified) {
        fs.writeFileSync(fullPath, content);
        log(`Fixed ${vulnerabilitiesInFile} vulnerabilities in ${filePath}`, 'success');
        totalFilesFixed++;
        totalVulnerabilitiesFixed += vulnerabilitiesInFile;
      }
    } catch (error) {
      log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  });

  // Summary
  log(`${colors.bold}🔒 Security Fix Summary:${colors.reset}`, 'info');
  log(`Files processed: ${filesToUpdate.length}`, 'info');
  log(`Files fixed: ${totalFilesFixed}`, 'success');
  log(`Total vulnerabilities fixed: ${totalVulnerabilitiesFixed}`, 'success');

  if (totalVulnerabilitiesFixed > 0) {
    log('⚠️ Important: Run tests to ensure all fixes work correctly', 'warning');
    log('📝 Consider updating any documentation that references the old patterns', 'info');
  } else {
    log('✅ No additional regex vulnerabilities found to fix', 'success');
  }
}

// Additional manual fixes already applied:
function reportManualFixes() {
  log(`${colors.bold}📋 Manual Fixes Already Applied:${colors.reset}`, 'info');

  const manualFixes = [
    {
      file: 'scripts/quality/code-complexity-audit.cjs',
      fix: 'Ternary operator regex: /\\?\\s*.*?\\s*:/g → /\\?\\s*[^:]*:/g',
      vulnerability: 'Nested quantifiers causing exponential backtracking',
    },
    {
      file: 'scripts/setup/validate-workflow.js',
      fix: 'YAML validation regex: /[\\s\\S]*?/ → /[^}]*/',
      vulnerability: 'Lazy quantifiers with greedy alternation',
    },
    {
      file: 'src/utils/mobile/MobileSocialManager.ts',
      fix: 'Data URL validation: regex → string methods',
      vulnerability: 'Complex regex with alternation groups',
    },
    {
      file: 'src/utils/mobile/MobileTestInterface.ts',
      fix: 'Mobile detection: vulnerable regex → secure utility function',
      vulnerability: 'Regex alternation with user input',
    },
  ];

  manualFixes.forEach((fix, index) => {
    log(`${index + 1}. ${fix.file}`, 'info');
    log(`   Fix: ${fix.fix}`, 'success');
    log(`   Vulnerability: ${fix.vulnerability}`, 'warning');
  });
}

// Run the security fixes
if (require.main === module) {
  applySecurityFixes();
  console.log(''); // Empty line
  reportManualFixes();

  log(`${colors.bold}🎯 Next Steps:${colors.reset}`, 'info');
  log('1. Run: npm run lint to check for any syntax issues', 'info');
  log('2. Run: npm run test to verify functionality', 'info');
  log('3. Run: npm run build to ensure production build works', 'info');
  log('4. Review and test mobile device detection functionality', 'info');
}

module.exports = {
  applySecurityFixes,
  reportManualFixes,
};
