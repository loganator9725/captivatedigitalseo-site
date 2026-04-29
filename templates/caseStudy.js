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

function renderMetrics(metrics) {
  return metrics
    .map(
      (metric) => `<li><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong></li>`
    )
    .join('');
}

function renderPhases(phases) {
  return phases
    .map(
      (phase) => `<article class="timeline-card"><p class="eyebrow">Phase</p><h2>${escapeHtml(phase.title)}</h2><p>${escapeHtml(
        phase.body
      )}</p></article>`
    )
    .join('');
}

module.exports = function renderCaseStudy({ page, pages, site }) {
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
            <a class="cta cta--ghost" href="/resources/">Read Operational Resources</a>
          </div>
        </div>
        <aside class="route-panel case-study-aside">
          <p class="route-panel__eyebrow">Engagement Snapshot</p>
          <dl>
            <div><dt>Client</dt><dd>${escapeHtml(page.caseStudy.client)}</dd></div>
            <div><dt>Engagement</dt><dd>${escapeHtml(page.caseStudy.engagement)}</dd></div>
            <div><dt>Sector</dt><dd>${escapeHtml(page.caseStudy.sector || 'Publishing')}</dd></div>
          </dl>
          <ul class="metric-strip">${renderMetrics(page.metrics || [])}</ul>
        </aside>
      </section>
      ${renderMarkdownBlock(page.markdownHtml)}
      <section class="timeline-grid">${renderPhases(page.phases || [])}</section>
      <section class="quote-panel">
        <p class="eyebrow">Client Perspective</p>
        <blockquote>${escapeHtml(page.caseStudy.quote || '')}</blockquote>
        <p class="quote-panel__attribution">${escapeHtml(page.caseStudy.quoteAttribution || '')}</p>
      </section>
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