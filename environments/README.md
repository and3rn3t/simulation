# Environment Configuration

This directory contains environment-specific configuration files for the Organism Simulation project.

## Environment Files

- `.env.development` - Local development configuration
- `.env.staging` - Staging environment configuration  
- `.env.production` - Production environment configuration

## Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment name | `development` |
| `VITE_API_URL` | API base URL | `http://localhost:3000` |
| `VITE_APP_NAME` | Application display name | `Organism Simulation` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |
| `VITE_ENABLE_DEBUG` | Enable debug mode | `true` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |
| `VITE_BUILD_DATE` | Build timestamp (auto-generated) | - |
| `VITE_GIT_COMMIT` | Git commit hash (auto-generated) | - |

## Usage

Environment variables are automatically loaded by Vite based on the `NODE_ENV` setting:

```bash
# Development
npm run dev

# Staging build
NODE_ENV=staging npm run build

# Production build
NODE_ENV=production npm run build
```

## CI/CD Integration

The CI/CD pipeline automatically:
1. Selects the appropriate environment file based on the branch
2. Injects build metadata (timestamp, commit hash)
3. Builds the application with environment-specific configuration
4. Deploys to the corresponding environment

## GitHub Environments

To enable protected deployments, configure these environments in your GitHub repository:

1. Go to Settings → Environments
2. Create environments: `staging`, `production`
3. Configure protection rules:
   - **Staging**: Auto-deploy from `develop` branch
   - **Production**: Require manual approval, restrict to `main` branch

## Security Notes

- Never commit sensitive values to environment files
- Use GitHub Secrets for API keys, tokens, and credentials
- Environment files are included in the repository for transparency
- Sensitive production values should be injected during deployment
