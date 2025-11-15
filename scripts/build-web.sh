#!/bin/bash

# Build and push Web Docker image to Docker Hub
# Usage: ./scripts/build-web.sh [version]

set -e

# Configuration
IMAGE_NAME="twsbpmac/starter-web"
DOCKERFILE="apps/web/Dockerfile"
BUILD_CONTEXT="."

# Get version from argument or package.json
if [ -n "$1" ]; then
    VERSION="$1"
else
    VERSION=$(node -p "require('./package.json').version")
fi

# Full image names
IMAGE_LATEST="${IMAGE_NAME}:latest"
IMAGE_VERSIONED="${IMAGE_NAME}:${VERSION}"

echo "🚀 Building Web Docker image..."
echo "Image: ${IMAGE_NAME}"
echo "Version: ${VERSION}"
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
docker build \
    -f "${DOCKERFILE}" \
    -t "${IMAGE_LATEST}" \
    -t "${IMAGE_VERSIONED}" \
    "${BUILD_CONTEXT}"

echo "✅ Build completed successfully!"
echo ""

# Show image information
echo "📋 Image information:"
docker images | grep "${IMAGE_NAME}" || echo "No images found"
echo ""

# Ask for confirmation before pushing
read -p "📤 Push images to Docker Hub? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing ${IMAGE_LATEST}..."
    docker push "${IMAGE_LATEST}"
    
    echo "🚀 Pushing ${IMAGE_VERSIONED}..."
    docker push "${IMAGE_VERSIONED}"
    
    echo "✅ Images pushed successfully!"
    echo ""
    echo "🔗 Available images:"
    echo "  - ${IMAGE_LATEST}"
    echo "  - ${IMAGE_VERSIONED}"
else
    echo "❌ Push cancelled. Images built locally only."
fi

echo ""
echo "🎉 Build script completed!"