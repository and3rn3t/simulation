# 🚨 Security Hotspots Quick Reference

## Critical & High Severity Vulnerabilities to Avoid

### 1. Command Injection (CRITICAL)

**❌ Never Do:**

```javascript
execSync(`git commit -m "${userInput}"`);
execSync(userProvidedCommand);
execSync(`npm run ${scriptName}`);
```

**✅ Always Do:**

```javascript
// Create whitelist
const ALLOWED_COMMANDS = ['git status --porcelain', 'npm run build'];

// Use secure wrapper
function secureExecSync(command, options = {}) {
  if (!ALLOWED_COMMANDS.includes(command)) {
    throw new Error(`Command not allowed: ${command}`);
  }
  return execSync(command, { timeout: 30000, ...options });
}
```

### 2. Timeout Vulnerabilities (HIGH)

**❌ Never Do:**

```javascript
execSync('npm run build'); // No timeout
execSync('git fetch', { timeout: 0 }); // Infinite timeout
```

**✅ Always Do:**

```javascript
execSync('npm run build', { timeout: 300000 }); // 5 min for builds
execSync('git status', { timeout: 30000 }); // 30 sec for quick ops
```

### 3. Information Disclosure (MEDIUM)

**❌ Never Do:**

```javascript
catch (error) {
  console.log(`Command failed: ${command} - ${error.stderr}`);
}
```

**✅ Always Do:**

```javascript
catch (error) {
  console.log('⚠️ Operation failed');
  // Log details securely, not to console
}
```

## 🛡️ Security Implementation Pattern

```javascript
#!/usr/bin/env node
import { execSync } from 'child_process';

// 1. Define allowed commands
const ALLOWED_COMMANDS = ['git status --porcelain', 'npm run build'];

// 2. Define patterns for dynamic commands
const ALLOWED_PATTERNS = [/^git commit -m "(feat|fix|docs): .+"$/];

// 3. Create secure wrapper
function secureExecSync(command, options = {}) {
  const isAllowed =
    ALLOWED_COMMANDS.includes(command) || ALLOWED_PATTERNS.some(p => p.test(command));

  if (!isAllowed) {
    throw new Error(`Command not allowed: ${command}`);
  }

  return execSync(command, {
    timeout: 30000,
    maxBuffer: 1024 * 1024,
    ...options,
  });
}

// 4. Use only secureExecSync, never raw execSync
```

## 🔍 SonarCloud Rules We Address

- **S2076**: OS commands should not be vulnerable to injection attacks
- **S4721**: Executing OS commands is security-sensitive
- **S5852**: Slow regular expressions are security-sensitive
- **S4423**: Weak SSL/TLS protocols should not be used

## ✅ Quick Security Checklist

Before committing any script with `execSync`:

- [ ] All commands are in whitelist or match approved patterns
- [ ] Timeout is set (30s for quick ops, 300s for builds)
- [ ] No user input directly in commands
- [ ] Error handling doesn't expose command details
- [ ] Function name is `secureExecSync` not `execSync`

## 🚨 Emergency: If You Find a Vulnerability

1. **Immediate**: Comment out vulnerable code
2. **Add**: Secure wrapper with whitelist
3. **Test**: Verify legitimate commands still work
4. **Commit**: With message `security: fix command injection in [script]`

## 📍 Files Already Secured

All scripts in these directories have been security-hardened:

- `scripts/verify-workflow.mjs`
- `scripts/troubleshoot-project-workflow.mjs`
- `scripts/test/validate-*.cjs`
- `scripts/security/validate-*.cjs`
- `scripts/monitoring/test-*.js`
- `scripts/env/check-*.js`
- `scripts/deploy/deploy-*.js`

---

**Security Status**: ✅ All critical/high hotspots resolved  
**Last Review**: July 12, 2025
