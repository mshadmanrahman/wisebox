#!/usr/bin/env node

const major = Number(process.versions.node.split('.')[0] || 0);
const allowUnsupported = process.env.ALLOW_UNSUPPORTED_NODE === '1';
const isSupported = major >= 20 && major < 24;

if (isSupported || allowUnsupported) {
  process.exit(0);
}

console.error('\n[wisebox] Unsupported Node.js version detected.');
console.error(`[wisebox] Current: v${process.versions.node}`);
console.error('[wisebox] Required for frontend: >=20 and <24 (Node 22 LTS recommended).');
console.error('[wisebox] Run: nvm install 22 && nvm use 22');
console.error('[wisebox] Then reinstall deps in frontend: npm install\n');
process.exit(1);
