function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = function renderFooter({ site }) {
  return `<footer class="site-footer">
      <p>${escapeHtml(site.description)}</p>
      <p>${escapeHtml(site.url)}</p>
    </footer>`;
};
