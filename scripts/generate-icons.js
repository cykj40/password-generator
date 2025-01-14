const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
    const sizes = [192, 512];
    const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/icon.svg'));

    for (const size of sizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(__dirname, `../public/icon-${size}x${size}.png`));

        console.log(`Generated ${size}x${size} icon`);
    }
}

generateIcons().catch(console.error); 