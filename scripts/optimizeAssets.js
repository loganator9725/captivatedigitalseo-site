const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.resolve(__dirname, '../assets/raw');
const outputDir = path.resolve(__dirname, '../public/assets/optimized');

async function optimizeAssets() {
  fs.mkdirSync(outputDir, { recursive: true });

  if (!fs.existsSync(inputDir)) {
    console.log(`Skipped: input directory not found at ${inputDir}`);
    return;
  }

  const files = fs
    .readdirSync(inputDir)
    .filter((file) => fs.statSync(path.join(inputDir, file)).isFile());

  if (files.length === 0) {
    console.log('Skipped: no raw assets found to optimize.');
    return;
  }

  await Promise.all(
    files.map(async (file) => {
      const sourcePath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);

      await sharp(sourcePath)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`Optimized: ${file} -> ${path.basename(outputPath)}`);
    })
  );
}

optimizeAssets().catch((error) => {
  console.error('Asset optimization failed.');
  console.error(error);
  process.exitCode = 1;
});
