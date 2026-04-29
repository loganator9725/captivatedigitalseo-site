module.exports = function renderMarkdownBlock(markdownHtml) {
  if (!markdownHtml) {
    return '';
  }

  return `<section class="markdown-block rich-text">${markdownHtml}</section>`;
};
