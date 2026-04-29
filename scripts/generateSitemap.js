const fs = require('fs');
const path = require('path');
const config = require('../config');

const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
const generatedAt = new Date().toISOString();

const urls = config.pages
  .map((page) => {
    const location = `${config.site.url}${page.path}`;

    return [
      '  <url>',
      `    <loc>${location}</loc>`,
      `    <lastmod>${generatedAt}</lastmod>`,
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority}</priority>`,
      '  </url>',
    ].join('\n');
  })
  .join('\n');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls,
  '</urlset>',
].join('\n');

fs.writeFileSync(sitemapPath, xml);
console.log('Generated public/sitemap.xml');
