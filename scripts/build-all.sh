#!/bin/bash

# Build and push all Docker images to Docker Hub
# Usage: ./scripts/build-all.sh [version]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Get version from argument or package.json
if [ -n "$1" ]; then
    VERSION="$1"
else
    VERSION=$(node -p "require('./package.json').version")
fi

echo "🚀 Building all Docker images..."
echo "Version: ${VERSION}"
echo "Project Root: ${PROJECT_ROOT}"
echo ""

# Change to project root directory
cd "$PROJECT_ROOT"

# Function to build and push image
build_image() {
    local script_name="$1"
    local image_name="$2"
    
    echo "📦 Building ${image_name}..."
    
    if [ ! -f "$script_name" ]; then
        echo "❌ Error: Script $script_name not found!"
        exit 1
    fi
    
    # Execute build script with version argument and auto-confirm push
    echo "y" | "$script_name" "$VERSION"
    
    if [ $? -eq 0 ]; then
        echo "✅ ${image_name} built and pushed successfully!"
    else
        echo "❌ Failed to build ${image_name}!"
        exit 1
    fi
    
    echo ""
}

# Build API image
build_image "${SCRIPT_DIR}/build-api.sh" "API"

# Build Web image
build_image "${SCRIPT_DIR}/build-web.sh" "Web"

echo "🎉 All images built and pushed successfully!"
echo ""
echo "🔗 Available images:"
echo "  - twsbpmac/starter-api:latest"
echo "  - twsbpmac/starter-api:${VERSION}"
echo "  - twsbpmac/starter-web:latest"
echo "  - twsbpmac/starter-web:${VERSION}"
echo ""
echo "🚀 You can now deploy using:"
echo "  docker-compose -f docker-compose.prod.yml up -d"