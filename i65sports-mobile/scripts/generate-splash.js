// Generate splash screen with your logo
// Run: node scripts/generate-splash.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '../assets/i65-icon.jpg');
const outputPath = path.join(__dirname, '../assets/splash.png');

const SPLASH_WIDTH = 1284;
const SPLASH_HEIGHT = 2778;
const LOGO_SIZE = 400;

async function generateSplash() {
  // Check if source file exists
  if (!fs.existsSync(sourceIcon)) {
    console.error(`❌ Source icon not found: ${sourceIcon}`);
    console.error('Please place your source icon at: assets/i65-icon.jpg');
    console.error('Supported formats: JPG, PNG, SVG');
    process.exit(1);
  }

  console.log(`📸 Source icon: ${sourceIcon}`);
  console.log(`📁 Output: ${outputPath}\n`);

  try {
    // Create dark background
    const background = await sharp({
      create: {
        width: SPLASH_WIDTH,
        height: SPLASH_HEIGHT,
        channels: 4,
        background: { r: 10, g: 14, b: 39, alpha: 1 } // #0A0E27
      }
    }).png().toBuffer();

    // Resize logo
    const logo = await sharp(sourceIcon)
      .resize(LOGO_SIZE, LOGO_SIZE, { fit: 'contain' })
      .toBuffer();

    // Composite logo onto background (centered)
    await sharp(background)
      .composite([{
        input: logo,
        top: Math.floor((SPLASH_HEIGHT - LOGO_SIZE) / 2),
        left: Math.floor((SPLASH_WIDTH - LOGO_SIZE) / 2)
      }])
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated splash.png (${SPLASH_WIDTH}x${SPLASH_HEIGHT})`);
    console.log(`   Logo size: ${LOGO_SIZE}x${LOGO_SIZE}px (centered)`);
  } catch (error) {
    console.error('❌ Error generating splash screen:', error.message);
    process.exit(1);
  }
}

generateSplash().catch(console.error);

