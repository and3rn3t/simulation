# 🚀 Build and Deployment Guide

This guide covers the build and deployment processes for the Organism Simulation project.

## 📋 Prerequisites

- Node.js 20+
- npm 10+
- Docker (optional, for containerized deployment)
- Git

## 🏗️ Build Process

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Build with Quality Checks
```bash
npm run ci
```

## 🔍 Code Quality

### Linting
```bash
npm run lint          # Check for issues
npm run lint:fix      # Fix auto-fixable issues
```

### Formatting
```bash
npm run format        # Format code
npm run format:check  # Check formatting
```

### Type Checking
```bash
npm run type-check
```

### Security Scanning
```bash
npm run security:audit    # npm audit
npm run security:scan     # Snyk scan
npm run security:fix      # Fix vulnerabilities
```

### Code Complexity
```bash
npm run complexity
```

## 🐳 Docker Deployment

### Development Environment
```bash
npm run docker:dev
```

### Staging Environment
```bash
npm run docker:staging
```

### Production Environment
```bash
npm run docker:prod
```

### Manual Docker Commands
```bash
# Build image
docker build -t organism-simulation .

# Run container
docker run -p 8080:80 organism-simulation

# Using docker-compose
docker-compose --profile prod up
```

## 🌐 Progressive Web App (PWA)

The application is configured as a PWA with:
- Service worker for offline functionality
- Web app manifest for installability
- Optimized caching strategies
- Push notification support (when implemented)

## 📊 SonarQube Integration

### Local SonarQube
```bash
npm run sonar
```

### CI/CD Integration
SonarQube analysis runs automatically in the CI pipeline.

## 🔄 CI/CD Pipeline

The GitHub Actions workflow includes:
- Code quality checks (lint, format, type-check)
- Security scanning
- Unit tests with coverage
- E2E tests
- Build verification
- Automated deployment to staging/production

### Workflow Files
- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline

## 🌍 Environment Configuration

### Development
```bash
cp .env.development .env.local
```

### Staging
Environment variables are configured in the CI/CD pipeline.

### Production
Environment variables are configured in the production environment.

## 🚀 Deployment Strategies

### Static Site Deployment
The built application can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Container Deployment
Deploy using Docker containers:
- Docker Hub
- AWS ECR
- Azure Container Registry
- Google Container Registry

### Server Deployment
Deploy to traditional servers:
- Nginx
- Apache
- IIS

## 📈 Performance Optimization

### Build Optimizations
- Code splitting
- Tree shaking
- Minification
- Compression
- Source maps for debugging

### Runtime Optimizations
- Service worker caching
- Lazy loading
- Resource preloading
- CDN integration

## 🔧 Troubleshooting

### Common Build Issues
1. **Node version mismatch**: Use Node.js 20+
2. **Memory issues**: Increase Node.js memory limit
3. **Dependency conflicts**: Clear node_modules and reinstall

### Docker Issues
1. **Port conflicts**: Change port mapping
2. **Build context**: Check .dockerignore
3. **Multi-stage builds**: Ensure proper layer caching

### CI/CD Issues
1. **Environment variables**: Check secrets configuration
2. **Test failures**: Run tests locally first
3. **Deployment failures**: Check deployment logs

## 📝 Best Practices

### Code Quality
- Run quality checks before committing
- Use pre-commit hooks
- Follow TypeScript strict mode
- Maintain high test coverage

### Security
- Regular dependency updates
- Security scanning in CI
- Environment variable management
- Secrets management

### Performance
- Monitor build times
- Optimize bundle sizes
- Use caching strategies
- Regular performance audits

## 📊 Monitoring

### Build Metrics
- Build time
- Bundle size
- Test coverage
- Code quality scores

### Runtime Metrics
- Performance metrics
- Error rates
- User analytics
- Resource usage

## 🔗 Related Documentation

- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [API Documentation](./docs/API.md)
- [Architecture Decisions](./docs/adr/README.md)
- [Performance Guide](./docs/PERFORMANCE.md)

## 🆘 Support

For build and deployment issues:
1. Check the troubleshooting section
2. Review CI/CD logs
3. Check Docker logs
4. Consult the team documentation
