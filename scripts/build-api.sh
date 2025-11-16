#!/bin/bash

# Build and push API Docker image to Docker Hub
# Target: twsbpmac/acm-api
# Target size: 500-600MB
# Usage: ./scripts/build-api.sh [version]

set -e

# Configuration
IMAGE_NAME="twsbpmac/acm-api"
DOCKERFILE="apps/api/Dockerfile.optimized"
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

echo "🚀 Building API Docker image..."
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

# Build the image
echo "📦 Building Docker image..."
echo "Target size: 500-600MB"
docker build \
    -f "${DOCKERFILE}" \
    -t "${IMAGE_LATEST}" \
    -t "${IMAGE_VERSIONED}" \
    "${BUILD_CONTEXT}"

echo "✅ Build completed successfully!"
echo ""

# Show image information and size
echo "📋 Image information:"
IMAGE_SIZE=$(docker images "${IMAGE_NAME}:${VERSION}" --format "table {{.Size}}" | tail -n 1)
echo "Size: ${IMAGE_SIZE}"
docker images | grep "${IMAGE_NAME}" || echo "No images found"
echo ""

# Check if size is within target range
if [[ $IMAGE_SIZE == *"GB"* ]]; then
    echo "⚠️  Warning: Image size is over 1GB"
elif [[ $IMAGE_SIZE == *"MB"* ]]; then
    SIZE_MB=$(echo "$IMAGE_SIZE" | sed 's/MB//g' | awk '{print $1}')
    if [ "$SIZE_MB" -gt 600 ]; then
        echo "⚠️  Warning: Image size exceeds 600MB target"
    elif [ "$SIZE_MB" -lt 500 ]; then
        echo "✅ Great: Image size is within target range (500-600MB)"
    else
        echo "✅ Good: Image size is close to target range"
    fi
fi
echo ""

# Check for auto-push flag
if [ "$2" = "--auto-push" ]; then
    AUTO_PUSH=true
else
    AUTO_PUSH=false
fi

# Push images
if [ "$AUTO_PUSH" = true ]; then
    echo "📤 Auto-pushing images to Docker Hub..."
    echo "🚀 Pushing ${IMAGE_LATEST}..."
    docker push "${IMAGE_LATEST}"
    
    echo "🚀 Pushing ${IMAGE_VERSIONED}..."
    docker push "${IMAGE_VERSIONED}"
    
    echo "✅ Images pushed successfully!"
else
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
fi

echo ""
echo "🎉 Build script completed!"