const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const config = require('../config');

const publicDir = path.resolve(__dirname, '../public');
const distDir = path.resolve(__dirname, '../dist');

fs.mkdirSync(distDir, { recursive: true });
fs.cpSync(publicDir, distDir, { recursive: true });

const domain = new URL(config.site.url).hostname;
if (domain) {
	fs.writeFileSync(path.join(distDir, 'CNAME'), `${domain}\n`);
}

console.log('Copied public/ to dist/');
