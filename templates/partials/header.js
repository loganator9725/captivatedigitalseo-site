function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = function renderHeader({ page, pages, site }) {
  const navigation = pages
    .filter((navPage) => navPage.includeInNav !== false)
    .map(
      (navPage) => `<a href="${navPage.path}"${navPage.path === page.path ? ' aria-current="page"' : ''}>${escapeHtml(
        navPage.navLabel
      )}</a>`
    )
    .join('');

  return `<section class="site-banner">
      <p class="site-banner__label">Enterprise Static Platform</p>
      <p>${escapeHtml(site.name)} publishes ${pages.length} routes from one controlled build system.</p>
    </section>
    <header class="site-header">
      <div class="brand-lockup">
        <span class="brand-mark" aria-hidden="true">ES</span>
        <div>
          <p class="brand">${escapeHtml(site.name)}</p>
          <p class="brand-subtitle">Structured pages, governed metadata, deploy-ready output.</p>
        </div>
      </div>
      <nav class="site-nav" aria-label="Primary">${navigation}</nav>
    </header>`;
};
