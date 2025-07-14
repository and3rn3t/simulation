# SonarCloud Quality Gate Configuration Guide

This document outlines how to configure practical quality gates in SonarCloud with development-friendly thresholds.

## Current Thresholds (Development-Friendly)

### 1. SonarCloud Quality Gate Settings

Access SonarCloud dashboard → Project Settings → Quality Gates to configure:

#### Code Coverage (Practical Targets)

- **Overall Coverage**: ≥ 75% (achievable target)
- **New Code Coverage**: ≥ 70% (reasonable for new features)
- **Coverage on New Lines**: ≥ 70%

#### Code Duplication (Lenient)

- **Duplicated Lines**: ≤ 15% (allows for reasonable patterns and templates)
- **Duplicated Blocks**: ≤ 10 (allows for common code patterns)

#### Maintainability (Balanced)

- **Maintainability Rating**: A-B (≤ 8% technical debt ratio)
- **Technical Debt**: ≤ 8% (reasonable for active development)
- **Code Smells**: Warnings only, not blocking

#### Reliability (Important)

- **Reliability Rating**: A-B (few bugs acceptable)
- **Bugs**: ≤ 5 on new code (small bugs don't block development)

#### Security (Critical)

- **Security Rating**: A (0 vulnerabilities - this remains strict)
- **Security Hotspots**: Review required, but not blocking
- **Vulnerabilities**: ≤ 0 on new code (security is non-negotiable)

### 2. Local Configuration Thresholds

#### ESLint Complexity Rules (Lenient)

```javascript
complexity: ['warn', 15]                   // Increased from 8 (more lenient)
'max-depth': ['warn', 6]                   // Increased from 4 (more lenient)
'max-lines-per-function': ['warn', 100]    // Increased from 50 (more lenient)
'max-params': ['warn', 8]                  // Increased from 5 (more lenient)
```

#### Codecov Thresholds

```yaml
project:
  target: 75% # Decreased to achievable level
  threshold: 5% # Increased for more lenient failures
patch:
  target: 70% # Decreased to practical level
  threshold: 10% # Much more lenient
```

#### CI/CD Quality Gate (GitHub Actions)

- **Quality Score Required**: 70/100 (decreased from 80/100 for easier deployment)
- **Test Coverage Required**: Pass (with lenient thresholds)
- **ESLint Errors**: 0 allowed (but warnings are fine)
- **TypeScript Errors**: 0 allowed (compilation must succeed)
- **Code Complexity Health Score**: ≥ 70% (decreased from 80%)

### 3. Available Quality Gate Scripts

```bash
# Standard quality gate (development-friendly)
npm run quality:gate

# Lenient quality gate (for rapid development)
npm run quality:gate:lenient

# Individual checks
npm run quality:check
npm run complexity:check
```

## Key Benefits of Lenient Thresholds

### 1. **Development Velocity**

- Faster iteration cycles
- Less blocking on minor quality issues
- Focus on critical bugs and security issues

### 2. **Code Duplication Strategy**

- **15% threshold** allows for:
  - Common utility patterns
  - Template code structures
  - Generated code snippets
  - Legitimate architectural patterns

### 3. **Practical Coverage Goals**

- **75% coverage** is achievable without over-testing
- **70% for new code** encourages testing without blocking features
- Focuses on testing critical paths rather than 100% coverage

### 4. **Security First Approach**

- **Zero tolerance for security vulnerabilities** (non-negotiable)
- **Quality issues as warnings** (informative, not blocking)
- **Deployment flexibility** for urgent fixes
