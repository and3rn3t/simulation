# Multi-stage build for optimization
FROM node:20-alpine AS base

# Install security updates and minimize attack surface
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Security: Create non-root user for build stage
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Security: Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Development stage (optional - can be used for debugging)
FROM base AS development
ENV NODE_ENV=development
COPY --chown=nextjs:nodejs package*.json ./
RUN npm ci --frozen-lockfile
COPY --chown=nextjs:nodejs . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder

# Build arguments for flexibility
ARG NODE_ENV=production
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

ENV NODE_ENV=${NODE_ENV}

# Copy package files first for better layer caching
COPY --chown=nextjs:nodejs package*.json ./

# Install all dependencies (including dev dependencies for build)
# Use npm ci with frozen lockfile for reproducible builds
RUN npm ci --frozen-lockfile --only-if-present

# Copy only necessary source files for build (exclude node_modules, .git, Dockerfile, .dockerignore)
# Copy configuration files first (better caching)
COPY --chown=nextjs:nodejs tsconfig.json vite.config.ts index.html ./

# Copy source files
COPY --chown=nextjs:nodejs ./src /app/src
COPY --chown=nextjs:nodejs ./public /app/public

# Security: Set proper permissions on all copied files (read-only for non-owners)
# Combine into fewer RUN commands to reduce layers
RUN find /app/src /app/public -type f -exec chmod 644 {} + && \
    find /app/src /app/public -type d -exec chmod 755 {} + && \
    chmod 644 /app/index.html /app/vite.config.ts /app/tsconfig.json

# Build the application with optimized settings
ENV NODE_ENV=production
RUN npm run build

# Clean up dev dependencies and cache in single layer
RUN npm ci --frozen-lockfile --omit=dev && \
    npm cache clean --force && \
    rm -rf /tmp/* /home/nextjs/.npm

# Production stage
FROM nginx:alpine AS production

# Build arguments
ARG BUILD_DATE
ARG VCS_REF  
ARG VERSION="1.0"

# Metadata for better maintenance
LABEL maintainer="simulation-team" \
      description="Organism Simulation Game - Production Container" \
      version="${VERSION}" \
      build-date="${BUILD_DATE}" \
      vcs-ref="${VCS_REF}" \
      security.non-root="true" \
      security.scan="trivy" \
      org.opencontainers.image.title="Organism Simulation" \
      org.opencontainers.image.description="Interactive organism simulation game" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}"

# Security: The nginx:alpine image already has nginx user (uid:gid 101:101)
# We just need to ensure proper directory permissions

# Security: Create necessary directories with proper permissions for existing nginx user
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run

# Copy built assets from builder stage with secure permissions
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy nginx configuration with secure permissions
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Security: Create healthcheck script, install curl, and set all permissions
# Use specific curl version for security and combine operations
RUN chmod 644 /etc/nginx/nginx.conf && \
    echo '#!/bin/sh\ncurl -f http://localhost:8080/ || exit 1' > /healthcheck.sh && \
    chmod 755 /healthcheck.sh && \
    chown nginx:nginx /healthcheck.sh && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/* /var/log/* && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} + && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} + && \
    chown -R nginx:nginx /usr/share/nginx/html

# Security: Switch to non-root user
USER nginx

# Health check with proper user
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/bin/sh", "/healthcheck.sh"]

# Expose port
EXPOSE 8080

# Security: Start nginx as non-root user
CMD ["nginx", "-g", "daemon off;"]
