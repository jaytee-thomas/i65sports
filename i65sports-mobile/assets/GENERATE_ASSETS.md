# Generating App Icon Assets

## Quick Start

If you have a source logo image (PNG, JPG, or SVG), you can use one of these methods:

### Method 1: Using ImageMagick (Command Line)

If you have ImageMagick installed, you can resize your logo:

```bash
# Assuming you have a source logo file called "logo.png" or "logo.svg"

# Create icon.png (1024x1024px)
convert logo.png -resize 1024x1024 -background none -gravity center -extent 1024x1024 icon.png

# Create adaptive-icon.png (1024x1024px, centered with padding)
convert logo.png -resize 800x800 -background transparent -gravity center -extent 1024x1024 adaptive-icon.png

# Create splash.png (1284x2778px with centered logo)
convert logo.png -resize 600x600 -background "#0A0E27" -gravity center -extent 1284x2778 splash.png

# Create favicon.png (48x48px)
convert logo.png -resize 48x48 favicon.png
```

### Method 2: Using Online Tools

1. **AppIcon.co** - https://www.appicon.co/
   - Upload your logo
   - Select iOS and Android
   - Download and extract to assets folder

2. **IconKitchen** - https://icon.kitchen/
   - Upload your logo
   - Generate all sizes
   - Download and extract

3. **Expo Asset Generator** (if you have Node.js):
   ```bash
   npm install -g expo-asset-generator
   expo-asset-generator logo.png
   ```

### Method 3: Manual Creation (Using Design Tools)

#### icon.png (1024x1024px)
- Create a square canvas: 1024x1024px
- Place your logo centered
- Export as PNG

#### adaptive-icon.png (1024x1024px)
- Create a square canvas: 1024x1024px
- Place your logo in the center
- Leave padding around edges (safe zone: keep logo within 768x768px center area)
- Background should be transparent or match your brand
- Export as PNG

#### splash.png (1284x2778px)
- Create a canvas: 1284x2778px (iPhone 14 Pro Max size)
- Set background color to `#0A0E27`
- Place your logo centered
- Logo should be appropriately sized (not too large, not too small)
- Export as PNG

#### favicon.png (48x48px)
- Create a square canvas: 48x48px
- Place a simplified version of your logo
- Export as PNG

## File Requirements Summary

| File | Size | Notes |
|------|------|-------|
| `icon.png` | 1024x1024px | Main app icon, square, no transparency needed |
| `adaptive-icon.png` | 1024x1024px | Android adaptive icon, centered with safe zone padding |
| `splash.png` | 1284x2778px | Splash screen, background `#0A0E27`, logo centered |
| `favicon.png` | 48x48px | Web favicon, simplified logo |

## Color Reference

- Background: `#0A0E27` (Dark blue)
- Accent: `#00FF9F` (Bright green)
- Use these colors in your splash screen and icons

## Testing

After creating the assets, test them:

```bash
# Start Expo
cd /Users/jasonthomas/myRepo/i65sports/i65sports-mobile
npx expo start

# Or build preview
npx expo prebuild
```

## Notes

- All icons should be PNG format
- Use high-quality source images (vector if possible)
- Ensure icons look good at small sizes (especially favicon)
- Test on actual devices when possible
- The splash screen will use "contain" resize mode, so your logo will scale proportionally

