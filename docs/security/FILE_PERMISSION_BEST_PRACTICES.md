# File Permission Security Best Practices

## Executive Summary

This document establishes mandatory security practices for file operations to prevent permission-related vulnerabilities. These practices are derived from security incidents and must be followed in all code contributions.

## Mandatory Security Patterns

### 1. File Creation Security Pattern

**REQUIRED**: Every file creation operation must include explicit permission setting.

```javascript
// ✅ MANDATORY PATTERN - Always use this approach
function secureFileCreation(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    fs.chmodSync(filePath, 0o644); // REQUIRED: Read-write owner, read-only others
    log(`File created with secure permissions: ${filePath}`, 'success');
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('File creation failed'),
      ErrorSeverity.HIGH,
      'Secure file creation'
    );
    throw error;
  }
}

// ❌ SECURITY VIOLATION - Never do this
function insecureFileCreation(filePath, content) {
  fs.writeFileSync(filePath, content); // VULNERABLE: No permission setting
}
```

### 2. File Copying Security Pattern

```javascript
// ✅ MANDATORY PATTERN - Secure file copying
function secureFileCopy(sourcePath, targetPath) {
  try {
    fs.copyFileSync(sourcePath, targetPath);
    fs.chmodSync(targetPath, 0o644); // REQUIRED: Secure permissions
    log(`File copied with secure permissions: ${targetPath}`, 'success');
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('File copy failed'),
      ErrorSeverity.HIGH,
      'Secure file copying'
    );
    throw error;
  }
}
```

### 3. Directory Creation Security Pattern

```javascript
// ✅ MANDATORY PATTERN - Secure directory creation
function secureDirectoryCreation(dirPath) {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    fs.chmodSync(dirPath, 0o755); // REQUIRED: Traversable but not writable by others
    log(`Directory created with secure permissions: ${dirPath}`, 'success');
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('Directory creation failed'),
      ErrorSeverity.HIGH,
      'Secure directory creation'
    );
    throw error;
  }
}
```

## Docker Security Requirements

### 1. Dockerfile Permission Rules

**MANDATORY**: Use specific file and directory permissions in all Dockerfiles.

```dockerfile
# ✅ REQUIRED PATTERN - Specific permissions for security
COPY --chown=user:group source/ /destination/
RUN find /destination -type f -exec chmod 644 {} \; && \
    find /destination -type d -exec chmod 755 {} \; && \
    chown -R user:group /destination

# ❌ SECURITY VIOLATION - Never use broad permissions
COPY source/ /destination/
RUN chmod -R 755 /destination  # VULNERABLE: Too permissive
```

### 2. Non-Root Container Requirements

```dockerfile
# ✅ MANDATORY PATTERN - Non-root container security
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
RUN chown -R appuser:appgroup /app

# Switch to non-root user before any operations
USER appuser

# Copy with proper ownership and permissions
COPY --chown=appuser:appgroup . .
RUN find /app -type f -exec chmod 644 {} \; && \
    find /app -type d -exec chmod 755 {} \;
```

## Permission Level Standards

### File Permission Matrix

| File Type           | Permission | Octal   | Rationale                              |
| ------------------- | ---------- | ------- | -------------------------------------- |
| Configuration files | `644`      | `0o644` | Read-write owner, read-only others     |
| Data files          | `644`      | `0o644` | Prevents unauthorized modification     |
| Log files           | `644`      | `0o644` | Secure logging, readable for debugging |
| Executable scripts  | `755`      | `0o755` | Executable by owner, read-only others  |
| Sensitive files     | `600`      | `0o600` | Owner-only access for secrets          |
| Directories         | `755`      | `0o755` | Traversable but not writable by others |

### Environment-Specific Permissions

```javascript
// Environment file permissions based on sensitivity
const ENV_PERMISSIONS = {
  '.env.development': 0o644, // Development - less sensitive
  '.env.staging': 0o640, // Staging - group readable
  '.env.production': 0o600, // Production - owner only
  '.env.local': 0o600, // Local secrets - owner only
};

function setEnvironmentFilePermissions(envFile) {
  const permission = ENV_PERMISSIONS[path.basename(envFile)] || 0o644;
  fs.chmodSync(envFile, permission);
}
```

## Code Review Requirements

### Security Checklist for File Operations

**MANDATORY CHECKS** for all pull requests involving file operations:

- [ ] **Permission Setting**: Every `writeFileSync()` followed by `chmodSync()`
- [ ] **Copy Operations**: Every `copyFileSync()` followed by `chmodSync()`
- [ ] **Directory Creation**: Every `mkdirSync()` followed by `chmodSync()`
- [ ] **Error Handling**: File operations wrapped in try-catch blocks
- [ ] **Permission Level**: Appropriate permission level for file type
- [ ] **Documentation**: Permission rationale documented in code comments
- [ ] **Testing**: Automated tests verify correct permissions

### Automated Validation

```javascript
// REQUIRED: Add to test suites for file operation validation
describe('File Permission Security', () => {
  it('should set correct permissions on created files', () => {
    const testFile = 'test-output.json';
    secureFileCreation(testFile, '{}');

    const stats = fs.statSync(testFile);
    const permissions = (stats.mode & parseInt('777', 8)).toString(8);
    expect(permissions).toBe('644');

    fs.unlinkSync(testFile);
  });
});
```

