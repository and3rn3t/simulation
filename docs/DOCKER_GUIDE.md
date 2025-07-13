# Docker Containerization Guide

## Overview

This application is fully containerized with Docker for development, staging, and production environments. The containerization includes:

- **Multi-stage production builds** for optimized image size
- **Security hardening** with non-root users and minimal attack surface
- **Multi-environment support** via Docker Compose profiles
- **Automated CI/CD integration** with GitHub Container Registry
- **Security scanning** with Trivy and Docker Bench

## Quick Start

### Development

```bash
# Start development environment
npm run docker:dev

# Or manually
docker-compose --profile dev up
```

### Production Testing

```bash
# Build and test production image
npm run docker:test

# Or step by step
npm run docker:build
npm run docker:run:background
curl http://localhost:8080/health
npm run docker:stop
```

## Docker Images

### Production Image (`Dockerfile`)

- **Base**: `nginx:alpine` (multi-stage from `node:20-alpine`)
- **User**: `nginx` (non-root)
- **Port**: `8080`
- **Size**: ~50MB (optimized)
- **Features**:
  - Static file serving with nginx
  - Security headers
  - Health checks
  - Gzip compression
  - Cache optimization

### Development Image (`Dockerfile.dev`)

- **Base**: `node:20-alpine`
- **User**: `devuser` (non-root)
- **Port**: `5173`
- **Features**:
  - Hot module reloading
  - Volume mounting for live development
  - Development dependencies included

## Docker Compose Profiles

### Development Profile (`dev`)

```bash
docker-compose --profile dev up
```

- Hot reloading enabled
- Source code mounted as volume
- Debug mode enabled

### Staging Profile (`staging`)

```bash
docker-compose --profile staging up
```

- Production build
- Staging environment variables
- Port 8080 exposed

### Production Profile (`prod`)

```bash
docker-compose --profile prod up
```

- Production build
- Production environment variables
- Port 80 exposed
- Resource limits applied
- Health checks enabled

## Environment Variables

### Build-time Variables

- `NODE_ENV`: Environment (development/staging/production)
- `VITE_BUILD_DATE`: Build timestamp
- `VITE_GIT_COMMIT`: Git commit hash

### Runtime Variables

- `IMAGE_NAME`: Docker image name (default: `organism-simulation`)
- `IMAGE_TAG`: Docker image tag (default: `latest`)

## Available Scripts

### Build Commands

```bash
npm run docker:build          # Build production image
npm run docker:build:dev      # Build development image
npm run docker:build:staging  # Build staging image
npm run docker:build:prod     # Build production image
```

### Run Commands

```bash
npm run docker:run            # Run production container
npm run docker:run:dev        # Run development container
npm run docker:run:background # Run in background (detached)
```

### Management Commands

```bash
npm run docker:stop           # Stop and remove container
npm run docker:logs           # View container logs
npm run docker:shell          # Access container shell
```

### Environment Commands

```bash
npm run docker:dev            # Start development environment
npm run docker:staging        # Start staging environment
npm run docker:prod           # Start production environment
npm run docker:dev:down       # Stop development environment
npm run docker:staging:down   # Stop staging environment
npm run docker:prod:down      # Stop production environment
```

### Maintenance Commands

```bash
npm run docker:clean          # Clean unused Docker resources
npm run docker:clean:all      # Clean all Docker resources
npm run docker:scan           # Security scan of image
npm run docker:test           # Build and test image
```

## CI/CD Integration

### GitHub Container Registry

Images are automatically built and pushed to GitHub Container Registry:

- **Registry**: `ghcr.io/and3rn3t/simulation`
- **Tags**:
  - `latest` (main branch)
  - `develop-<sha>` (develop branch)
  - `<branch>-<sha>` (feature branches)

### Security Scanning

Automated security scanning includes:

- **Trivy**: Vulnerability scanning
- **Docker Bench**: Security best practices
- **Container Structure Tests**: Image validation

### Deployment

Production deployments use both:

1. **Cloudflare Pages** for CDN distribution
2. **Docker containers** for flexible hosting options

## Security Features

### Image Security

- Non-root user execution
- Minimal base images (Alpine Linux)
- Security headers configured
- Regular security scanning
- No sensitive data in images

### Runtime Security

- Read-only root filesystem where possible
- Resource limits applied
- Health checks implemented
- Network policies configurable

## Health Checks

### Container Health Check

```bash
curl -f http://localhost:8080/health
```

### Application Endpoints

- `/health` - Health check endpoint
- `/` - Main application

## Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   docker ps  # Check running containers
   docker stop <container_id>
   ```

2. **Build Cache Issues**

   ```bash
   docker build --no-cache -t organism-simulation .
   ```

3. **Permission Issues**

   ```bash
   # Ensure Docker daemon is running
   sudo systemctl start docker  # Linux
   # Docker Desktop should be running on Windows/Mac
   ```

4. **Container Won't Start**
   ```bash
   docker logs <container_name>
   ```

### Performance Optimization

1. **Multi-stage Builds**: Reduces final image size
2. **Layer Caching**: Optimized Dockerfile order
3. **Build Context**: `.dockerignore` excludes unnecessary files
4. **Resource Limits**: Prevents resource exhaustion

## Monitoring and Logs

### Container Logs

```bash
docker logs organism-simulation
docker logs -f organism-simulation  # Follow logs
```

### Health Monitoring

```bash
docker inspect organism-simulation | grep Health
```

### Resource Usage

```bash
docker stats organism-simulation
```

## Development Workflow

1. **Local Development**

   ```bash
   npm run docker:dev
   # Edit files, see changes reflected immediately
   ```

2. **Testing Production Build**

   ```bash
   npm run docker:test
   ```

3. **Debugging**
   ```bash
   npm run docker:shell
   # Access container shell for debugging
   ```

## Production Deployment

### Self-Hosted Deployment

```bash
# Pull latest image
docker pull ghcr.io/and3rn3t/simulation:latest

# Run with environment-specific settings
docker run -d \
  --name organism-simulation \
  -p 80:8080 \
  -e NODE_ENV=production \
  ghcr.io/and3rn3t/simulation:latest
```

### Docker Compose Deployment

```bash
# Set environment variables
export IMAGE_NAME=ghcr.io/and3rn3t/simulation
export IMAGE_TAG=latest

# Deploy
docker-compose --profile prod up -d
```

## Backup and Recovery

### Data Persistence

```bash
# If using volumes for data persistence
docker volume create simulation-data
docker run -v simulation-data:/data organism-simulation
```

### Image Backup

```bash
# Save image to archive
docker save organism-simulation:latest | gzip > simulation-backup.tar.gz

# Load image from archive
gunzip -c simulation-backup.tar.gz | docker load
```

## Next Steps

1. **Container Orchestration**: Consider Kubernetes for scaling
2. **Service Mesh**: Implement for microservices architecture
3. **Monitoring**: Add comprehensive monitoring with Prometheus/Grafana
4. **Secrets Management**: Implement proper secrets management
5. **Multi-arch Builds**: Support for ARM64 and other architectures
