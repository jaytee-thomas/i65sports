// This script will help resize your icon to all required sizes
// Run: node scripts/generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '../assets/i65-icon.jpg');
const outputDir = path.join(__dirname, '../assets');

const sizes = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'favicon.png', size: 48 },
];

async function generateIcons() {
  // Check if source file exists
  if (!fs.existsSync(sourceIcon)) {
    console.error(`❌ Source icon not found: ${sourceIcon}`);
    console.error('Please place your source icon at: assets/i65-icon.jpg');
    console.error('Supported formats: JPG, PNG, SVG');
    process.exit(1);
  }

  console.log(`📸 Source icon: ${sourceIcon}`);
  console.log(`📁 Output directory: ${outputDir}\n`);

  for (const { name, size } of sizes) {
    const outputPath = path.join(outputDir, name);
    
    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 10, g: 14, b: 39, alpha: 1 } // #0A0E27
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error generating ${name}:`, error.message);
    }
  }
  
  console.log('\n🎉 All icons generated!');
  console.log('\n📝 Next: Create splash.png manually (1284x2778px)');
  console.log('   Or use ImageMagick: convert i65-icon.jpg -resize 600x600 -background "#0A0E27" -gravity center -extent 1284x2778 assets/splash.png');
}

generateIcons().catch(console.error);

