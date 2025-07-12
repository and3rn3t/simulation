# 🔍 SonarQube Extension Setup for SonarCloud Integration

## 📋 Overview

This guide will help you set up your SonarQube VS Code extension to work seamlessly with SonarCloud for your Organism Simulation project.

## 🚀 Step-by-Step Setup

### 1. **Install SonarQube Extension** (if not already installed)

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "SonarQube for IDE" or "SonarLint"
4. Install the official SonarSource extension

### 2. **Create SonarCloud Account & Project**

#### A. Sign up for SonarCloud

1. Go to [https://sonarcloud.io/](https://sonarcloud.io/)
2. Click "Sign up" and authenticate with your GitHub account
3. Grant necessary permissions to access your repositories

#### B. Import Your Project

1. Once logged in, click "+" → "Analyze new project"
2. Select your GitHub organization (`and3rn3t`)
3. Find and select the `simulation` repository
4. Click "Set up"

#### C. Configure Project Settings

1. **Organization**: Should be auto-filled (likely `and3rn3t`)
2. **Project Key**: Use `and3rn3t_simulation` (or auto-generated)
3. **Display Name**: "Organism Simulation"
4. Click "Set up project"

### 3. **Generate SonarCloud Token**

1. In SonarCloud, click your avatar → "My Account"
2. Go to "Security" tab
3. Click "Generate Tokens"
4. **Name**: `simulation-vscode` (or similar)
5. **Type**: "User Token"
6. **Expiration**: Choose appropriate duration (90 days recommended)
7. Click "Generate"
8. **⚠️ IMPORTANT**: Copy the token immediately - you won't see it again!

### 4. **Add Token to GitHub Secrets**

1. Go to your GitHub repository: `https://github.com/and3rn3t/simulation`
2. Navigate to "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. **Name**: `SONAR_TOKEN`
5. **Value**: Paste the token you copied
6. Click "Add secret"

### 5. **Update sonar-project.properties**

Your current configuration is good, but let's optimize it for SonarCloud:

```properties
# SonarCloud configuration
sonar.organization=and3rn3t
sonar.projectKey=and3rn3t_simulation
sonar.projectName=Organism Simulation
sonar.projectVersion=1.0.0

# Source code
sonar.sources=src/
sonar.exclusions=**/*.test.ts,**/*.spec.ts,**/node_modules/**,**/dist/**,**/coverage/**

# Test files  
sonar.tests=test/,e2e/
sonar.test.inclusions=**/*.test.ts,**/*.spec.ts

# Coverage
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Language
sonar.language=typescript

# Code analysis
sonar.typescript.tsconfigPath=tsconfig.json

# Quality gates
sonar.qualitygate.wait=true

# URLs (for SonarCloud)
sonar.host.url=https://sonarcloud.io

# Disable problematic rules for Canvas/Gaming project
sonar.issue.ignore.multicriteria=e1,e2,e3,e4,e5
sonar.issue.ignore.multicriteria.e1.ruleKey=typescript:S1134
sonar.issue.ignore.multicriteria.e1.resourceKey=**/*.ts
sonar.issue.ignore.multicriteria.e2.ruleKey=typescript:S2371
sonar.issue.ignore.multicriteria.e2.resourceKey=**/*.ts
sonar.issue.ignore.multicriteria.e3.ruleKey=javascript:S1481
sonar.issue.ignore.multicriteria.e3.resourceKey=**/*.ts
sonar.issue.ignore.multicriteria.e4.ruleKey=typescript:S125
sonar.issue.ignore.multicriteria.e4.resourceKey=**/*.ts
sonar.issue.ignore.multicriteria.e5.ruleKey=typescript:S1116
sonar.issue.ignore.multicriteria.e5.resourceKey=**/*.ts
```

### 6. **Configure VS Code SonarQube Extension**

#### A. Open VS Code Settings

1. Press `Ctrl+,` to open settings
2. Search for "sonar"

#### B. Configure Connection

1. Find "SonarLint: Connected Mode" settings
2. Click "Edit in settings.json"
3. Add the following configuration:

```json
{
  "sonarlint.connectedMode.connections.sonarcloud": [
    {
      "organizationKey": "and3rn3t",
      "token": "YOUR_SONAR_TOKEN_HERE"
    }
  ],
  "sonarlint.connectedMode.project": {
    "connectionId": "and3rn3t",
    "projectKey": "and3rn3t_simulation"
  }
}
```

#### C. Alternative: Use Command Palette

1. Press `Ctrl+Shift+P`
2. Type "SonarLint: Add SonarCloud connection"
3. Follow the prompts:
   - **Organization**: `and3rn3t`
   - **Token**: Paste your SonarCloud token
   - **Project**: Select your project

### 7. **Test the Connection**

#### A. In VS Code

1. Open a TypeScript file from your project
2. Look for SonarLint analysis in the "Problems" panel
3. You should see SonarCloud rules being applied

#### B. Run Manual Analysis

1. Press `Ctrl+Shift+P`
2. Type "SonarLint: Update binding to SonarCloud"
3. Select your project

### 8. **Verify CI/CD Integration**

Your workflow is already configured! Let's test it:

1. Make a small change to a file
2. Commit and push to GitHub
3. Check GitHub Actions → "Quality Monitoring" workflow
4. Verify SonarCloud analysis runs successfully
5. Check SonarCloud dashboard for results

## 🔧 Configuration Files Update

Let me update your configuration files for optimal SonarCloud integration:
