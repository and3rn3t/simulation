# Multi-stage build for optimization
FROM node:20-alpine AS builder

# Security: Create non-root user for build stage
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Security: Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Copy package files
COPY package*.json ./
RUN chown nextjs:nodejs package*.json

# Install all dependencies (including dev dependencies for build)
RUN npm config set cache /app/.npm-cache --global && \
    npm ci

# Copy only necessary source files for build (exclude node_modules, .git, Dockerfile, .dockerignore)
COPY --chown=nextjs:nodejs ./src /app/src
COPY --chown=nextjs:nodejs public /app/public
COPY --chown=nextjs:nodejs vite.config.ts /app/vite.config.ts
COPY --chown=nextjs:nodejs tsconfig.json /app/
COPY --chown=nextjs:nodejs tsconfig.node.json /app/

# Security: Set proper permissions on all copied files (read-only for non-owners)
RUN find /app/src -type f -exec chmod 644 {} \; && \
    find /app/src -type d -exec chmod 755 {} \; && \
    find /app/public -type f -exec chmod 644 {} \; && \
    find /app/public -type d -exec chmod 755 {} \; && \
    chmod 644 /app/vite.config.ts /app/tsconfig.json /app/tsconfig.node.json

# Build the application
RUN npm run build

# Clean up dev dependencies after build
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM nginx:alpine

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
RUN chmod 644 /etc/nginx/nginx.conf && \
    echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'curl -f http://localhost:8080/ || exit 1' >> /healthcheck.sh && \
    chmod 755 /healthcheck.sh && \
    chown nginx:nginx /healthcheck.sh && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/* && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
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
