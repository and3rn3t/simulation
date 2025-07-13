# Security Implementation Guide

## Overview

This guide provides practical implementation patterns to avoid the critical and high-severity security hotspots that were identified and resolved in our CI/CD pipeline scripts.

## The Core Problem: Command Injection

**What SonarCloud detected:** Direct usage of `execSync()` without proper input validation creates command injection vulnerabilities that can allow attackers to execute arbitrary commands on the system.

## Our Solution: Secure Wrapper Pattern

### Implementation Template

```javascript
// Security: Whitelist of allowed commands
const ALLOWED_COMMANDS = ['git status --porcelain', 'npm run build', 'npm run test'];

// Security: Patterns for dynamic but controlled commands
const ALLOWED_PATTERNS = [/^git commit -m "(feat|fix|docs|test|chore): .+"$/, /^npm run test:.+$/];

function secureExecSync(command, options = {}) {
  // Validate against whitelist
  const isAllowed =
    ALLOWED_COMMANDS.includes(command) || ALLOWED_PATTERNS.some(pattern => pattern.test(command));

  if (!isAllowed) {
    throw new Error(`Command not allowed: ${command}`);
  }

  // Security-hardened options
  const safeOptions = {
    timeout: 30000, // 30 second timeout
    maxBuffer: 1024 * 1024, // 1MB buffer limit
    ...options,
  };

  return execSync(command, safeOptions);
}
```

## Real-World Examples from Our Codebase

### 1. Git Operations Security

**File:** `scripts/monitoring/test-staging-deployment.js`

```javascript
const ALLOWED_COMMANDS = [
  'git branch --show-current',
  'git status --porcelain',
  'git branch',
  'git fetch origin develop',
  'git rev-parse develop',
  'git rev-parse origin/develop',
  'git checkout develop',
  'git add staging-test.txt',
  'git rm staging-test.txt',
  'git push origin develop',
];

const ALLOWED_COMMIT_PATTERNS = [
  /^git commit -m "test: Staging deployment test - \d{4}-\d{2}-\d{2}"$/,
  /^git commit -m "cleanup: Remove staging test file"$/,
];
```

### 2. Build/Deploy Operations Security

**File:** `scripts/deploy/deploy-cloudflare.js`

```javascript
const ALLOWED_COMMANDS = [
  'git rev-parse HEAD',
  'git branch --show-current',
  'npx wrangler --version',
  'npm run build',
];

const ALLOWED_WRANGLER_PATTERNS = [
  /^npx wrangler pages deploy dist --project-name=organism-simulation --compatibility-date=\d{4}-\d{2}-\d{2}$/,
  /^npx wrangler pages deploy dist --project-name=organism-simulation$/,
];
```

### 3. Testing and Validation Security

**File:** `scripts/verify-workflow.mjs`

```javascript
const ALLOWED_COMMANDS = [
  'npm --version',
  'node --version',
  'git --version',
  'npm run lint',
  'npm run build',
  'npm test',
  'npm run test:unit',
  'npm run workflow:validate',
  'npm run env:check',
  'npm run type-check',
  'git status --porcelain',
  'git remote -v',
];
```

## Security Benefits Achieved

### Before Hardening

- ❌ **Command Injection**: Any script could execute arbitrary commands
- ❌ **Resource Exhaustion**: Commands could run indefinitely
- ❌ **Information Disclosure**: Full error details exposed
- ❌ **Privilege Escalation**: Potential for system-level access

### After Hardening

- ✅ **Command Whitelisting**: Only pre-approved commands can execute
- ✅ **Timeout Protection**: All commands have execution limits
- ✅ **Secure Error Handling**: No sensitive information in error output
- ✅ **Input Validation**: Dynamic commands validated against patterns

## Implementation Guidelines

### Adding New Commands

1. **Evaluate Necessity**: Do you really need to execute this command?
2. **Static vs Dynamic**: Can the command be static or does it need dynamic parts?
3. **Security Impact**: What's the worst case if this command is exploited?
4. **Pattern Design**: If dynamic, create a restrictive regex pattern

### Command Categories and Timeouts

```javascript
// Quick operations (30 seconds)
'git status --porcelain';
'npm --version';
'git remote -v';

// Build operations (5 minutes)
'npm run build';
'npm ci';

// Deploy operations (10 minutes)
'npx wrangler pages deploy ...';
```

### Pattern Design Best Practices

```javascript
// ✅ Good: Restrictive and specific
/^git commit -m "(feat|fix|docs): [a-zA-Z0-9\s\-\.]+\"$/

// ❌ Bad: Too permissive
/^git commit -m ".*"$/

// ✅ Good: Validates format and content
/^npm run test:[a-z0-9\-]+$/

// ❌ Bad: Allows any script name
/^npm run .*$/
```

## Testing Your Security Implementation

### Unit Tests

```javascript
describe('secureExecSync', () => {
  it('should allow whitelisted commands', () => {
    expect(() => {
      secureExecSync('git status --porcelain');
    }).not.toThrow();
  });

  it('should block unauthorized commands', () => {
    expect(() => {
      secureExecSync('rm -rf /');
    }).toThrow('Command not allowed');
  });

  it('should enforce timeouts', () => {
    expect(() => {
      secureExecSync('sleep 60', { timeout: 1000 });
    }).toThrow(/timeout/);
  });
});
```

### Manual Testing

```bash
# Test legitimate operations
node scripts/verify-workflow.mjs

# Verify error handling (should fail safely)
node -e "require('./scripts/verify-workflow.mjs').secureExecSync('malicious-command')"
```

## Common Mistakes to Avoid

### 1. Overly Permissive Patterns

```javascript
// ❌ BAD: Allows anything after git
/^git .*/

// ✅ GOOD: Specific git operations only
/^git (status|branch|remote) --[a-z-]+$/
```

### 2. Missing Timeout Protection

```javascript
// ❌ BAD: No timeout
execSync('npm run build');

// ✅ GOOD: Appropriate timeout
secureExecSync('npm run build', { timeout: 300000 });
```

### 3. Exposing Command Details in Errors

```javascript
// ❌ BAD: Reveals command structure
throw new Error(`Failed to execute: ${command}`);

// ✅ GOOD: Generic error message
throw new Error('Command not allowed for security reasons');
```

## Maintenance and Updates

### Monthly Security Review

- Review all ALLOWED_COMMANDS arrays
- Check for unused commands that can be removed
- Verify timeout values are appropriate
- Test error handling paths

### Adding New Scripts

1. Copy security template from existing script
2. Define minimal ALLOWED_COMMANDS for your use case
3. Add timeout appropriate for operation type
4. Test both success and failure paths
5. Document any new patterns in this guide

## Integration with Development Workflow

### Pre-commit Hook (Future Enhancement)

```bash
#!/bin/sh
# Check for unsafe execSync usage
if grep -r "execSync(" scripts/ --include="*.js" --include="*.mjs" --include="*.cjs" | grep -v "secureExecSync"; then
  echo "❌ Found unsafe execSync usage. Use secureExecSync instead."
  exit 1
fi
```

### IDE Integration

- Configure linter to warn on direct execSync usage
- Add code snippets for secure wrapper pattern
- Set up security-focused code review templates

---

**Remember**: Security is not a one-time implementation but an ongoing practice. Always validate new commands against the principle of least privilege and defense in depth.
