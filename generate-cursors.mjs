import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Site primary orange: #ff6c37
// Minimalist, small (22x22), smooth rounded shapes with subtle dark border for high contrast
const cursorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
  <path fill="#ff6c37" stroke="#0c0e10" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" d="
    M 3.5 2.5
    C 2.8 2.5 2.2 3.1 2.3 3.8
    L 4.8 17.2
    C 5.0 18.2 6.3 18.5 6.9 17.7
    L 9.2 14.3
    C 9.6 13.8 10.3 13.6 10.8 13.9
    L 15.2 16.5
    C 16.0 17.0 17.0 16.3 16.8 15.4
    L 14.7 11.2
    C 14.4 10.7 14.6 10.0 15.1 9.7
    L 18.8 7.8
    C 19.7 7.3 19.5 5.9 18.5 5.7
    L 4.3 2.5
    C 4.0 2.5 3.7 2.5 3.5 2.5 Z
  "/>
</svg>
`;

const pointerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
  <path fill="#ff6c37" stroke="#0c0e10" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" d="
    M 8 1.5
    C 6.9 1.5 6 2.4 6 3.5
    L 6 10.2
    C 5.4 9.6 4.6 9.3 3.7 9.8
    C 2.6 10.4 2.2 11.8 2.6 13.0
    C 3.5 15.8 5.8 19.5 10.5 20.5
    C 15.2 21.5 18.5 18.2 18.5 14.0
    L 18.5 12.0
    C 18.5 11.2 17.8 10.5 17 10.5
    C 16.5 10.5 16.1 10.7 15.8 11.1
    C 15.4 10.4 14.6 10 13.8 10
    C 13.3 10 12.9 10.2 12.5 10.5
    C 12.1 9.8 11.3 9.4 10.5 9.4
    L 10.5 3.5
    C 10.5 2.4 9.4 1.5 8 1.5 Z
  "/>
</svg>
`;

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  await sharp(Buffer.from(cursorSvg))
    .png()
    .toFile(path.join(publicDir, 'cursor.png'));

  await sharp(Buffer.from(pointerSvg))
    .png()
    .toFile(path.join(publicDir, 'pointer.png'));

  console.log('Generated minimalist small cursors in public/');
}

generate().catch(console.error);
