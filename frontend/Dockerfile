# syntax=docker/dockerfile:1
# ==============================================================================
# Golden Snitch — Frontend Production Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Build production bundle
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Compile TypeScript and bundle with Vite
RUN npm run build

# Stage 2: Serve via hardened Nginx
FROM nginx:1.25-alpine AS runtime

# Copy compiled static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy optimized SPA and proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