## CI/CD Integration

### Pre-commit Hooks

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
echo "🔍 Checking file permission security..."

# Check for file operations without permission setting
if grep -r "writeFileSync\|copyFileSync" --include="*.js" --include="*.ts" --include="*.mjs" --include="*.cjs" src/ scripts/ | grep -v "chmodSync"; then
  echo "❌ File operations without permission setting detected!"
  echo "Add fs.chmodSync() after file creation/copying operations"
  exit 1
fi

echo "✅ File permission security check passed"
```

### GitHub Actions Validation

```yaml
- name: Validate File Permissions
  run: |
    echo "Checking for insecure file operations..."
    if find . -name "*.js" -o -name "*.ts" -o -name "*.mjs" -o -name "*.cjs" | \
       xargs grep -l "writeFileSync\|copyFileSync" | \
       xargs grep -L "chmodSync"; then
      echo "Files with insecure operations found"
      exit 1
    fi
    echo "File permission validation passed"
```

## Security Templates

### Template for New Scripts

```javascript
#!/usr/bin/env node
/**
 * Script Template with Security Best Practices
 */

const fs = require('fs');
const path = require('path');
const { ErrorHandler, ErrorSeverity } = require('../utils/system/errorHandler');

/**
 * Secure file creation template
 * @param {string} filePath - Target file path
 * @param {string} content - File content
 */
function secureFileCreation(filePath, content) {
  try {
    // Validate input
    if (!filePath || !content) {
      throw new Error('File path and content are required');
    }

    // Create file with content
    fs.writeFileSync(filePath, content);

    // SECURITY: Always set appropriate permissions
    fs.chmodSync(filePath, 0o644); // Read-write owner, read-only others

    console.log(`✅ File created securely: ${filePath}`);
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('File creation failed'),
      ErrorSeverity.HIGH,
      'Secure file creation'
    );
    throw error;
  }
}

// Export for reuse
module.exports = { secureFileCreation };
```

### Template for Docker Files

```dockerfile
# Secure Dockerfile Template
FROM node:20-alpine AS builder

# Security: Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
RUN chown -R appuser:appgroup /app
USER appuser

# Copy package files with proper ownership
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci

# Copy source with proper ownership
COPY --chown=appuser:appgroup . .

# Security: Set specific file permissions
RUN find /app -type f -exec chmod 644 {} \; && \
    find /app -type d -exec chmod 755 {} \; && \
    chmod 755 /app/node_modules/.bin/* 2>/dev/null || true

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Use existing nginx user
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run

# Copy with secure permissions
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Security: Set proper permissions on all copied files
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    chmod 644 /etc/nginx/nginx.conf

USER nginx
```

## Incident Response

### If Permission Vulnerabilities Are Found

1. **Immediate Assessment**: Run security audit script
2. **Impact Analysis**: Identify affected files and exposure risk
3. **Quick Fix**: Apply correct permissions to vulnerable files
4. **Root Cause**: Identify why permissions weren't set correctly
5. **Prevention**: Update code to include proper permission setting
6. **Verification**: Test fix and run security validation
7. **Documentation**: Update this guide with new findings

### Emergency Permission Fix Script

```bash
#!/bin/bash
# Emergency script to fix common permission issues

echo "🚨 Emergency permission fix starting..."

# Fix overly permissive configuration files
find . -name "*.json" -o -name "*.yml" -o -name "*.yaml" | while read file; do
  if [[ -w "$file" ]] && [[ $(stat -c "%a" "$file") != "644" ]]; then
    chmod 644 "$file"
    echo "Fixed: $file"
  fi
done

# Fix executable data files
find . -name "*.md" -o -name "*.txt" -o -name "*.log" | while read file; do
  if [[ -x "$file" ]]; then
    chmod 644 "$file"
    echo "Removed execute permission: $file"
  fi
done

echo "✅ Emergency permission fix complete"
```

## Compliance and Auditing

### Regular Security Audits

**REQUIRED**: Monthly security audits using this checklist:

- [ ] Scan all file operations for permission setting
- [ ] Verify Docker files use specific permissions
- [ ] Check environment files have appropriate restrictions
- [ ] Validate CI/CD includes permission checks
- [ ] Review new code for security pattern compliance
- [ ] Test permission validation in automated tests

### Documentation Requirements

**MANDATORY**: All security-sensitive code must include:

```javascript
// SECURITY: Setting read-only permissions (644) to prevent unauthorized modification
// Rationale: Configuration files should not be writable by group/others
fs.chmodSync(configFile, 0o644);
```

## Training and Resources

### Required Reading

- [OWASP File System Security](https://owasp.org/www-community/vulnerabilities/Path_Traversal)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Internal Resources

- [File Permission Security Lessons](./FILE_PERMISSION_SECURITY_LESSONS.md)
- [Docker Security Guide](./DOCKER_SECURITY_GUIDE.md)
- [Security Implementation Guide](./SECURITY_IMPLEMENTATION_GUIDE.md)

---

**Compliance Level**: MANDATORY  
**Last Updated**: July 12, 2025  
**Review Frequency**: Monthly  
**Next Review**: August 12, 2025
