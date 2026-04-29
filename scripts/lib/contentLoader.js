const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const pagesPath = path.resolve(__dirname, '../../content/pages.json');
const markdownDir = path.resolve(__dirname, '../../content/markdown');

function loadMarkdown(markdownSource) {
  if (!markdownSource) {
    return '';
  }

  const markdownPath = path.join(markdownDir, markdownSource);
  const markdown = fs.readFileSync(markdownPath, 'utf8');
  return marked.parse(markdown);
}

function loadPages() {
  const contentPages = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));

  return contentPages.map((page) => ({
    template: 'standard',
    ...page,
    markdownHtml: loadMarkdown(page.markdownSource),
  }));
}

module.exports = {
  loadPages,
};
