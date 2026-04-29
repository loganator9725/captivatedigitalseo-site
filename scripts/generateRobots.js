const fs = require('fs');
const path = require('path');
const config = require('../config');

const robotsPath = path.resolve(__dirname, '../public/robots.txt');
const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${config.site.url}/sitemap.xml`,
].join('\n');

fs.writeFileSync(robotsPath, robots);
console.log('Generated public/robots.txt');
