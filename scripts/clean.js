const fs = require('fs');
const path = require('path');

const cacheDir = path.resolve(__dirname, '../.cache');
const optimizedDir = path.resolve(__dirname, '../public/assets/optimized');

fs.rmSync(cacheDir, { recursive: true, force: true });
fs.rmSync(optimizedDir, { recursive: true, force: true });
fs.mkdirSync(optimizedDir, { recursive: true });

console.log('Cleaned cache and recreated public/assets/optimized');
