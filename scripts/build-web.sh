#!/bin/bash

# Build and push Web Docker image to Docker Hub
# Target: twsbpmac/acm
# Usage: ./scripts/build-web.sh [version] [company]

set -e

# Configuration
IMAGE_NAME="twsbpmac/acm"
DOCKERFILE="apps/web/Dockerfile.optimized"
BUILD_CONTEXT="."

# Get version from argument or package.json
if [ -n "$1" ]; then
    VERSION="$1"
else
    VERSION=$(node -p "require('./package.json').version")
fi

# Get company from argument or default to empty (latest)
if [ -n "$2" ]; then
    COMPANY="$2"
else
    COMPANY=""
fi

# Full image names
if [ -n "$COMPANY" ]; then
    IMAGE_LATEST="${IMAGE_NAME}:latest-${COMPANY}"
    IMAGE_VERSIONED="${IMAGE_NAME}:${VERSION}-${COMPANY}"
else
    IMAGE_LATEST="${IMAGE_NAME}:latest"
    IMAGE_VERSIONED="${IMAGE_NAME}:${VERSION}"
fi

echo "🚀 Building Web Docker image..."
echo "Image: ${IMAGE_NAME}"
echo "Version: ${VERSION}"
if [ -n "$COMPANY" ]; then
    echo "Company: ${COMPANY}"
fi
echo "Dockerfile: ${DOCKERFILE}"
echo "Context: ${BUILD_CONTEXT}"
echo ""

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE" ]; then
    echo "❌ Error: Dockerfile not found at $DOCKERFILE"
    exit 1
fi

# Check if nginx.conf exists (required for web Dockerfile)
NGINX_CONF="apps/web/nginx.conf"
if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Error: nginx.conf not found at $NGINX_CONF"
    echo "This file is required for the web Docker image."
    exit 1
fi

# Build the image
echo "📦 Building Docker image..."
if [ -n "$COMPANY" ]; then
    echo "📝 Using .env.${COMPANY} for build"
    cp "apps/web/.env.${COMPANY}" "apps/web/.env"
fi

docker build \
    -f "${DOCKERFILE}" \
    -t "${IMAGE_LATEST}" \
    -t "${IMAGE_VERSIONED}" \
    "${BUILD_CONTEXT}"

if [ -n "$COMPANY" ]; then
    rm -f "apps/web/.env"
    echo "🧹 Cleaned up .env file"
fi

echo "✅ Build completed successfully!"
echo ""

# Show image information and size
echo "📋 Image information:"
IMAGE_SIZE=$(docker images "${IMAGE_NAME}:${VERSION}" --format "table {{.Size}}" | tail -n 1)
echo "Size: ${IMAGE_SIZE}"
docker images | grep "${IMAGE_NAME}" || echo "No images found"
echo ""

# Push images
echo "📤 Pushing images to Docker Hub..."
echo "🚀 Pushing ${IMAGE_VERSIONED}..."
docker push "${IMAGE_VERSIONED}"

echo "✅ Images pushed successfully!"
echo ""
echo "🔗 Available image:"
echo "  - ${IMAGE_VERSIONED}"

echo ""
echo "🎉 Build script completed!"