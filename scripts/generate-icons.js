const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const iconsDir = path.join(publicDir, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function createSvg(size, isMaskable = false) {
  const fontSize = Math.round(isMaskable ? size * 0.48 : size * 0.56);
  const baselineOffset = Math.round(fontSize * 0.35);
  const cy = Math.round(size / 2 + baselineOffset * 0.95);
  const cx = Math.round(size / 2);
  const rx = isMaskable ? 0 : Math.round(size * 0.22);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4338CA" />
      <stop offset="100%" stop-color="#312E81" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bgGrad)" />
  <text x="${cx}" y="${cy}" font-family="'Fraunces', Georgia, serif" font-size="${fontSize}" font-weight="700" fill="#F7F6F2" text-anchor="middle">C</text>
</svg>`;
}

async function run() {
  const svg192 = Buffer.from(createSvg(192));
  await sharp(svg192).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));

  const svg512 = Buffer.from(createSvg(512));
  await sharp(svg512).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));

  const svgMaskable = Buffer.from(createSvg(512, true));
  await sharp(svgMaskable).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512-maskable.png'));

  const svgApple = Buffer.from(createSvg(180));
  await sharp(svgApple).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Also write SVG icon for modern browser favicon/vector icon
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), createSvg(128));

  console.log('PWA and Apple Touch icons generated successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
