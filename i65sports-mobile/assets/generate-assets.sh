#!/bin/bash

# Script to generate app icon assets from a source logo
# Usage: ./generate-assets.sh <source-logo-file>

set -e

SOURCE_FILE="$1"

if [ -z "$SOURCE_FILE" ]; then
    echo "Usage: ./generate-assets.sh <source-logo-file>"
    echo "Example: ./generate-assets.sh logo.png"
    exit 1
fi

if [ ! -f "$SOURCE_FILE" ]; then
    echo "Error: Source file '$SOURCE_FILE' not found"
    exit 1
fi

echo "Generating app assets from $SOURCE_FILE..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Install it with: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)"
    exit 1
fi

# Colors
BG_COLOR="#0A0E27"

# Create icon.png (1024x1024px)
echo "Creating icon.png..."
convert "$SOURCE_FILE" \
    -resize 1024x1024 \
    -background none \
    -gravity center \
    -extent 1024x1024 \
    icon.png

# Create adaptive-icon.png (1024x1024px, centered with safe zone)
echo "Creating adaptive-icon.png..."
convert "$SOURCE_FILE" \
    -resize 800x800 \
    -background transparent \
    -gravity center \
    -extent 1024x1024 \
    adaptive-icon.png

# Create splash.png (1284x2778px with centered logo)
echo "Creating splash.png..."
convert "$SOURCE_FILE" \
    -resize 600x600 \
    -background "$BG_COLOR" \
    -gravity center \
    -extent 1284x2778 \
    splash.png

# Create favicon.png (48x48px)
echo "Creating favicon.png..."
convert "$SOURCE_FILE" \
    -resize 48x48 \
    favicon.png

echo "✅ All assets generated successfully!"
echo ""
echo "Generated files:"
echo "  - icon.png (1024x1024px)"
echo "  - adaptive-icon.png (1024x1024px)"
echo "  - splash.png (1284x2778px)"
echo "  - favicon.png (48x48px)"
echo ""
echo "Next steps:"
echo "  1. Review the generated files"
echo "  2. Adjust sizes if needed using an image editor"
echo "  3. Test with: npx expo start"

