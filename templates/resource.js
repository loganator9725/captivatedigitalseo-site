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

function renderHighlights(highlights) {
  return highlights
    .map(
      (highlight) => `<article class="section-card"><p class="eyebrow">Highlight</p><h2>${escapeHtml(
        highlight.title
      )}</h2><p>${escapeHtml(highlight.body)}</p></article>`
    )
    .join('');
}

function renderMetrics(metrics) {
  return metrics
    .map(
      (metric) => `<li><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong></li>`
    )
    .join('');
}

module.exports = function renderResource({ page, pages, site }) {
  const canonicalUrl = `${site.url}${page.path}`;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(site.language)}">
${renderHead({ page, canonicalUrl })}
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="site-shell">
    ${renderHeader({ page, pages, site })}
    <main id="main-content">
      <section class="hero hero--compact">
        <div class="hero__content">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.headline)}</h1>
          <p class="lede">${escapeHtml(page.intro)}</p>
          <div class="hero__actions">
            ${page.primaryCta ? `<a class="cta" href="${escapeHtml(page.primaryCta.href)}">${escapeHtml(page.primaryCta.label)}</a>` : ''}
            <a class="cta cta--ghost" href="/contact/">Talk Through Deployment</a>
          </div>
        </div>
        <aside class="route-panel resource-aside">
          <p class="route-panel__eyebrow">Resource Snapshot</p>
          <p class="route-panel__note">This template is optimized for long-form operational guidance paired with a compact metrics strip and structured highlights.</p>
          <ul class="metric-strip">${renderMetrics(page.metrics || [])}</ul>
        </aside>
      </section>
      ${renderMarkdownBlock(page.markdownHtml)}
      <section class="highlight-grid">${renderHighlights(page.highlights || [])}</section>
      <section class="section-grid">${(page.sections || [])
        .map(
          (section) => `<article class="section-card"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></article>`
        )
        .join('')}</section>
    </main>
    ${renderFooter({ site })}
  </div>
  <script src="/js/main.js"></script>
</body>
</html>`;
};