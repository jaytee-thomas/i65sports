# App Assets

This directory contains the app icons and splash screens for i65Sports.

## Required Assets

You need to create these 4 files from your logo:

| File | Size | Description |
|------|------|-------------|
| **icon.png** | 1024x1024px | Main app icon (iOS & general) |
| **adaptive-icon.png** | 1024x1024px | Android adaptive icon (centered with safe zone) |
| **splash.png** | 1284x2778px | Splash screen (logo centered on `#0A0E27` background) |
| **favicon.png** | 48x48px | Web favicon |

## Quick Start

### Option 1: Use Node.js Script (Recommended - Easiest)

If you have a source logo file named `i65-icon.jpg`:

```bash
cd /Users/jasonthomas/myRepo/i65sports/i65sports-mobile

# Install dependencies (if not already installed)
npm install

# Place your source icon at: assets/i65-icon.jpg
# Then run:
npm run generate-icons
```

This will generate:
- ✅ `icon.png` (1024x1024px)
- ✅ `adaptive-icon.png` (1024x1024px)
- ✅ `favicon.png` (48x48px)

**Generate splash screen:**
```bash
npm run generate-splash
```

**Or generate everything at once:**
```bash
npm run generate-assets
```

This generates all 4 required files automatically!

### Option 2: Use the Shell Script (Requires ImageMagick)

If you have a source logo file (PNG, JPG, or SVG):

```bash
cd /Users/jasonthomas/myRepo/i65sports/i65sports-mobile/assets
./generate-assets.sh <your-logo-file>
```

**Prerequisites:**
```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Or (Linux)
sudo apt-get install imagemagick
```

### Option 2: Use Online Tools

1. **AppIcon.co** - https://www.appicon.co/
   - Upload your logo
   - Select iOS and Android
   - Download and place files in this directory

2. **IconKitchen** - https://icon.kitchen/
   - Upload your logo
   - Generate all sizes
   - Download and extract here

### Option 3: Manual Creation

See `GENERATE_ASSETS.md` for detailed manual creation instructions.

## File Specifications

### icon.png (1024x1024px)
- Square image
- Main app icon for iOS and general use
- No transparency needed
- Logo should fill most of the space

### adaptive-icon.png (1024x1024px)
- Square image with transparent or brand-colored background
- Logo should be centered with padding (safe zone: keep within 768x768px center)
- Android will add its own background shape

### splash.png (1284x2778px)
- Background color: `#0A0E27` (already configured in app.json)
- Logo centered
- Logo should be appropriately sized (not too large/small)
- Will use "contain" resize mode

### favicon.png (48x48px)
- Small, simplified version of logo
- Should be recognizable at tiny size
- Used for web favicon

## Brand Colors

- **Background**: `#0A0E27` (Dark blue)
- **Accent**: `#00FF9F` (Bright green)

## Testing

After creating assets:

```bash
cd /Users/jasonthomas/myRepo/i65sports/i65sports-mobile
npx expo start
```

## Notes

- All files must be PNG format
- Use high-quality source images (vector/SVG preferred)
- Test on actual devices when possible
- Ensure icons are readable at small sizes

