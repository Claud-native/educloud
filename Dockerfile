# ===================================
# EduCloud Frontend - Production Dockerfile
# Multi-stage build for React + Vite
# ===================================

# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build the application
# Note: Environment variables starting with VITE_ are embedded at build time
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration if exists
# COPY nginx.conf /etc/nginx/nginx.conf

# Create script to replace API URL at runtime
RUN printf '#!/bin/sh\n\
set -e\n\
echo "Configuring EduCloud Frontend..."\n\
if [ -n "$VITE_API_BASE_URL" ]; then\n\
  echo "Replacing API URL with: ${VITE_API_BASE_URL}"\n\
  find /usr/share/nginx/html -type f \\( -name "*.js" -o -name "*.html" \\) -exec sed -i "s|http://localhost:8080/api|${VITE_API_BASE_URL}|g" {} \\;\n\
fi\n\
echo "Configuration completed"\n' > /docker-entrypoint.d/40-replace-api-url.sh && \
    chmod +x /docker-entrypoint.d/40-replace-api-url.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
