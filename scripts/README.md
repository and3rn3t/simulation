# Scripts Organization

This folder contains build, deployment, and development scripts organized by category:

## 📁 Structure

```
scripts/
├── build/                  # Build-related scripts
│   ├── build.sh           # Moved from root
│   ├── build.bat          # Moved from root
│   └── README.md
├── deploy/                 # Deployment scripts
│   ├── deploy.js          # Moved from root
│   ├── deploy.sh          # Moved from root
│   ├── deploy-cloudflare.js
│   ├── deploy-vercel.js
│   └── README.md
├── env/                    # Environment setup
│   ├── setup-env.js       # Moved from root
│   ├── setup-env.sh       # Moved from root
│   ├── setup-env.bat      # Moved from root
│   ├── check-environments.js
│   ├── setup-github-environments.js
│   └── README.md
├── monitoring/             # Monitoring and testing
│   ├── monitor.js         # Moved from root
│   ├── check-deployment-status.js
│   ├── test-staging-deployment.js
│   └── README.md
└── setup/                  # Setup and validation
    ├── setup-cicd.sh
    ├── setup-custom-domain.js
    ├── validate-workflow.js
    ├── validate-wrangler.js
    └── README.md
```

## 🔧 Script Categories

- **Build**: Scripts for building the application
- **Deploy**: Deployment to various platforms
- **Env**: Environment setup and configuration
- **Monitoring**: Health checks and monitoring
- **Setup**: Initial project setup and validation

## 📋 Migration Guide

When moving scripts, update the package.json references accordingly.
