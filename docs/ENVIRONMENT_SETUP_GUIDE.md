# Environment Setup Guide

This guide will help you set up the proper environments in both GitHub and Cloudflare for your CI/CD pipeline.

## Overview

Your CI/CD pipeline uses two environments:

- **Staging**: Deployed from `develop` branch to Cloudflare Pages preview
- **Production**: Deployed from `main` branch to Cloudflare Pages production

## 1. GitHub Environment Setup

### Step 1: Create GitHub Environments

1. Go to your GitHub repository: `https://github.com/and3rn3t/simulation`
2. Click on **Settings** tab
3. In the left sidebar, click **Environments**
4. Create two environments:

#### Staging Environment

1. Click **New environment**
2. Name: `staging`
3. Configure deployment protection rules:
   - ✅ **Required reviewers**: (optional, for staging you might skip this)
   - ✅ **Wait timer**: 0 minutes (for immediate staging deployments)
   - ✅ **Deployment branches**: Only `develop` branch

#### Production Environment

1. Click **New environment**
2. Name: `production`
3. Configure deployment protection rules:
   - ✅ **Required reviewers**: Add yourself and any team members
   - ✅ **Wait timer**: 5 minutes (safety buffer)
   - ✅ **Deployment branches**: Only `main` branch

### Step 2: Add Environment Secrets

For both `staging` and `production` environments, add these secrets:

#### Required Secrets

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

#### How to add secrets

1. In each environment settings
2. Click **Add secret**
3. Add the secret name and value
4. Click **Add secret**

## 2. Cloudflare Setup

### Step 1: Get Cloudflare Credentials

#### Get API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Custom token** template
4. Configure:
   - **Token name**: `GitHub Actions - Organism Simulation`
   - **Permissions**:
     - `Cloudflare Pages:Edit`
     - `Account:Read`
     - `Zone:Read` (if using custom domain)
   - **Account Resources**: Include your account
   - **Zone Resources**: Include your domain (if applicable)
5. Click **Continue to summary** → **Create Token**
6. Copy the token (you won't see it again!)

#### Get Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. In the right sidebar, copy your **Account ID**

### Step 2: Create Cloudflare Pages Project

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click **Create a project**
3. Choose **Connect to Git**
4. Select your `simulation` repository
5. Configure build settings:
   - **Project name**: `organism-simulation`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**

### Step 3: Configure Cloudflare Environment Variables

#### Production Environment

1. Go to your Pages project → **Settings** → **Environment variables**
2. Add variables for **Production**:

   ```
   NODE_ENV=production
   VITE_APP_NAME=Organism Simulation
   VITE_ENABLE_DEBUG=false
   VITE_ENABLE_ANALYTICS=true
   ```

#### Preview Environment (Staging)

1. In the same section, add variables for **Preview**:

   ```
   NODE_ENV=staging
   VITE_APP_NAME=Organism Simulation (Staging)
   VITE_ENABLE_DEBUG=true
   VITE_ENABLE_ANALYTICS=false
   ```

## 3. Verification Steps

### Step 1: Check GitHub Configuration

Run this command to verify your setup:

```bash
npm run check:environments
```

### Step 2: Test Deployments

#### Test Staging Deployment

1. Create a new branch from `develop`
2. Make a small change
3. Push to `develop` branch
4. Check GitHub Actions for deployment
5. Verify staging URL works

#### Test Production Deployment

1. Create a PR from `develop` to `main`
2. Merge the PR
3. Check GitHub Actions for deployment
4. Verify production URL works

## 4. Troubleshooting

### Common Issues

#### GitHub Secrets Not Found

- Verify secrets are added to the correct environment (not repository secrets)
- Check secret names match exactly: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

#### Cloudflare API Token Issues

- Ensure token has correct permissions
- Check token isn't expired
- Verify account ID is correct

#### Environment Not Triggering

- Check branch protection rules
- Verify environment deployment branches are configured correctly
- Ensure the workflow file references the correct environment names

### Debug Commands

```bash
# Check current environment
npm run env:check

# Validate GitHub secrets (locally)
npm run secrets:validate

# Test Cloudflare connection
npm run cloudflare:test
```

## 5. Security Best Practices

1. **API Tokens**: Use minimal permissions required
2. **Environment Protection**: Enable required reviewers for production
3. **Branch Protection**: Protect `main` and `develop` branches
4. **Secret Rotation**: Rotate API tokens regularly
5. **Access Control**: Limit who can modify environments

## Quick Setup Checklist

- [ ] GitHub `staging` environment created
- [ ] GitHub `production` environment created  
- [ ] `CLOUDFLARE_API_TOKEN` added to both environments
- [ ] `CLOUDFLARE_ACCOUNT_ID` added to both environments
- [ ] Cloudflare Pages project created (`organism-simulation`)
- [ ] Cloudflare production environment variables set
- [ ] Cloudflare preview environment variables set
- [ ] Test staging deployment successful
- [ ] Test production deployment successful

## Need Help?

If you encounter issues:

1. Check the GitHub Actions logs
2. Verify Cloudflare Pages deployment logs
3. Run the verification scripts
4. Check this troubleshooting section

The CI/CD pipeline should now work correctly with proper environment isolation between staging and production.
