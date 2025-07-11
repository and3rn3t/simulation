# Vercel Deployment Guide

This guide walks you through setting up automatic deployment to Vercel for the Organism Simulation project.

## 🎯 Quick Setup (5 minutes)

### 1. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Import your `simulation` repository

### 2. Configure GitHub Secrets
Add these secrets to your GitHub repository settings:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these repository secrets:

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here  
VERCEL_PROJECT_ID=your_project_id_here
```

### 3. Get Your Vercel Values

#### Get Vercel Token:
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token named "GitHub Actions"
3. Copy the token → Add as `VERCEL_TOKEN` secret

#### Get Org ID and Project ID:
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project (run in your repo)
vercel link

# Get your IDs
vercel env ls
```

Or find them in your `.vercel/project.json` file after linking.

## 🚀 Deployment Process

### Automatic Deployments
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with comments

### Manual Deployments
```bash
# Preview deployment
npm run deploy:vercel:preview

# Production deployment  
npm run deploy:vercel:production
```

## 🔧 Configuration Files

### `vercel.json`
- SPA routing configuration
- Security headers
- Function settings
- Cache rules

### `.env.vercel`
- Production environment variables
- Build-time constants
- Feature flags

## 🌐 Environment Variables

The following variables are automatically injected:

- `VITE_BUILD_DATE` - Build timestamp
- `VITE_GIT_COMMIT` - Git commit hash
- `VITE_APP_VERSION` - Package version
- `VITE_ENVIRONMENT` - Deployment environment

## 📊 Monitoring

After deployment, you can:

1. **View deployments**: Vercel dashboard
2. **Monitor performance**: Vercel Analytics  
3. **Check logs**: Vercel Functions tab
4. **Test features**: Preview URLs for each deployment

## 🔍 Troubleshooting

### Common Issues

**Build fails:**
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Ensure all dependencies are in `package.json`

**Runtime errors:**
- Check browser console for errors
- Verify environment-specific code paths
- Test locally with production build: `npm run build && npm run preview`

**GitHub Action fails:**
- Verify all three secrets are set correctly
- Check GitHub Actions logs for specific errors
- Ensure Vercel project is linked properly

### Debug Commands
```bash
# Test build locally
npm run build

# Test production build locally  
npm run preview

# Check Vercel project status
vercel --prod

# View deployment logs
vercel logs [deployment-url]
```

## 🎉 Success!

Once set up, every commit automatically triggers a deployment. You'll get:

- 🌍 **Production URL**: `https://your-project.vercel.app`
- 🔍 **Preview URLs**: For every branch/PR
- 📈 **Analytics**: Built-in performance monitoring
- 🚀 **CDN**: Global edge network for fast loading

Your simulation is now live and automatically deployed! 🎊
