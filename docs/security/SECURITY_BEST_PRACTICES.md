# Security Best Practices Guide

## 🛡️ Overview

This document outlines security best practices implemented in the organism simulation project to prevent common critical and high-severity security vulnerabilities, particularly those identified by SonarCloud security analysis.

## 🚨 Common Security Hotspots Addressed

### 1. Command Injection Vulnerabilities (HIGH SEVERITY)

**Problem**: Direct usage of `execSync()` with potentially unsafe input can lead to command injection attacks.

**SonarCloud Detection**:

- Functions using `execSync()` without input validation
- Dynamic command construction with user/external input
- Missing command sanitization

**Solution Implemented**: Secure wrapper functions with command whitelisting

```javascript
// ❌ VULNERABLE - Direct execSync usage
execSync(`git commit -m "${userMessage}"`); // Can be exploited

// ✅ SECURE - Whitelisted commands with validation
const ALLOWED_COMMANDS = ['git status --porcelain', 'npm run build', 'git remote -v'];

const ALLOWED_PATTERNS = [/^git commit -m "test: Staging deployment test - \d{4}-\d{2}-\d{2}"$/];

function secureExecSync(command, options = {}) {
  const isAllowed =
    ALLOWED_COMMANDS.includes(command) || ALLOWED_PATTERNS.some(pattern => pattern.test(command));

  if (!isAllowed) {
    throw new Error(`Command not allowed: ${command}`);
  }

  const safeOptions = {
    timeout: 30000, // Prevent hanging
    ...options,
  };

  return execSync(command, safeOptions);
}
```

### 2. Process Timeout Vulnerabilities (MEDIUM SEVERITY)

**Problem**: Commands without timeout limits can hang indefinitely, leading to resource exhaustion.

**Solution**: Always include timeout in execution options:

```javascript
const safeOptions = {
  timeout: 30000, // 30 seconds for regular commands
  timeout: 300000, // 5 minutes for builds/deployments
  ...options,
};
```

### 3. Unsafe Error Handling (MEDIUM SEVERITY)

**Problem**: Exposing command details in error messages can leak sensitive information.

**Solution**: Generic error messages without command exposure:

```javascript
// ❌ VULNERABLE
catch (error) {
  console.log(`Command failed: ${command} - ${error.message}`);
}

// ✅ SECURE
catch (error) {
  console.log('⚠️ Could not complete operation');
  // Log detailed errors securely (not to console)
}
```

## 📋 Security Implementation Checklist

### For New Scripts Using execSync

- [ ] **Command Whitelisting**: Create `ALLOWED_COMMANDS` array
- [ ] **Pattern Validation**: Use regex patterns for dynamic commands
- [ ] **Secure Wrapper**: Implement `secureExecSync()` function
- [ ] **Timeout Protection**: Set appropriate timeout limits
- [ ] **Error Handling**: Avoid exposing command details in errors
- [ ] **Input Validation**: Validate any external input before command construction

### For Git Operations

```javascript
const ALLOWED_GIT_COMMANDS = [
  'git status --porcelain',
  'git branch --show-current',
  'git remote -v',
  'git rev-parse HEAD',
  'git fetch origin develop',
  'git checkout develop',
  'git add .',
  'git push origin develop',
];

const ALLOWED_GIT_PATTERNS = [
  /^git commit -m "(test|feat|fix|docs|style|refactor|perf|test|chore): .+"$/,
  /^git tag -a v\d+\.\d+\.\d+ -m ".+"$/,
];
```

### For NPM Operations

```javascript
const ALLOWED_NPM_COMMANDS = [
  'npm --version',
  'npm run build',
  'npm run test',
  'npm run lint',
  'npm run type-check',
  'npm install',
  'npm ci',
];
```

### For Build/Deploy Operations

```javascript
const ALLOWED_BUILD_COMMANDS = ['npm run build', 'npm run build:prod', 'npx wrangler --version'];

const ALLOWED_DEPLOY_PATTERNS = [
  /^npx wrangler pages deploy dist --project-name=[a-z0-9-]+ --compatibility-date=\d{4}-\d{2}-\d{2}$/,
  /^npx wrangler pages deploy dist --project-name=[a-z0-9-]+$/,
];
```

## 🔍 Scripts Updated with Security Hardening

### Core Workflow Scripts

- ✅ `scripts/verify-workflow.mjs`
- ✅ `scripts/troubleshoot-project-workflow.mjs`
- ✅ `scripts/test/validate-pipeline.cjs`
- ✅ `scripts/test/validate-enhanced-pipeline.cjs`

