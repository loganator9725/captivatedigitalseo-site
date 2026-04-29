const fs = require('fs');
const path = require('path');
const config = require('../config');
const renderPage = require('../templates/page');

const publicDir = path.resolve(__dirname, '../public');
const reservedDirectories = new Set(['assets', 'js', 'styles']);

function getOutputPath(pagePath) {
  if (pagePath === '/') {
    return path.join(publicDir, 'index.html');
  }

  return path.join(publicDir, pagePath.slice(1), 'index.html');
}

function cleanGeneratedPages() {
  if (!fs.existsSync(publicDir)) {
    return;
  }

  for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
    const fullPath = path.join(publicDir, entry.name);

    if (entry.isDirectory() && !reservedDirectories.has(entry.name)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      fs.rmSync(fullPath, { force: true });
    }
  }
}

function buildPages() {
  cleanGeneratedPages();

  for (const page of config.pages) {
    const outputPath = getOutputPath(page.path);
    const html = renderPage({
      page,
      pages: config.pages,
      site: config.site,
      forms: config.forms,
    });

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log(`Generated page: public/${path.relative(publicDir, outputPath).replace(/\\/g, '/')}`);
  }
}

buildPages();