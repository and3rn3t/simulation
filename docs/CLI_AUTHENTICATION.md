# CLI Tools Authentication Guide

This guide covers how to authenticate and configure the CLI tools used in this project.

## 🔐 Overview

This project uses several CLI tools that require authentication:

- **Wrangler CLI** - Cloudflare Pages deployment
- **Snyk CLI** - Security vulnerability scanning
- **GitHub CLI** - Repository management (optional)
- **Netlify CLI** - Alternative deployment (optional)

## 🌍 Wrangler (Cloudflare) Authentication

### Initial Setup

1. **Install Wrangler globally** (if not already done):

   ```powershell
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:

   ```powershell
   wrangler login
   ```

   This will open your browser to authenticate with Cloudflare.

### Token-based Authentication (CI/CD)

For automated deployments, use API tokens:

1. **Create API Token**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use "Custom token" template
   - **Permissions**:
     - Zone: Zone:Read (for your domain)
     - Zone: Page Rules:Edit (for your domain)
     - Account: Cloudflare Pages:Edit
   - **Account Resources**: Include your account
   - **Zone Resources**: Include your zone (if using custom domain)

2. **Configure Token**:

   ```powershell
   # Set as environment variable
   $env:CLOUDFLARE_API_TOKEN = "your-api-token-here"

   # Or use wrangler auth
   wrangler auth
   ```

### Project Configuration

Ensure your `wrangler.toml` is properly configured:

```toml
name = "organism-simulation"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[env.production.vars]
NODE_ENV = "production"
VITE_APP_URL = "https://organisms.andernet.dev"

[env.preview.vars]
NODE_ENV = "staging"
VITE_APP_URL = "https://organisms-staging.andernet.dev"
```

### Useful Wrangler Commands

```powershell
# Check authentication status
wrangler whoami

# Deploy to preview (staging)
wrangler pages deploy dist --project-name=organism-simulation

# Deploy to production
wrangler pages deploy dist --project-name=organism-simulation --compatibility-date=2024-01-01

# View deployment logs
wrangler pages deployment list --project-name=organism-simulation
```

## 🛡️ Snyk Security Scanner Authentication

### Initial Setup

1. **Install Snyk globally** (if not already done):

   ```powershell
   npm install -g snyk
   ```

2. **Create Snyk Account**:
   - Go to [snyk.io](https://snyk.io) and sign up
   - Choose the free plan for open source projects

3. **Authenticate**:

   ```powershell
   snyk auth
   ```

   This will open your browser to get your authentication token.

### Token-based Authentication (CI/CD)

For automated security scanning:

1. **Get API Token**:
   - Go to [Snyk Account Settings](https://app.snyk.io/account)
   - Copy your API token

2. **Configure Token**:

   ```powershell
   # Set as environment variable
   $env:SNYK_TOKEN = "your-snyk-token-here"

   # Or authenticate directly
   snyk config set api=your-snyk-token-here
   ```

### Useful Snyk Commands

```powershell
# Test for vulnerabilities
snyk test

# Test and get JSON output
snyk test --json

# Test specific severity levels
snyk test --severity-threshold=high

# Fix vulnerabilities automatically
snyk fix

# Monitor project (requires authentication)
snyk monitor

# Check authentication status
snyk config get api
```

## 🐙 GitHub CLI Authentication (Optional)

### Setup

1. **Install GitHub CLI**:

   ```powershell
   npm install -g gh
   ```

2. **Authenticate**:

   ```powershell
   gh auth login
   ```

   Choose "HTTPS" and follow the prompts.

### Useful GitHub CLI Commands

```powershell
# Check authentication
gh auth status

# Create repository
gh repo create

# Create pull request
gh pr create

# View issues
gh issue list
```

## 🔒 Security Best Practices

### Environment Variables

Store sensitive tokens as environment variables:

```powershell
# In PowerShell profile or .env file
$env:CLOUDFLARE_API_TOKEN = "your-cloudflare-token"
$env:SNYK_TOKEN = "your-snyk-token"
$env:GITHUB_TOKEN = "your-github-token"
```

### .gitignore Entries

Ensure these are in your `.gitignore`:

```
# Environment files
.env
.env.local
.env.production
.env.staging

# CLI tool configs
.wrangler/
.snyk
```

### Token Rotation

- **Cloudflare**: Rotate tokens every 90 days
- **Snyk**: Rotate tokens every 90 days
- **GitHub**: Use fine-grained tokens with minimal permissions

## 🚨 Troubleshooting

### Wrangler Issues

```powershell
# Clear Wrangler cache
wrangler logout
wrangler login

# Check project configuration
wrangler pages project list
```

### Snyk Issues

```powershell
# Clear Snyk config
snyk config unset api
snyk auth

# Check project support
snyk test --help
```

### Common Errors

1. **"Not authenticated"**:
   - Run the appropriate `auth` command
   - Check environment variables

2. **"Project not found"**:
   - Verify project name in configuration
   - Check account permissions

3. **"API rate limit exceeded"**:
   - Wait for rate limit to reset
   - Use personal access tokens instead of OAuth

## 📋 CI/CD Integration

For GitHub Actions, add these secrets to your repository:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these repository secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `SNYK_TOKEN`
   - `GITHUB_TOKEN` (if needed)

Example GitHub Actions usage:

```yaml
- name: Deploy to Cloudflare Pages
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  run: wrangler pages deploy dist --project-name=organism-simulation

- name: Run Snyk Security Scan
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  run: snyk test --severity-threshold=high
```

## 📚 Additional Resources

- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Snyk Documentation](https://docs.snyk.io/snyk-cli)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
