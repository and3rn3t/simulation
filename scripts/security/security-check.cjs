#!/usr/bin/env node
/* eslint-env node */

/**
 * Security Best Practices Checker
 * Validates security configurations and best practices
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  console.log(`[${timestamp}] ${icons[type]} ${message}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(path.join(projectRoot, filePath))) {
    log(`${description} exists`, 'success');
    return true;
  } else {
    log(`${description} missing: ${filePath}`, 'error');
    return false;
  }
}

function checkSecurityWorkflows() {
  log('\n🔒 Checking Security Workflows...');
  
  const securityChecks = [
    {
      file: '.github/workflows/security-advanced.yml',
      description: 'Advanced Security Workflow',
      required: ['dependency-review', 'codeql-analysis', 'supply-chain-security']
    },
    {
      file: '.github/dependabot.yml',
      description: 'Dependabot Configuration',
      required: ['npm', 'github-actions']
    },
    {
      file: '.github/codeql/codeql-config.yml',
      description: 'CodeQL Configuration',
      required: ['queries', 'paths-ignore']
    }
  ];

  let allPassed = true;

  securityChecks.forEach(check => {
    const filePath = path.join(projectRoot, check.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      check.required.forEach(requirement => {
        if (content.includes(requirement)) {
          log(`${check.description}: ${requirement} ✓`, 'success');
        } else {
          log(`${check.description}: ${requirement} missing`, 'warning');
          allPassed = false;
        }
      });
    } else {
      log(`${check.description} file missing`, 'error');
      allPassed = false;
    }
  });

  return allPassed;
}

function checkSecretsManagement() {
  log('\n🔐 Checking Secrets Management...');
  
  const secretsToCheck = [
    'CODECOV_TOKEN',
    'SNYK_TOKEN',
    'SONAR_TOKEN',
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
    'LHCI_GITHUB_APP_TOKEN'
  ];

  log('Required secrets for full functionality:');
  secretsToCheck.forEach(secret => {
    log(`  • ${secret}`, 'info');
  });

  log('📋 To set these secrets:', 'info');
  log('1. Go to: https://github.com/and3rn3t/simulation/settings/secrets/actions', 'info');
  log('2. Click "New repository secret"', 'info');
  log('3. Add each secret with appropriate values', 'info');

  return true;
}

function checkPackageJsonSecurity() {
  log('\n📦 Checking package.json Security...');
  
  const packagePath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packagePath)) {
    log('package.json not found', 'error');
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  let securityScore = 0;

  // Check for security scripts
  const securityScripts = [
    'security:audit',
    'security:scan',
    'security:fix'
  ];

  securityScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      log(`Security script '${script}' found`, 'success');
      securityScore++;
    } else {
      log(`Security script '${script}' missing`, 'warning');
    }
  });

  // Check for private flag
  if (pkg.private === true) {
    log('Package marked as private (good practice)', 'success');
    securityScore++;
  } else {
    log('Consider marking package as private', 'warning');
  }

  // Check for security-related dependencies
  const securityDeps = [
    '@types/node',
    'typescript',
    'eslint'
  ];

  securityDeps.forEach(dep => {
    if ((pkg.dependencies && pkg.dependencies[dep]) || 
        (pkg.devDependencies && pkg.devDependencies[dep])) {
      log(`Security-related dependency '${dep}' found`, 'success');
      securityScore++;
    }
  });

  log(`Security score: ${securityScore}/${securityScripts.length + 1 + securityDeps.length}`, 'info');
  return securityScore > 3;
}

function checkEnvironmentSecurity() {
  log('\n🌍 Checking Environment Security...');
  
  const envChecks = [
    {
      name: 'Git ignore',
      file: '.gitignore',
      shouldContain: ['.env', 'node_modules', 'dist', '*.log', 'coverage']
    },
    {
      name: 'Environment examples',
      file: '.env.example',
      optional: true
    }
  ];

  let allPassed = true;

  envChecks.forEach(check => {
    const filePath = path.join(projectRoot, check.file);
    if (fs.existsSync(filePath)) {
      if (check.shouldContain) {
        const content = fs.readFileSync(filePath, 'utf8');
        check.shouldContain.forEach(item => {
          if (content.includes(item)) {
            log(`${check.name}: ${item} ignored ✓`, 'success');
          } else {
            log(`${check.name}: ${item} not ignored`, 'warning');
            allPassed = false;
          }
        });
      } else {
        log(`${check.name} exists`, 'success');
      }
    } else {
      if (check.optional) {
        log(`${check.name} missing (optional)`, 'warning');
      } else {
        log(`${check.name} missing`, 'error');
        allPassed = false;
      }
    }
  });

  return allPassed;
}

function generateSecurityReport() {
  log('\n📊 Generating Security Report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      workflows: checkSecurityWorkflows(),
      secrets: checkSecretsManagement(),
      packageJson: checkPackageJsonSecurity(),
      environment: checkEnvironmentSecurity()
    }
  };

  const reportPath = path.join(projectRoot, 'security-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Security report saved to: ${reportPath}`, 'success');

  return report;
}

function main() {
  console.log('🔒 Security Best Practices Checker');
  console.log('=====================================\n');
  
  const report = generateSecurityReport();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 SECURITY ASSESSMENT SUMMARY');
  console.log('='.repeat(50));
  
  Object.entries(report.checks).forEach(([check, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ NEEDS ATTENTION';
    console.log(`${check.padEnd(20)}: ${status}`);
  });
  
  const totalChecks = Object.keys(report.checks).length;
  const passedChecks = Object.values(report.checks).filter(Boolean).length;
  const score = ((passedChecks / totalChecks) * 100).toFixed(1);
  
  console.log(`\n📊 Overall Security Score: ${score}%`);
  
  if (score >= 80) {
    console.log('🎉 Excellent security posture!');
  } else if (score >= 60) {
    console.log('⚠️ Good security, but room for improvement');
  } else {
    console.log('🚨 Security needs immediate attention');
  }
  
  console.log('\n🔗 Helpful Security Resources:');
  console.log('• GitHub Security: https://docs.github.com/en/code-security');
  console.log('• OWASP: https://owasp.org/');
  console.log('• npm Security: https://docs.npmjs.com/about-audit');
  console.log('• Snyk: https://snyk.io/');
  
  return score >= 60 ? 0 : 1;
}

if (require.main === module) {
  process.exit(main());
}
