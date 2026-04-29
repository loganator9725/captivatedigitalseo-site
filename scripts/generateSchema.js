const fs = require('fs');
const path = require('path');
const config = require('../config');

const publicDir = path.resolve(__dirname, '../public');
const schemaPath = path.resolve(__dirname, '../public/schema.json');

function getHtmlPath(pagePath) {
  if (pagePath === '/') {
    return path.join(publicDir, 'index.html');
  }

  return path.join(publicDir, pagePath.slice(1), 'index.html');
}

const organizationSchema = {
  '@type': 'Organization',
  '@id': `${config.site.url}/#organization`,
  name: config.organization.legalName,
  alternateName: config.organization.alternateName,
  url: config.site.url,
  description: config.site.description,
  email: config.organization.email,
  sameAs: config.organization.sameAs,
};

const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${config.site.url}/#website`,
  url: config.site.url,
  name: config.site.name,
  description: config.site.description,
  inLanguage: config.site.language,
  publisher: {
    '@id': `${config.site.url}/#organization`,
  },
};

const pageGraph = config.pages.map((page) => ({
  '@type': 'WebPage',
  '@id': `${config.site.url}${page.path}#webpage`,
  url: `${config.site.url}${page.path}`,
  name: page.title,
  description: page.description,
  isPartOf: {
    '@id': `${config.site.url}/#website`,
  },
  about: {
    '@id': `${config.site.url}/#organization`,
  },
}));

for (const page of config.pages) {
  const htmlPath = getHtmlPath(page.path);
  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, websiteSchema, pageGraph.find((entry) => entry.url === `${config.site.url}${page.path}`)],
  };
  const schemaMarkup = `<script id="site-schema" type="application/ld+json">${JSON.stringify(pageSchema)}</script>`;
  const existingHtml = fs.readFileSync(htmlPath, 'utf8');
  const withoutExistingSchema = existingHtml.replace(
    /<script id="site-schema" type="application\/ld\+json">[\s\S]*?<\/script>/,
    ''
  );
  const updatedHtml = withoutExistingSchema.replace('</head>', `${schemaMarkup}</head>`);

  fs.writeFileSync(htmlPath, updatedHtml);
}

fs.writeFileSync(
  schemaPath,
  JSON.stringify({ '@context': 'https://schema.org', '@graph': [organizationSchema, websiteSchema, ...pageGraph] }, null, 2)
);

console.log('Generated schema and injected it into all public HTML pages');
