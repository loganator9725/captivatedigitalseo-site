const fs = require('fs');
const path = require('path');

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

async function injectCriticalCss() {
  const publicDir = path.resolve(__dirname, '../public');
  const critical = await import('critical');
  const htmlFiles = collectHtmlFiles(publicDir);

  for (const htmlFile of htmlFiles) {
    const relativePath = path.relative(publicDir, htmlFile);

    await critical.generate({
      base: publicDir,
      src: relativePath,
      target: {
        html: htmlFile,
      },
      inline: true,
      width: 1300,
      height: 900,
    });

    console.log(`Critical CSS injected into public/${relativePath.replace(/\\/g, '/')}`);
  }
}

injectCriticalCss().catch((error) => {
  console.error('Critical CSS generation failed.');
  console.error(error);
  process.exitCode = 1;
});
