import sharp from "sharp";
import { writeFileSync } from "fs";

const BG = "#0A0B0D", PANEL = "#0E1014", ACCENT = "#0052FF", UP = "#3FB68B", TEXT = "#E8EAED", MUTED = "#8B909A";

// Icon: dark rounded square + ascending stacked bars (a "stack" of stocks) in accent, one green.
const icon = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0E1014"/><stop offset="1" stop-color="#08090B"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="224" fill="url(#g)"/>
  <rect x="1" y="1" width="1022" height="1022" rx="223" fill="none" stroke="#1c2230" stroke-width="2"/>
  <g>
    <rect x="300" y="600" width="120" height="160" rx="24" fill="${ACCENT}" opacity="0.55"/>
    <rect x="452" y="470" width="120" height="290" rx="24" fill="${ACCENT}" opacity="0.8"/>
    <rect x="604" y="330" width="120" height="430" rx="24" fill="${UP}"/>
  </g>
  <path d="M300 690 L512 560 L664 400" fill="none" stroke="${TEXT}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
  <circle cx="664" cy="400" r="22" fill="${TEXT}"/>
</svg>`;

const splash = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${BG}"/>
  <g transform="translate(140,120) scale(0.12)">
    <rect x="300" y="600" width="120" height="160" rx="24" fill="${ACCENT}" opacity="0.55"/>
    <rect x="452" y="470" width="120" height="290" rx="24" fill="${ACCENT}" opacity="0.8"/>
    <rect x="604" y="330" width="120" height="430" rx="24" fill="${UP}"/>
  </g>
  <text x="200" y="300" font-family="monospace" font-size="46" font-weight="600" fill="${TEXT}" text-anchor="middle" letter-spacing="4">STAX</text>
</svg>`;

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <g opacity="0.08" stroke="#ffffff" stroke-width="1">
    ${Array.from({length:28},(_,i)=>`<line x1="${i*44}" y1="0" x2="${i*44}" y2="630"/>`).join("")}
    ${Array.from({length:15},(_,i)=>`<line x1="0" y1="${i*44}" x2="1200" y2="${i*44}"/>`).join("")}
  </g>
  <g transform="translate(80,150) scale(0.42)">
    <rect x="300" y="600" width="120" height="160" rx="24" fill="${ACCENT}" opacity="0.55"/>
    <rect x="452" y="470" width="120" height="290" rx="24" fill="${ACCENT}" opacity="0.8"/>
    <rect x="604" y="330" width="120" height="430" rx="24" fill="${UP}"/>
    <path d="M300 690 L512 560 L664 400" fill="none" stroke="${TEXT}" stroke-width="14" stroke-linecap="round"/>
  </g>
  <text x="470" y="300" font-family="monospace" font-size="96" font-weight="600" fill="${TEXT}" letter-spacing="6">STAX</text>
  <text x="474" y="360" font-family="sans-serif" font-size="34" fill="${MUTED}">Tokenized stock baskets on Base</text>
  <text x="474" y="418" font-family="sans-serif" font-size="24" fill="${ACCENT}">Build · value · save onchain · alert</text>
</svg>`;

async function main() {
  await sharp(Buffer.from(icon)).png().toFile("public/icon.png");
  await sharp(Buffer.from(splash)).png().toFile("public/splash.png");
  await sharp(Buffer.from(og)).png().toFile("public/og.png");
  await sharp(Buffer.from(icon)).resize(180,180).png().toFile("public/apple-icon.png");
  await sharp(Buffer.from(icon)).resize(48,48).png().toFile("public/favicon.png");
  writeFileSync("public/icon.svg", icon.trim());
  console.log("assets rendered");
}
main();
