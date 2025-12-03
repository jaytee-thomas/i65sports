# Quick Setup Guide

## Current Status

✅ Scripts are ready and configured
❌ Source icon file needed

## Next Steps

### 1. Place Your Source Icon

Copy your logo/image file to:
```
assets/i65-icon.jpg
```

**Supported formats:**
- JPG/JPEG
- PNG
- SVG

**Recommended:**
- High resolution (at least 1024x1024px)
- Square or will be cropped to square
- Clear, recognizable logo

### 2. Install Dependencies (if not already done)

```bash
cd /Users/jasonthomas/myRepo/i65sports/i65sports-mobile
npm install
```

This will install `sharp` (image processing library).

### 3. Generate All Assets

Once you have `assets/i65-icon.jpg`, run:

```bash
# Generate all assets at once
npm run generate-assets

# Or run individually:
npm run generate-icons
npm run generate-splash
```

### 4. Verify Generated Files

After running the scripts, you should have:

- ✅ `assets/icon.png` (1024x1024px)
- ✅ `assets/adaptive-icon.png` (1024x1024px)
- ✅ `assets/favicon.png` (48x48px)
- ✅ `assets/splash.png` (1284x2778px)

## Troubleshooting

**Error: "Source icon not found"**
- Make sure `i65-icon.jpg` exists in the `assets/` directory
- Check the file name matches exactly (case-sensitive)

**Error: "sharp module not found"**
- Run `npm install` to install dependencies

**Error: "Cannot find module 'sharp'"**
- Make sure you're in the `i65sports-mobile` directory
- Run `npm install` again

## Manual Alternative

If you prefer to create assets manually, see `GENERATE_ASSETS.md` for instructions.

