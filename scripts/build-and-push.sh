#!/bin/bash

set -e

DOCKER_HUB_ORG="twsbpmac"
API_IMAGE_NAME="${DOCKER_HUB_ORG}/monocore-api"
WEB_IMAGE_NAME="${DOCKER_HUB_ORG}/monocore"
API_DOCKERFILE="apps/api/Dockerfile"
WEB_DOCKERFILE="apps/web/Dockerfile"
BUILD_CONTEXT="."

if [ -n "$1" ]; then
    VERSION="$1"
else
    VERSION=$(node -p "require('./package.json').version")
fi

echo "Building Docker Images"
echo "  API: ${API_IMAGE_NAME}:${VERSION}"
echo "  Web: ${WEB_IMAGE_NAME}:${VERSION}"
echo ""

# Build API
echo "Building API image..."
docker build \
    -f "${API_DOCKERFILE}" \
    -t "${API_IMAGE_NAME}:latest" \
    -t "${API_IMAGE_NAME}:${VERSION}" \
    "${BUILD_CONTEXT}"
echo "API build done"
echo ""

# Build Web
echo "Building Web image..."
docker build \
    -f "${WEB_DOCKERFILE}" \
    -t "${WEB_IMAGE_NAME}:latest" \
    -t "${WEB_IMAGE_NAME}:${VERSION}" \
    "${BUILD_CONTEXT}"
echo "Web build done"
echo ""

# Push
echo "Pushing to Docker Hub..."
docker push "${API_IMAGE_NAME}:latest"
docker push "${API_IMAGE_NAME}:${VERSION}"
docker push "${WEB_IMAGE_NAME}:latest"
docker push "${WEB_IMAGE_NAME}:${VERSION}"
echo ""

echo "Done!"
echo "  API: ${API_IMAGE_NAME}:${VERSION}"
echo "  Web: ${WEB_IMAGE_NAME}:${VERSION}"
