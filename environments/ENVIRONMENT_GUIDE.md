# Environment Configuration

This folder contains environment-specific configurations and setup scripts.

## 📁 Structure

```
environments/
├── development/           # Development environment
│   ├── .env.development  # Development environment variables
│   ├── vite.config.dev.ts # Development Vite config
│   └── README.md         # Development setup guide
├── staging/              # Staging environment  
│   ├── .env.staging      # Staging environment variables
│   ├── vite.config.staging.ts # Staging Vite config
│   └── README.md         # Staging deployment guide
├── production/           # Production environment
│   ├── .env.production   # Production environment variables
│   ├── vite.config.prod.ts # Production Vite config
│   └── README.md         # Production deployment guide
└── shared/               # Shared configuration
    ├── base.config.ts    # Base configuration
    └── constants.ts      # Environment constants
```

## 🔧 Environment Variables

### Development

- Debug features enabled
- Verbose logging
- Hot reload
- Development tools

### Staging  

- Production-like settings
- Reduced logging
- Performance monitoring
- Testing features enabled

### Production

- Optimized builds
- Error reporting only
- Minimal features
- Performance focused

## 📋 Setup Commands

```bash
# Setup development environment
npm run env:development

# Setup staging environment  
npm run env:staging

# Setup production environment
npm run env:production

# Check current environment
npm run env:check
```
