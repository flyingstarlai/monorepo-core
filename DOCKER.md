# Docker Build and Deployment Guide

## Overview

This guide covers building and deploying the Account Manager application using Docker.

## Images

- **API**: `twsbpmac/acm-api` (target size: 500-600MB)
- **Web**: `twsbpnac/acm`

## Build Scripts

### Individual Builds

#### API Build

```bash
# Build with version from package.json
./scripts/build-api.sh

# Build with specific version
./scripts/build-api.sh v1.0.0
```

#### Web Build

```bash
# Build with version from package.json
./scripts/build-web.sh

# Build with specific version
./scripts/build-web.sh v1.0.0
```

### Combined Build

```bash
# Build both images with version from package.json
./scripts/build-all.sh

# Build both images with specific version
./scripts/build-all.sh v1.0.0
```

## Dockerfiles

### Optimized Dockerfiles

- `apps/api/Dockerfile.optimized` - Ultra-optimized multi-stage build for API
- `apps/web/Dockerfile.optimized` - Ultra-optimized multi-stage build for Web

### Optimization Features

#### API Optimizations

- Multi-stage build to reduce final image size
- Alpine Linux base image for minimal footprint
- Production dependencies only in final stage
- Non-root user for security
- Proper signal handling with dumb-init
- Target size: 500-600MB

#### Web Optimizations

- Multi-stage build with separate builder and runtime
- Nginx Alpine for minimal web server
- Static assets only in final stage
- Non-root user for security
- Cleaned up package manager cache

## Local Development

### Using Docker Compose

```bash
# Start both services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Individual Container Testing

```bash
# Test API
docker run -d -p 3000:3000 --name acm-api-test twsbpmac/acm-api:latest
curl http://localhost:3000

# Test Web
docker run -d -p 8080:80 --name acm-web-test twsbpnac/acm:latest
curl http://localhost:8080
```

## Production Deployment

### Environment Variables

Create a `.env` file for production:

```env
# Database
DB_HOST=your-db-host
DB_PORT=1433
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=your-database

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
```

### Deploy with Docker Compose

```bash
# With environment file
docker-compose -f docker-compose.prod.yml --env-file .env up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale api=2
```

## Image Size Monitoring

The build scripts include automatic size checking:

- **API Target**: 500-600MB
- **Web Target**: Minimal (typically <50MB)

Build scripts will report warnings if images exceed target sizes.

## Health Checks

Both images include comprehensive health checks:

### API Health Check

- Tests HTTP endpoint on port 3000
- 30s interval, 10s timeout
- 3 retries before marking unhealthy

### Web Health Check

- Tests HTTP endpoint on port 80
- 30s interval, 10s timeout
- 3 retries before marking unhealthy

## Security Features

- Non-root user execution
- Minimal base images (Alpine)
- Production dependencies only
- No development tools in final images
- Proper signal handling

## Troubleshooting

### Common Issues

1. **Build fails with "Dockerfile not found"**
   - Ensure you're in the project root directory
   - Check that optimized Dockerfiles exist

2. **Image size too large**
   - Check for unnecessary dependencies
   - Verify multi-stage build is working
   - Clean up package manager cache

3. **Health check failures**
   - Ensure applications start correctly
   - Check port configurations
   - Verify application health endpoints

### Debug Commands

```bash
# Inspect image layers
docker history twsbpmac/acm-api:latest

# Check image size
docker images | grep acm

# View container logs
docker logs acm-api-test
docker logs acm-web-test

# Execute commands in container
docker exec -it acm-api-test sh
```

## CI/CD Integration

The build scripts are designed for CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Build and Push Docker Images
  run: |
    ./scripts/build-all-docker.sh ${{ github.sha }}
```

## Registry Information

- **Docker Hub**: `twsbpmac/acm-api`, `twsbpnac/acm`
- **Versioning**: Semantic versioning supported
- **Latest Tag**: Always updated on successful build
