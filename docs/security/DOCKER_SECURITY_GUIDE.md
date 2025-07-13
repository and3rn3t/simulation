# Docker Security Best Practices

## 🛡️ Overview

This document outlines Docker security best practices implemented in the organism simulation project to prevent common critical and high-severity security vulnerabilities in containerized applications.

## 🚨 Docker Security Hotspots Addressed

### 1. Root User Execution (CRITICAL SEVERITY)

**Problem**: Running containers as root gives unnecessary privileges and increases attack surface.

**Before (Vulnerable)**:

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]  # Runs as root
```

**After (Secure)**:

```dockerfile
FROM nginx:alpine

# Create non-root user
RUN addgroup -g 101 -S nginx && \
    adduser -S nginx -u 101 -G nginx

# Set proper ownership
COPY --chown=nginx:nginx dist /usr/share/nginx/html

# Switch to non-root user
USER nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Missing Health Check Security (MEDIUM SEVERITY)

**Problem**: Missing health check files or insecure health check implementations.

**Before (Vulnerable)**:

```dockerfile
COPY healthcheck.sh /healthcheck.sh  # File doesn't exist
HEALTHCHECK CMD ["/bin/sh", "/healthcheck.sh"]
```

**After (Secure)**:

```dockerfile
# Create secure health check script
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'curl -f http://localhost/health || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh && \
    chown nginx:nginx /healthcheck.sh

RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/bin/sh", "/healthcheck.sh"]
```

### 3. Improper File Permissions (HIGH SEVERITY)

**Problem**: Files copied with wrong ownership or excessive permissions.

**Before (Vulnerable)**:

```dockerfile
COPY . /app  # Copies as root with wrong permissions
```

**After (Secure)**:

```dockerfile
# Proper ownership and permissions
COPY --chown=appuser:appgroup . /app
RUN chmod 644 /app/files/* && \
    chmod 755 /app/directories/
```

### 4. Nginx Security Configuration (HIGH SEVERITY)

**Problem**: Default nginx configuration exposes version information and lacks security headers.

**Security Enhancements Applied**:

```nginx
# Hide nginx version
server_tokens off;

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Rate limiting
limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
limit_req zone=one burst=10 nodelay;

# Request size limits
client_max_body_size 10M;
```

## 🔒 Security Implementation Patterns

### Multi-Stage Build Security

```dockerfile
# Build stage - non-root user
FROM node:20-alpine AS builder
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs
COPY --chown=nextjs:nodejs . /app
RUN npm ci && npm run build

# Production stage - different non-root user
FROM nginx:alpine
RUN addgroup -g 101 -S nginx && \
    adduser -S nginx -u 101 -G nginx
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
USER nginx
```

### Secure File Operations

```dockerfile
# Create directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run

# Set specific file permissions
RUN chmod 644 /usr/share/nginx/html/* && \
    chmod 755 /usr/share/nginx/html
```

### Package Management Security

```dockerfile
# Install only necessary packages
RUN apk add --no-cache curl

# Clean up after installation
RUN apk del --purge && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*
```

## 📋 Docker Security Checklist

### Container Configuration

- [ ] **Non-root user**: All containers run as non-root users
- [ ] **Proper ownership**: All files have correct user:group ownership
- [ ] **Minimal permissions**: Files have least-privilege permissions (644/755)
- [ ] **Resource limits**: Memory and CPU limits defined
- [ ] **Health checks**: Secure health check implementations

### Base Image Security

- [ ] **Alpine Linux**: Use minimal Alpine-based images
- [ ] **Updated base**: Use latest stable base image versions
- [ ] **Package cleanup**: Remove unnecessary packages and cache
- [ ] **Single process**: One process per container

### Network Security

