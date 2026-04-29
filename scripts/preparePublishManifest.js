const fs = require('fs');
const path = require('path');
const config = require('../config');

const manifestPath = path.resolve(__dirname, '../public/publish-manifest.json');

const pageArtifacts = config.pages.map((page) =>
  page.path === '/' ? 'index.html' : `${page.path.slice(1)}index.html`
);

const manifest = {
  generatedAt: new Date().toISOString(),
  site: {
    name: config.site.name,
    url: config.site.url,
  },
  artifacts: [...pageArtifacts, 'schema.json', 'sitemap.xml', 'robots.txt', 'assets/optimized/sample-banner.webp'],
  pages: config.pages.map((page) => ({
    path: page.path,
    title: page.title,
    description: page.description,
  })),
  notes: [
    'This manifest is for local publishing verification only.',
    'Replace placeholder organization details in config.js before deployment.',
  ],
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('Generated public/publish-manifest.json');
