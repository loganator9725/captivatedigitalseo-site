const renderHead = require('./partials/head');
const renderHeader = require('./partials/header');
const renderFooter = require('./partials/footer');
const renderMarkdownBlock = require('./partials/markdownBlock');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSections(sections) {
  return sections
    .map(
      (section) => `
        <article class="section-card">
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </article>`
    )
    .join('');
}

function renderExploreCards(currentPage, pages) {
  return pages
    .filter((candidate) => candidate.path !== currentPage.path && candidate.includeInNav !== false)
    .map(
      (candidate) => `
        <a class="explore-card" href="${candidate.path}">
          <p class="explore-card__label">${escapeHtml(candidate.navLabel)}</p>
          <h3>${escapeHtml(candidate.title)}</h3>
          <p>${escapeHtml(candidate.description)}</p>
        </a>`
    )
    .join('');
}

module.exports = function renderStandard({ page, pages, site }) {
  const canonicalUrl = `${site.url}${page.path}`;
  const routeLabel = page.path === '/' ? 'root' : page.path;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(site.language)}">
${renderHead({ page, canonicalUrl })}
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="site-shell">
    ${renderHeader({ page, pages, site })}
    <main id="main-content">
      <section class="hero">
        <div class="hero__content">
          <ul class="hero__meta" aria-label="Page metadata">
            <li><span>Route</span><strong>${escapeHtml(routeLabel)}</strong></li>
            <li><span>Cadence</span><strong>${escapeHtml(page.changefreq)}</strong></li>
            <li><span>Priority</span><strong>${escapeHtml(page.priority)}</strong></li>
          </ul>
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.headline)}</h1>
          <p class="lede">${escapeHtml(page.intro)}</p>
          <div class="hero__actions">
            ${page.primaryCta ? `<a class="cta" href="${escapeHtml(page.primaryCta.href)}">${escapeHtml(page.primaryCta.label)}</a>` : ''}
            <a class="cta cta--ghost" href="/faq/">Review FAQ</a>
          </div>
          ${page.interactiveWidget ? '<button id="run-worker" class="cta cta--secondary" type="button">Run Background Calculation</button><p id="worker-status" class="status" aria-live="polite">Worker idle.</p>' : ''}
        </div>
        <div class="hero__media">
          <img src="/assets/optimized/sample-banner.webp" alt="${escapeHtml(page.heroImageAlt)}" width="1200" height="675">
          <aside class="route-panel">
            <p class="route-panel__eyebrow">Governance Snapshot</p>
            <dl>
              <div><dt>Path</dt><dd>${escapeHtml(routeLabel)}</dd></div>
              <div><dt>Update cadence</dt><dd>${escapeHtml(page.changefreq)}</dd></div>
              <div><dt>Priority</dt><dd>${escapeHtml(page.priority)}</dd></div>
              <div><dt>Pages in system</dt><dd>${escapeHtml(String(pages.length))}</dd></div>
            </dl>
            <p class="route-panel__note">Shared navigation, schema, sitemap, and packaging are all derived from the same route definition.</p>
          </aside>
        </div>
      </section>
      ${renderMarkdownBlock(page.markdownHtml)}
      <section class="section-grid">${renderSections(page.sections)}</section>
      <section class="explore-section">
        <div class="explore-section__header">
          <p class="eyebrow">Explore More</p>
          <h2>Each route shares one system, while retaining its own content, metadata, and operational priority.</h2>
        </div>
        <div class="explore-grid">${renderExploreCards(page, pages)}</div>
      </section>
    </main>
    ${renderFooter({ site })}
  </div>
  <script src="/js/main.js"></script>
</body>
</html>`;
};