- [ ️ **Non-privileged ports**: Use ports > 1024
- [ ] **Rate limiting**: Implement request rate limiting
- [ ] **Security headers**: Add appropriate HTTP security headers
- [ ] **TLS configuration**: HTTPS ready configuration

### Build Security

- [ ] **Multi-stage builds**: Separate build and runtime environments
- [ ] **Dependency scanning**: Scan for vulnerable dependencies
- [ ] **Image scanning**: Scan final images for vulnerabilities
- [ ] **Secrets management**: No secrets in image layers

## 🛠️ Secure Dockerfile Template

### Production Template

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S builduser -u 1001

WORKDIR /app
RUN chown -R builduser:nodejs /app
USER builduser

# Build application
COPY --chown=builduser:nodejs package*.json ./
RUN npm ci
COPY --chown=builduser:nodejs . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Create non-root user
RUN addgroup -g 101 -S nginx && \
    adduser -S nginx -u 101 -G nginx

# Create necessary directories
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run

# Copy application
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Create health check
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'curl -f http://localhost:8080/health || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh && \
    chown nginx:nginx /healthcheck.sh

# Install curl and cleanup
RUN apk add --no-cache curl && \
    apk del --purge && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Set permissions
RUN chmod 644 /usr/share/nginx/html/* && \
    chmod 755 /usr/share/nginx/html

# Switch to non-root
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/bin/sh", "/healthcheck.sh"]

# Use non-privileged port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### Development Template

```dockerfile
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S devuser -u 1001 -G nodejs

WORKDIR /app
RUN chown -R devuser:nodejs /app

# Switch to non-root user
USER devuser

# Install dependencies
COPY --chown=devuser:nodejs package*.json ./
RUN npm install

# Copy source code
COPY --chown=devuser:nodejs . .

# Set permissions
RUN chmod -R 755 /app

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

## 🔍 Security Scanning Commands

### Image Vulnerability Scanning

```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image organism-simulation:latest

# Check for sensitive data
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    trufflesecurity/trufflehog docker --image organism-simulation:latest
```

### Runtime Security Testing

```bash
# Test health check
docker run -d --name test-container organism-simulation:latest
docker exec test-container /healthcheck.sh

# Verify non-root user
docker exec test-container whoami  # Should not be root

# Check file permissions
docker exec test-container ls -la /usr/share/nginx/html
```

## 🚨 Common Docker Security Mistakes

### ❌ Running as Root

```dockerfile
# DON'T DO THIS
FROM nginx:alpine
COPY dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]  # Runs as root (uid 0)
```

### ❌ Copying with Wrong Ownership

```dockerfile
# DON'T DO THIS
COPY . /app  # Files owned by root
USER appuser  # User can't modify files
```

### ❌ Exposing Privileged Ports

```dockerfile
# DON'T DO THIS
EXPOSE 80   # Privileged port, requires root
```

### ❌ Missing Health Checks

```dockerfile
# DON'T DO THIS
# No health check defined - container might be unhealthy
```

### ❌ Including Secrets

```dockerfile
# DON'T DO THIS
COPY .env /app/.env  # Secrets in image layers
RUN echo "API_KEY=secret123" >> /app/.env
```

## 📊 Security Metrics

### Before Security Hardening

- ❌ Running as root user (uid 0)
- ❌ Missing health check file
- ❌ No security headers
- ❌ Using privileged port 80
- ❌ No rate limiting
- ❌ Exposed nginx version

### After Security Hardening

- ✅ Non-root user (uid 101)
- ✅ Secure health check implementation
- ✅ Comprehensive security headers
- ✅ Non-privileged port 8080
- ✅ Request rate limiting
- ✅ Hidden server information

## 🔄 Security Maintenance

### Regular Tasks

- **Weekly**: Update base images for security patches
- **Monthly**: Run vulnerability scans on built images
- **Per Release**: Review and test security configurations
- **Quarterly**: Update security headers and configurations

### Security Monitoring

- Monitor container resource usage
- Check health check success rates
- Review nginx access logs for suspicious activity
- Validate file permissions remain correct

---

**Security Status**: ✅ All critical Docker security hotspots addressed  
**Last Review**: July 12, 2025  
**Next Review**: August 12, 2025

## 🎓 Docker Security Implementation - Lessons Learned

### Key Lessons from Implementation

#### 1. **nginx:alpine User Management Discovery**

**Lesson**: The `nginx:alpine` base image already includes a `nginx` user (uid:gid 101:101), eliminating the need to create additional users.

**Before (Overcomplicated)**:

```dockerfile
# Creating unnecessary user when nginx user already exists
RUN addgroup -g 101 -S nginx && \
    adduser -S nginx -u 101 -G nginx
```

**After (Simplified)**:

```dockerfile
# Use existing nginx user from base image
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run
```

**Key Insight**: Always investigate base image user configurations before creating custom users.

### 2. **PID File Location for Non-Root Containers**

**Lesson**: Non-root users cannot write to `/var/run/nginx.pid` due to permission restrictions.

**Problem**:

```nginx
pid /var/run/nginx.pid;  # Permission denied for non-root
```

**Solution**:

```nginx
pid /tmp/nginx.pid;  # Writable location for non-root
```

**Best Practice**: Use `/tmp` for PID files in non-root containers, or create dedicated writable directories.

### 3. **Health Check Port Configuration**

**Lesson**: Health checks must use the correct internal port, not the exposed port.

**Common Mistake**:

```dockerfile
# Wrong - uses default port 80
RUN echo 'curl -f http://localhost/ || exit 1' >> /healthcheck.sh
```

**Correct Implementation**:

```dockerfile
# Right - uses actual nginx port
RUN echo 'curl -f http://localhost:8080/ || exit 1' >> /healthcheck.sh
```

### 4. **File Permission Hierarchy**

**Lesson**: Order matters when setting permissions - use recursive operations carefully.

**Best Practice Pattern**:

```dockerfile
# 1. Set file permissions first
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
# 2. Set directory permissions second
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
# 3. Set ownership last
    chown -R nginx:nginx /usr/share/nginx/html
```

### 5. **Multi-Stage Build Security Benefits**

**Lesson**: Multi-stage builds provide natural security isolation between build and runtime environments.

**Security Benefits**:

- Build tools and dependencies don't exist in final image
- Reduced attack surface in production
- Smaller final image size
- Clean separation of concerns

### 6. **Package Management in Alpine Linux**

**Lesson**: Always clean up package caches and temporary files to reduce image size and attack surface.

**Pattern**:

```dockerfile
# Install, use, and clean up in single layer
RUN apk add --no-cache curl && \
    # Use curl for health check setup
    apk del --purge && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*
```

## 🔧 Implementation Patterns That Work

### 1. **Security Header Implementation**

**Pattern**: Implement security headers in nginx configuration, not in application code.

```nginx
# Comprehensive security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### 2. **Rate Limiting Configuration**

**Pattern**: Use nginx's built-in rate limiting for DDoS protection.

```nginx
# Define rate limiting zone
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

# Apply rate limiting
limit_req zone=one burst=20 nodelay;
```

### 3. **Non-Root Container Template**

**Proven Pattern**:

```dockerfile
FROM nginx:alpine

# Utilize existing nginx user
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run

# Copy with proper ownership
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Set proper permissions
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    chown -R nginx:nginx /usr/share/nginx/html

# Switch to non-root
USER nginx
```

## ⚠️ Common Pitfalls to Avoid

### 1. **Permission Denied Errors**

**Problem**: Setting permissions without considering user context.
**Solution**: Always verify what user the container runs as and set permissions accordingly.

### 2. **Health Check Failures**

**Problem**: Using wrong ports or missing curl in minimal images.
**Solution**: Install required tools and use correct internal ports.

### 3. **Build Context Size**

**Problem**: Large build contexts slow down Docker builds.
**Solution**: Use `.dockerignore` to exclude unnecessary files.

### 4. **Security Header Inheritance**

**Problem**: Security headers not applying to all responses.
**Solution**: Use `always` directive in nginx configuration.

## 🔄 Iterative Improvement Process

### Phase 1: Basic Security

- Non-root user implementation
- Basic file permissions
- Health check setup

### Phase 2: Advanced Security

- Security headers implementation
- Rate limiting configuration
- PID file relocation

### Phase 3: Production Hardening

- Comprehensive permission audit
- Performance optimization
- Documentation and testing

### Phase 4: Monitoring & Maintenance

- Health check validation
- Log monitoring setup
- Regular security updates

## 🎯 Success Metrics

- ✅ Container starts successfully as non-root user
- ✅ Health check shows "healthy" status
- ✅ All security headers present in responses
- ✅ No permission denied errors in logs
- ✅ Rate limiting functional without breaking legitimate traffic
- ✅ Application fully functional with security hardening
