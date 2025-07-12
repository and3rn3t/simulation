# 🔍 SonarQube Extension Setup for SonarCloud Integration

## 📋 Overview

This guide will help you set up your SonarQube VS Code extension to work seamlessly with SonarCloud for your Organism Simulation project.

## 🚀 Step-by-Step Setup

### 1. Install SonarQube Extension (if not already installed)

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "SonarQube for IDE" or "SonarLint"
4. Install the official SonarSource extension

### 2. Create SonarCloud Account & Project

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

### 3. Generate SonarCloud Token

1. In SonarCloud, click your avatar → "My Account"
2. Go to "Security" tab
3. Click "Generate Tokens"
4. **Name**: `simulation-vscode` (or similar)
5. **Type**: "User Token"
6. **Expiration**: Choose appropriate duration (90 days recommended)
7. Click "Generate"
8. **⚠️ IMPORTANT**: Copy the token immediately - you won't see it again!

### 4. Add Token to GitHub Secrets

1. Go to your GitHub repository: `https://github.com/and3rn3t/simulation`
2. Navigate to "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. **Name**: `SONAR_TOKEN`
5. **Value**: Paste the token you copied
6. Click "Add secret"

### 5. Configure VS Code SonarQube Extension

#### A. Using VS Code Settings

1. Press `Ctrl+,` to open settings
2. Search for "sonar"
3. Find "SonarLint: Connected Mode" settings
4. Click "Edit in settings.json"
5. Add the following configuration:

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

#### B. Using Command Palette (Alternative)

1. Press `Ctrl+Shift+P`
2. Type "SonarLint: Add SonarCloud connection"
3. Follow the prompts:
   - **Organization**: `and3rn3t`
   - **Token**: Paste your SonarCloud token
   - **Project**: Select your project

### 6. Test the Connection

#### A. In VS Code

1. Open a TypeScript file from your project
2. Look for SonarLint analysis in the "Problems" panel
3. You should see SonarCloud rules being applied

#### B. Run Manual Analysis

1. Press `Ctrl+Shift+P`
2. Type "SonarLint: Update binding to SonarCloud"
3. Select your project

### 7. Verify CI/CD Integration

Your workflow is already configured! Let's test it:

1. Make a small change to a file
2. Commit and push to GitHub
3. Check GitHub Actions → "Quality Monitoring" workflow
4. Verify SonarCloud analysis runs successfully
5. Check SonarCloud dashboard for results

## 🔧 Configuration Files

Your `sonar-project.properties` is already configured, but here's the optimal setup:

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
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "No SonarCloud project found"

- Verify your organization key and project key are correct
- Ensure you have access to the SonarCloud project
- Check that the SONAR_TOKEN secret is properly set

#### 2. "Authentication failed"

- Regenerate your SonarCloud token
- Update the token in both GitHub secrets and VS Code settings
- Ensure the token has the correct permissions

#### 3. "Analysis not running in CI/CD"

- Check that `SONAR_TOKEN` is set in GitHub secrets
- Verify the workflow file includes the SonarCloud action
- Check workflow logs for error messages

#### 4. "No issues showing in VS Code"

- Restart VS Code after configuration
- Run "SonarLint: Update binding to SonarCloud" command
- Check the SonarLint output panel for errors

### Getting Help

- SonarCloud Documentation: [https://docs.sonarcloud.io/](https://docs.sonarcloud.io/)
- SonarLint VS Code Extension: [https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode)
- Community Forum: [https://community.sonarsource.com/](https://community.sonarsource.com/)

## ✅ Success Checklist

- [ ] SonarQube extension installed in VS Code
- [ ] SonarCloud account created and linked to GitHub
- [ ] Project imported in SonarCloud
- [ ] Token generated and added to GitHub secrets
- [ ] VS Code extension configured with connection
- [ ] Local analysis showing in Problems panel
- [ ] CI/CD workflow running SonarCloud analysis
- [ ] Results visible in SonarCloud dashboard

## 🎯 Next Steps

Once SonarCloud is configured:

1. **Review Quality Profile**: Check your code quality rules in SonarCloud
2. **Set Quality Gate**: Configure pass/fail criteria for your project
3. **Monitor Trends**: Use SonarCloud dashboard to track code quality over time
4. **Fix Issues**: Address any issues identified by SonarCloud
5. **Integrate with PRs**: Use SonarCloud PR decoration to catch issues early

Your Organism Simulation project will now have enterprise-grade code quality monitoring! 🎉
