# Scripts

## generate-icons.js

Generates app icon assets from a source image.

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Place your source icon at: `assets/i65-icon.jpg`
   - Supported formats: JPG, PNG, SVG
   - The script will look for `i65-icon.jpg` by default

### Usage

```bash
# Using npm script (recommended)
npm run generate-icons

# Or directly with Node
node scripts/generate-icons.js
```

### What it generates

- `icon.png` - 1024x1024px (main app icon)
- `adaptive-icon.png` - 1024x1024px (Android adaptive icon)
- `favicon.png` - 48x48px (web favicon)

### Notes

- The script uses `#0A0E27` as the background color
- Icons are generated with "contain" fit mode (maintains aspect ratio)

---

## generate-splash.js

Generates the splash screen with your logo centered on a dark background.

### Prerequisites

Same as `generate-icons.js` - requires `assets/i65-icon.jpg`

### Usage

```bash
# Using npm script (recommended)
npm run generate-splash

# Or directly with Node
node scripts/generate-splash.js
```

### What it generates

- `splash.png` - 1284x2778px (splash screen)
  - Background: `#0A0E27` (dark blue)
  - Logo: 400x400px, centered

### Notes

- Creates a full-size splash screen (iPhone 14 Pro Max dimensions)
- Logo is automatically centered
- Uses the same source icon as the icon generator

---

## generate-assets (All-in-one)

Generate all assets at once:

```bash
npm run generate-assets
```

This runs both `generate-icons` and `generate-splash` in sequence.

### Complete workflow

```bash
# 1. Install dependencies
npm install

# 2. Place your source icon
#    Copy your logo to: assets/i65-icon.jpg

# 3. Generate all assets
npm run generate-assets

# Done! All assets are ready:
# ✅ assets/icon.png
# ✅ assets/adaptive-icon.png
# ✅ assets/favicon.png
# ✅ assets/splash.png
```

