#!/bin/bash

# Build and Push All Docker Images
# API: twsbpmac/acm-api (target: 500-600MB)
# Web: twsbpnac/acm
# Usage: ./scripts/build-all.sh [version]

set -e

# Get version from argument or package.json
if [ -n "$1" ]; then
    VERSION="$1"
else
    VERSION=$(node -p "require('./package.json').version")
fi

echo "🚀 Building All Docker Images for Account Manager"
echo "Version: ${VERSION}"
echo ""

# Build API image
echo "📦 Building API Image..."
echo "Target: twsbpmac/acm-api (500-600MB)"
./scripts/build-api.sh "$VERSION" --auto-push

echo ""
echo "----------------------------------------"
echo ""

# Build Web image
echo "📦 Building Web Image..."
echo "Target: twsbpnac/acm"
./scripts/build-web.sh "$VERSION" --auto-push

echo ""
echo "🎉 All images built and pushed successfully!"
echo ""
echo "📋 Summary:"
echo "  API: twsbpmac/acm-api:$VERSION"
echo "  Web: twsbpnac/acm:$VERSION"
echo ""
echo "🚀 To run both services:"
echo "  API: docker run -d -p 3000:3000 --name acm-api twsbpmac/acm-api:$VERSION"
echo "  Web: docker run -d -p 80:80 --name acm-web twsbpnac/acm:$VERSION"