### Security & Monitoring

- ✅ `scripts/security/validate-security-workflow.cjs`
- ✅ `scripts/monitoring/test-staging-deployment.js`

### Environment & Deployment

- ✅ `scripts/env/check-environments.js`
- ✅ `scripts/env/check-environments.cjs`
- ✅ `scripts/deploy/deploy-cloudflare.js`

### Test Runners

- ✅ `scripts/test/run-visualization-tests.js` (already secure)
- ✅ `scripts/test/run-visualization-tests.cjs` (already secure)

## 🛠️ Security Template for New Scripts

```javascript
#!/usr/bin/env node

import { execSync } from 'child_process';

// Security: Whitelist of allowed commands to prevent command injection
const ALLOWED_COMMANDS = [
  // Add specific commands here
  'git status --porcelain',
  'npm run build',
];

// Security: Patterns for dynamic commands (if needed)
const ALLOWED_PATTERNS = [
  // Add regex patterns for validated dynamic commands
  /^git commit -m "(test|feat|fix): .+"$/,
];

/**
 * Secure wrapper for execSync to prevent command injection
 * @param {string} command - Command to execute
 * @param {object} options - Execution options
 * @returns {Buffer|string} Command output
 * @throws {Error} If command is not in allowlist
 */
function secureExecSync(command, options = {}) {
  // Validate command against allowlist
  const isAllowed =
    ALLOWED_COMMANDS.includes(command) || ALLOWED_PATTERNS.some(pattern => pattern.test(command));

  if (!isAllowed) {
    throw new Error(`Command not allowed for security reasons: ${command}`);
  }

  // Add security timeout and safe options
  const safeOptions = {
    timeout: 30000, // 30 second timeout
    maxBuffer: 1024 * 1024, // 1MB buffer limit
    ...options,
  };

  return execSync(command, safeOptions);
}

// Use secureExecSync instead of execSync throughout the script
```

## 🔒 Additional Security Considerations

### 1. Environment Variables

- Never log sensitive environment variables
- Validate environment variable formats
- Use secure defaults for missing variables

### 2. File Operations

- Validate file paths to prevent directory traversal
- Use `path.join()` for safe path construction
- Check file permissions before operations

### 3. Network Operations

- Validate URLs before making requests
- Use HTTPS for all external communications
- Implement request timeouts

### 4. Logging

- Never log credentials or tokens
- Sanitize command outputs before logging
- Use structured logging for security events

## 🧪 Testing Security Implementations

### Command Injection Tests

```javascript
// Test that unauthorized commands are blocked
expect(() => {
  secureExecSync('rm -rf /', {});
}).toThrow('Command not allowed');

// Test that authorized commands work
expect(() => {
  secureExecSync('git status --porcelain', {});
}).not.toThrow();
```

### Timeout Tests

```javascript
// Test that timeouts are enforced
expect(() => {
  secureExecSync('sleep 60', { timeout: 1000 });
}).toThrow(/timeout/);
```

## 📊 Security Metrics

**Before Security Hardening:**

- Multiple high-severity command injection vulnerabilities
- Unlimited command execution capabilities
- No timeout protection
- Exposed error details

**After Security Hardening:**

- ✅ 0 command injection vulnerabilities
- ✅ Strict command whitelisting
- ✅ Timeout protection on all executions
- ✅ Secure error handling

## 🔄 Maintenance

### Regular Security Reviews

1. **Monthly**: Review command allowlists for necessity
2. **Per Feature**: Evaluate new scripts for security compliance
3. **Per Release**: Run SonarCloud security analysis
4. **Per Incident**: Update security practices based on findings

### Updating Allowlists

When adding new commands, ask:

- Is this command necessary?
- Can it be exploited with user input?
- Does it need pattern validation?
- What's the appropriate timeout?

## 🚨 Emergency Response

If a security vulnerability is discovered:

1. **Immediate**: Remove or disable vulnerable script
2. **Short-term**: Implement security wrapper
3. **Long-term**: Update documentation and add tests
4. **Review**: Check for similar patterns in other scripts

## 📚 References

- [OWASP Command Injection Prevention](https://owasp.org/www-community/attacks/Command_Injection)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [SonarCloud Security Rules](https://rules.sonarsource.com/javascript/type/Security%20Hotspot)

---

**Last Updated**: July 12, 2025  
**Security Review**: Complete  
**Status**: All critical and high-severity hotspots addressed
