#!/bin/bash

# Build and Push Docker Images for Mono-Core
# API: mono-core-api (target: 500-600MB)
# Web: mono-core-web
# Usage: ./scripts/build-and-push.sh [version] [company]

set -e

# Configuration
API_IMAGE_NAME="mono-core-api"
WEB_IMAGE_NAME="mono-core-web"
API_DOCKERFILE="apps/api/Dockerfile"
WEB_DOCKERFILE="apps/web/Dockerfile"
BUILD_CONTEXT="."

# Get version from argument or package.json
if [ -n "$1" ]; then
    VERSION="$1"
else
    VERSION=$(node -p "require('./package.json').version")
fi

# Get company from argument or default to empty
if [ -n "$2" ]; then
    COMPANY="$2"
else
    COMPANY=""
fi

echo "🚀 Building Docker Images for Mono-Core"
echo "Version: ${VERSION}"
if [ -n "$COMPANY" ]; then
    echo "Company: ${COMPANY}"
fi
echo ""

# Full image names
if [ -n "$COMPANY" ]; then
    API_LATEST="${API_IMAGE_NAME}:latest-${COMPANY}"
    API_VERSIONED="${API_IMAGE_NAME}:${VERSION}-${COMPANY}"
    WEB_LATEST="${WEB_IMAGE_NAME}:latest-${COMPANY}"
    WEB_VERSIONED="${WEB_IMAGE_NAME}:${VERSION}-${COMPANY}"
else
    API_LATEST="${API_IMAGE_NAME}:latest"
    API_VERSIONED="${API_IMAGE_NAME}:${VERSION}"
    WEB_LATEST="${WEB_IMAGE_NAME}:latest"
    WEB_VERSIONED="${WEB_IMAGE_NAME}:${VERSION}"
fi

# Build API image
echo "📦 Building API Image..."
echo "Image: ${API_IMAGE_NAME}"
echo "Dockerfile: ${API_DOCKERFILE}"
echo "Target size: 500-600MB"
echo ""

if [ ! -f "$API_DOCKERFILE" ]; then
    echo "❌ Error: Dockerfile not found at $API_DOCKERFILE"
    exit 1
fi

docker build \
    -f "${API_DOCKERFILE}" \
    -t "${API_LATEST}" \
    -t "${API_VERSIONED}" \
    "${BUILD_CONTEXT}"

echo "✅ API build completed!"
echo ""

echo "📋 API image information:"
API_SIZE=$(docker images "${API_IMAGE_NAME}:${VERSION}" --format "table {{.Size}}" | tail -n 1)
echo "Size: ${API_SIZE}"
docker images | grep "${API_IMAGE_NAME}" || echo "No images found"
echo ""

if [[ $API_SIZE == *"GB"* ]]; then
    echo "⚠️  Warning: API image size is over 1GB"
elif [[ $API_SIZE == *"MB"* ]]; then
    SIZE_MB=$(echo "$API_SIZE" | sed 's/MB//g' | awk '{print $1}')
    if [ "$SIZE_MB" -gt 600 ]; then
        echo "⚠️  Warning: API image size exceeds 600MB target"
    elif [ "$SIZE_MB" -lt 500 ]; then
        echo "✅ Great: API image size is within target range (500-600MB)"
    else
        echo "✅ Good: API image size is close to target range"
    fi
fi
echo ""

# Build Web image
echo "📦 Building Web Image..."
echo "Image: ${WEB_IMAGE_NAME}"
echo "Dockerfile: ${WEB_DOCKERFILE}"
echo ""

if [ ! -f "$WEB_DOCKERFILE" ]; then
    echo "❌ Error: Dockerfile not found at $WEB_DOCKERFILE"
    exit 1
fi

NGINX_CONF="apps/web/nginx.conf"
if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Error: nginx.conf not found at $NGINX_CONF"
    echo "This file is required for the web Docker image."
    exit 1
fi

if [ -n "$COMPANY" ]; then
    echo "📝 Using .env.${COMPANY} for build"
    if [ ! -f "apps/web/.env.${COMPANY}" ]; then
        echo "❌ Error: .env.${COMPANY} not found"
        exit 1
    fi
    cp "apps/web/.env.${COMPANY}" "apps/web/.env"
fi

docker build \
    -f "${WEB_DOCKERFILE}" \
    -t "${WEB_LATEST}" \
    -t "${WEB_VERSIONED}" \
    "${BUILD_CONTEXT}"

if [ -n "$COMPANY" ]; then
    rm -f "apps/web/.env"
    echo "🧹 Cleaned up .env file"
fi

echo "✅ Web build completed!"
echo ""

echo "📋 Web image information:"
WEB_SIZE=$(docker images "${WEB_IMAGE_NAME}:${VERSION}" --format "table {{.Size}}" | tail -n 1)
echo "Size: ${WEB_SIZE}"
docker images | grep "${WEB_IMAGE_NAME}" || echo "No images found"
echo ""

# Push images
echo "📤 Pushing images to Docker Hub..."
echo "🚀 Pushing ${API_VERSIONED}..."
docker push "${API_VERSIONED}"
echo "✅ API image pushed!"
echo ""

echo "🚀 Pushing ${WEB_VERSIONED}..."
docker push "${WEB_VERSIONED}"
echo "✅ Web image pushed!"
echo ""

echo "🎉 All images built and pushed successfully!"
echo ""
echo "📋 Summary:"
echo "  API: ${API_VERSIONED}"
echo "  Web: ${WEB_VERSIONED}"
echo ""
echo "🚀 To run both services:"
echo "  API: docker run -d -p 3000:3000 --name mono-core-api ${API_VERSIONED}"
echo "  Web: docker run -d -p 80:80 --name mono-core-web ${WEB_VERSIONED}"
