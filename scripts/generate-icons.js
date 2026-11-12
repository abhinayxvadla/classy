const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const appDir = path.join(process.cwd(), 'app');
const iconsDir = path.join(publicDir, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function createSvg(size, isMaskable = false) {
  const fontSize = Math.round(isMaskable ? size * 0.48 : size * 0.58);
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

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  let offset = 6 + 16 * count;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  const datas = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width === 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height === 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset

    entries.push(entry);
    datas.push(item.buffer);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...datas]);
}

async function run() {
  // 1. PWA & Mobile Touch Icons
  const svg192 = Buffer.from(createSvg(192));
  await sharp(svg192).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));

  const svg512 = Buffer.from(createSvg(512));
  await sharp(svg512).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));

  const svgMaskable = Buffer.from(createSvg(512, true));
  await sharp(svgMaskable).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512-maskable.png'));

  const svgApple = Buffer.from(createSvg(180));
  await sharp(svgApple).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 2. SVG Icons (Vector for modern high-DPI displays)
  const svg128 = createSvg(128);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg128);
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svg128);

  // 3. Multi-resolution ICO (16x16, 32x32, 48x48)
  const png16 = await sharp(Buffer.from(createSvg(16))).resize(16, 16).png().toBuffer();
  const png32 = await sharp(Buffer.from(createSvg(32))).resize(32, 32).png().toBuffer();
  const png48 = await sharp(Buffer.from(createSvg(48))).resize(48, 48).png().toBuffer();

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);

  console.log('✓ Classy favicon.ico and icon assets generated successfully in public/ and app/!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
