# Custom Preview Domain Setup Guide

This guide explains how to set up a custom subdomain for Cloudflare Pages preview deployments.

## 🎯 **Goal**

Set up `staging.organisms.andernet.dev` as your custom preview domain instead of the default `*.pages.dev` URL.

## 📋 **Prerequisites**

- Domain managed by Cloudflare DNS
- Cloudflare Pages project already created
- Access to Cloudflare Dashboard

## 🚀 **Step-by-Step Setup**

### 1. Configure DNS (If Needed)

If your domain isn't already on Cloudflare:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Add your domain (`andernet.dev`)
3. Update nameservers at your registrar

### 2. Set Up Custom Domain in Cloudflare Pages

#### Option A: Through Dashboard (Recommended)

1. **Navigate to Pages Project**:
   - Go to: <https://dash.cloudflare.com/pages>
   - Click on `organism-simulation` project

2. **Add Custom Domain**:
   - Go to **Settings** → **Custom domains**
   - Click **Set up a custom domain**
   - Enter: `staging.organisms.andernet.dev`
   - Click **Continue**
   - Choose **Activate domain**

3. **Configure for Preview Environment**:
   - In the same Custom domains section
   - Set the domain to be used for **Preview** deployments
   - This ensures develop branch deployments use the custom domain

#### Option B: Through wrangler.toml (Advanced)

Already configured in your `wrangler.toml` file:

```toml
[env.preview]
vars = { 
  NODE_ENV = "staging",
  VITE_APP_URL = "https://staging.organisms.andernet.dev"
}
```

### 3. Configure Environment Variables

#### In Cloudflare Pages Dashboard

1. Go to **Settings** → **Environment variables**
2. Under **Preview** environment, add:

   ```plaintext
   VITE_APP_URL=https://staging.organisms.andernet.dev
   VITE_ENVIRONMENT=staging
   VITE_APP_NAME=Organism Simulation (Staging)
   ```

#### In Your Local Environment Files

Update `.env.staging`:

```bash
VITE_APP_URL=https://staging.organisms.andernet.dev
VITE_ENVIRONMENT=staging
VITE_APP_NAME=Organism Simulation (Staging)
```

### 4. Update GitHub Actions Workflow

The workflow will automatically use the custom domain once configured in Cloudflare Pages.

### 5. Test the Setup

1. **Trigger Preview Deployment**:

   ```bash
   git checkout develop
   echo "Test custom domain" >> test.txt
   git add test.txt
   git commit -m "test: Custom domain setup"
   git push origin develop
   ```

2. **Check Deployment**:
   - Monitor: <https://github.com/and3rn3t/simulation/actions>
   - Verify: <https://dash.cloudflare.com/pages>

3. **Access Preview Site**:
   - Visit: <https://staging.organisms.andernet.dev>
   - Should load your staging deployment

## 🔧 **Advanced Configuration**

### Subdomain Strategy Options

- `staging.organisms.andernet.dev` - Staging/Preview
- `organisms.andernet.dev` - Production
- `dev.organisms.andernet.dev` - Development (if needed)

### Branch-Specific Domains

You can also set up branch-specific preview domains:

- `feature-xyz.staging.organisms.andernet.dev`
- `pr-123.staging.organisms.andernet.dev`

### SSL Certificate

Cloudflare automatically provisions SSL certificates for custom domains.

## 🛠️ **Troubleshooting**

### Domain Not Resolving

1. Check DNS propagation: <https://whatsmydns.net/>
2. Verify nameservers point to Cloudflare
3. Check domain status in Cloudflare Dashboard

### SSL Issues

1. Wait 15-30 minutes for certificate provisioning
2. Check **SSL/TLS** → **Edge Certificates** in Cloudflare
3. Ensure **Full (strict)** SSL mode is enabled

### Custom Domain Not Used

1. Verify domain is set for **Preview** environment in Pages settings
2. Check environment variables are correctly set
3. Redeploy to trigger domain binding

## ✅ **Verification Commands**

```bash
# Check current configuration
npm run wrangler:validate

# Test staging deployment
npm run staging:test

# Monitor deployment
npm run staging:monitor
```

## 🎯 **Expected Results**

After setup:

- ✅ Preview deployments use `staging.organisms.andernet.dev`
- ✅ Production deployments use `organisms.andernet.dev`
- ✅ Automatic SSL certificates
- ✅ Proper environment variable injection
- ✅ Branch-based deployment routing

## 📞 **Need Help?**

If you encounter issues:

1. Check Cloudflare Pages project settings
2. Verify DNS configuration
3. Review GitHub Actions logs
4. Run diagnostic commands above

The custom preview domain will provide a professional staging environment separate from your production site!
