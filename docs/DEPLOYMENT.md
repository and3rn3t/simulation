# Deployment Guide

This guide covers the complete deployment setup and management for the Organism Simulation project.

## 🚀 Quick Start

### 1. Repository Setup

First, configure the GitHub environments:

1. Go to your repository **Settings → Environments**
2. Create two environments:
   - `staging` - for development testing
   - `production` - for live releases

3. Configure environment protection rules:
   - **Staging**: Allow auto-deployment from `develop` branch
   - **Production**: Require manual approval, restrict to `main` branch

### 2. Environment Variables

The following secrets should be configured in GitHub repository settings:

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `DEPLOY_KEY` | SSH key or API token for deployment | All environments |
| `STAGING_URL` | Staging deployment URL | Staging |
| `PRODUCTION_URL` | Production deployment URL | Production |
| `SLACK_WEBHOOK` | Notification webhook (optional) | All environments |

## 📋 Available Deployment Methods

### Automatic Deployment (CI/CD)

```bash
# Triggered automatically on:
git push origin develop    # → Deploys to staging
git push origin main       # → Deploys to production
```

### Manual Deployment

```bash
# Local deployment commands
npm run deploy:staging         # Deploy to staging
npm run deploy:production      # Deploy to production
npm run deploy:staging:dry     # Dry run for staging
npm run deploy:production:dry  # Dry run for production
```

### Manual GitHub Actions

Use the "Environment Management" workflow for manual control:

1. Go to **Actions → Environment Management**
2. Click **"Run workflow"**
3. Select environment and action
4. Optionally enable dry run

## 🔧 Environment Configuration

### Development
```bash
# Local development
npm run dev
# Uses .env.development automatically
```

### Staging
```bash
# Build for staging
npm run build:staging
# Or set environment manually
npm run env:staging && npm run build
```

### Production
```bash
# Build for production  
npm run build:production
# Or set environment manually
npm run env:production && npm run build
```

## 🐳 Docker Deployment

### Local Docker Testing

```bash
# Development
docker-compose --profile dev up

# Staging simulation
docker-compose --profile staging up

# Production simulation
docker-compose --profile prod up
```

### Container Registry Deployment

```bash
# Build and tag
docker build -t organism-simulation:latest .
docker tag organism-simulation:latest your-registry/organism-simulation:v1.0.0

# Push to registry
docker push your-registry/organism-simulation:v1.0.0

# Deploy to container platform
# kubectl apply -f k8s/
# or use your container orchestration platform
```

## 🔍 Deployment Verification

### Automatic Checks

The deployment pipeline includes:
- ✅ Code quality checks (linting, formatting)
- ✅ Type checking
- ✅ Unit test coverage
- ✅ End-to-end tests
- ✅ Security vulnerability scanning
- ✅ Build verification
- ✅ Smoke tests after deployment

### Manual Verification

After deployment, verify:

1. **Application loads correctly**
   ```bash
   curl -f https://staging.organism-simulation.com/
   ```

2. **Core functionality works**
   - Organism simulation starts
   - Controls respond correctly
   - Statistics display properly

3. **Performance is acceptable**
   - Initial load time < 3 seconds
   - Smooth animation at 60fps
   - Memory usage stable

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Check build locally
npm run build:production
# Review build logs in GitHub Actions
```

**Environment Issues**
```bash
# Verify environment setup
npm run env:production
cat .env
```

**Deployment Failures**
```bash
# Check deployment logs
# Review GitHub Actions logs
# Verify deployment target accessibility
```

### Rollback Procedures

**Automatic Rollback**
```bash
# Use GitHub Actions Environment Management
# Select "rollback" action
```

**Manual Rollback**
```bash
# If using versioned deployments
# Redeploy previous version
npm run deploy:production -- --version=v1.2.0
```

## 🔔 Monitoring & Notifications

### Health Checks

- Automated health checks run every 5 minutes
- Alerts sent on failure via configured webhooks
- Dashboard available at `/health` endpoint

### Performance Monitoring

- Build time tracking
- Bundle size monitoring  
- Runtime performance metrics
- Error rate monitoring

### Notification Channels

Configure notifications in GitHub repository settings:
- Slack/Discord webhooks for deployment status
- Email notifications for critical issues
- GitHub issue creation for recurring problems

## 🔐 Security Considerations

### Deployment Security

- All deployments use encrypted connections
- Secrets are never logged or exposed
- Access controls enforced through GitHub environments
- Audit trail maintained for all deployments

### Runtime Security

- Content Security Policy (CSP) headers
- HTTPS enforcement
- Dependency vulnerability scanning
- Regular security audits

## 📊 Deployment Metrics

Track these key metrics:

- **Deployment Frequency**: How often deployments occur
- **Lead Time**: Time from commit to production
- **Recovery Time**: Time to recover from failures
- **Success Rate**: Percentage of successful deployments

## 🆘 Emergency Procedures

### Critical Issues

1. **Immediate Response**
   - Stop ongoing deployments
   - Assess impact scope
   - Implement emergency rollback if needed

2. **Communication**
   - Notify stakeholders
   - Update status page
   - Document incident timeline

3. **Resolution**
   - Identify root cause
   - Implement fix
   - Test thoroughly before redeployment
   - Conduct post-incident review

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Environment Variables Guide](./environments/README.md)
- [Docker Configuration](./docker-compose.yml)
- [Security Policy](./SECURITY.md)
