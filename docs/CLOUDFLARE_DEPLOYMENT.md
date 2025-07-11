# 🚀 Cloudflare Pages Deployment Guide

This guide walks you through setting up automatic deployment to Cloudflare Pages for the Organism Simulation project.

## Why Cloudflare Pages?

✅ **Free hosting** with generous limits  
✅ **Global CDN** with 300+ edge locations  
✅ **Zero configuration** for most Vite projects  
✅ **Built-in analytics** and performance monitoring  
✅ **Edge functions** for serverless computing  
✅ **Automatic HTTPS** and custom domains  

## 🎯 Quick Setup (10 minutes)

### Step 1: Create Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com) and sign up
2. Navigate to **Pages** in the dashboard
3. Click **Create a project**

### Step 2: Connect GitHub Repository
1. Click **Connect to Git**
2. Authorize Cloudflare to access your GitHub
3. Select your `simulation` repository

### Step 3: Configure Build Settings
```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: (leave empty)
```

### Step 4: Set Environment Variables
In the Cloudflare Pages project settings, add:
```
NODE_ENV = production
VITE_APP_NAME = Organism Simulation
VITE_APP_VERSION = 1.0.0
VITE_ENABLE_DEBUG = false
VITE_ENABLE_ANALYTICS = true
```

### Step 5: Configure GitHub Secrets
Add these secrets to your GitHub repository (**Settings** → **Secrets and variables** → **Actions**):

```
CLOUDFLARE_API_TOKEN = your_api_token_here
CLOUDFLARE_ACCOUNT_ID = your_account_id_here
```

#### Get Cloudflare API Token:
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Custom token** template:
   - **Permissions**: 
     - Account - Cloudflare Pages:Edit
     - Zone - Zone Settings:Read  
     - Zone - Zone:Read
   - **Account Resources**: Include - Your Account
   - **Zone Resources**: Include - All zones
4. Copy the token → Add as `CLOUDFLARE_API_TOKEN` secret

#### Get Account ID:
1. Go to your Cloudflare dashboard
2. Copy the **Account ID** from the sidebar → Add as `CLOUDFLARE_ACCOUNT_ID` secret

## 🔧 Local Development with Wrangler

### Install and Setup
```bash
# Already installed as dev dependency
npm install

# Login to Cloudflare
npx wrangler login

# Test local development
npx wrangler pages dev dist --port 3000
```

### Manual Deployments
```bash
# Build the project
npm run build

# Deploy preview
npm run deploy:cloudflare:preview

# Deploy to production
npm run deploy:cloudflare:production
```

## 🚀 Automatic Deployments

### GitHub Integration
- **Push to `main`** → Production deployment
- **Push to `develop`** → Preview deployment  
- **Pull requests** → Preview deployment with comments

### Deployment URLs
- **Production**: `https://organisms.andernet.dev` ✅ **LIVE!**
- **Cloudflare Pages**: `https://organism-simulation.pages.dev`
- **Preview**: `https://[branch-name].organism-simulation.pages.dev`

## 🌐 Custom Domain Setup

### Add Custom Domain
1. In Cloudflare Pages → **Custom domains**
2. Click **Set up a custom domain** 
3. Enter your domain (e.g., `simulation.yourdomain.com`)
4. Follow DNS setup instructions

### DNS Configuration
If your domain is **not** on Cloudflare:
```
CNAME simulation organism-simulation.pages.dev
```

If your domain **is** on Cloudflare:
- DNS records are set up automatically

## 📊 Analytics and Monitoring

### Built-in Analytics
- **Page views** and **unique visitors**
- **Performance metrics** (Core Web Vitals)
- **Geographic distribution**
- **Referrer tracking**

### Access Analytics:
1. Go to your Pages project
2. Click **Analytics** tab
3. View real-time and historical data

## 🔍 Advanced Configuration

### Environment-Specific Settings

#### Production (`wrangler.toml`)
```toml
[env.production]
vars = { NODE_ENV = "production" }
```

#### Preview/Staging
```toml
[env.preview]
vars = { NODE_ENV = "staging" }
```

### Custom Headers and Redirects
All configured in `wrangler.toml`:
- Security headers (CSP, X-Frame-Options)
- Cache control for static assets
- SPA routing with catch-all redirect

### Edge Functions (Optional)
```bash
# Create functions directory
mkdir functions

# Add API endpoints (optional)
# functions/api/stats.ts
# functions/api/feedback.ts
```

## 🛠️ Troubleshooting

### Common Issues

**Build fails:**
- Check build logs in Cloudflare Pages dashboard
- Verify Node.js version compatibility (set to 20.x)
- Ensure all dependencies are in `package.json`

**Environment variables not working:**
- Verify they're set in Pages project settings
- Check variable names match exactly (case-sensitive)
- Restart deployment after adding new variables

**GitHub Action fails:**
- Verify API token has correct permissions
- Check account ID matches your Cloudflare account
- Ensure project name matches exactly

### Debug Commands
```bash
# Check Wrangler authentication
npx wrangler whoami

# Test build locally
npm run build
npm run preview

# Deploy with verbose logging
npx wrangler pages deploy dist --project-name=organism-simulation --verbose

# Check project status
npx wrangler pages project list
```

### Log Access
- **Build logs**: Cloudflare Pages dashboard → Deployments
- **Function logs**: Dashboard → Functions → View logs
- **Analytics**: Dashboard → Analytics

## ⚡ Performance Benefits

### Automatic Optimizations
- **Image optimization** with Polish
- **Minification** of HTML, CSS, JS
- **Brotli compression** 
- **HTTP/3** and **0-RTT** support

### Global Edge Network
- **300+ locations** worldwide
- **Sub-50ms** response times globally
- **DDoS protection** included
- **Always online** mode

### Monitoring
- **Real-time performance** metrics
- **Core Web Vitals** tracking
- **Uptime monitoring** 
- **Error tracking**

## 🎉 You're Live!

Once deployed, your simulation will be available at:
- 🌍 **Production**: `https://organisms.andernet.dev` ✅ **LIVE!**
- 🔍 **Analytics**: Built-in Cloudflare analytics
- 📱 **PWA**: Works offline with service worker
- 🚀 **Global**: Served from 300+ edge locations

Your organism simulation is now deployed with enterprise-grade infrastructure! 🎊

## 🎉 SUCCESS - You're Live!

**Congratulations!** Your Organism Simulation is now live at:
### 🌐 https://organisms.andernet.dev

Users worldwide can now:
- Experience your interactive organism simulation
- Select different organism types and growth rates  
- Watch real-time population dynamics
- Enjoy smooth Canvas-based animations
- Use the app offline (PWA support)

## Next Steps
- [ ] Set up custom domain
- [ ] Enable analytics tracking  
- [ ] Add performance monitoring
- [ ] Configure alerting for downtime
- [ ] Set up A/B testing (optional)
