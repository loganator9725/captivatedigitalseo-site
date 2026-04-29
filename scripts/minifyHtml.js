const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

function collectHtmlFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      return collectHtmlFiles(fullPath);
    }

    return entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

async function minifyHtml() {
  const publicDir = path.resolve(__dirname, '../public');
  const htmlFiles = collectHtmlFiles(publicDir);

  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    const minified = await minify(html, {
      collapseWhitespace: true,
      keepClosingSlash: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      removeRedundantAttributes: true,
    });

    fs.writeFileSync(htmlFile, minified);
    console.log(`Minified: public/${path.relative(publicDir, htmlFile).replace(/\\/g, '/')}`);
  }
}

minifyHtml().catch((error) => {
  console.error('HTML minification failed.');
  console.error(error);
  process.exitCode = 1;
});
