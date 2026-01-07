#!/bin/bash

# Build and Push All Docker Images
# API: twsbpmac/acm-api (target: 500-600MB)
# Web: twsbpmac/acm
# Usage: ./scripts/build-all.sh [version] [company]

set -e

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

echo "🚀 Building All Docker Images for Account Manager"
echo "Version: ${VERSION}"
if [ -n "$COMPANY" ]; then
    echo "Company: ${COMPANY}"
fi
echo ""

# Build API image
echo "📦 Building API Image..."
echo "Target: twsbpmac/acm-api (500-600MB)"
./scripts/build-api.sh "$VERSION" "$COMPANY" --auto-push

echo ""
echo "----------------------------------------"
echo ""

# Build Web image
echo "📦 Building Web Image..."
echo "Target: twsbpmac/acm"
./scripts/build-web.sh "$VERSION" "$COMPANY" --auto-push

echo ""
echo "🎉 All images built and pushed successfully!"
echo ""
echo "📋 Summary:"
if [ -n "$COMPANY" ]; then
    echo "  API: twsbpmac/acm-api:$VERSION-$COMPANY"
    echo "  Web: twsbpmac/acm:$VERSION-$COMPANY"
else
    echo "  API: twsbpmac/acm-api:$VERSION"
    echo "  Web: twsbpmac/acm:$VERSION"
fi
echo ""
echo "🚀 To run both services:"
if [ -n "$COMPANY" ]; then
    echo "  API: docker run -d -p 3000:3000 --name acm-api twsbpmac/acm-api:$VERSION-$COMPANY"
    echo "  Web: docker run -d -p 80:80 --name acm-web twsbpmac/acm:$VERSION-$COMPANY"
else
    echo "  API: docker run -d -p 3000:3000 --name acm-api twsbpmac/acm-api:$VERSION"
    echo "  Web: docker run -d -p 80:80 --name acm-web twsbpmac/acm:$VERSION"
fi