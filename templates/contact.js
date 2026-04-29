const renderHead = require('./partials/head');
const renderHeader = require('./partials/header');
const renderFooter = require('./partials/footer');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = function renderContact({ page, pages, site, forms }) {
  const canonicalUrl = `${site.url}${page.path}`;
  const usesEmbeddedForm = Boolean(forms.embedUrl && forms.embedScriptUrl);
  const redirectFields = [
    forms.successRedirect
      ? `<input type="hidden" name="${escapeHtml(forms.successFieldName)}" value="${escapeHtml(forms.successRedirect)}">`
      : '',
    forms.errorRedirect
      ? `<input type="hidden" name="${escapeHtml(forms.errorFieldName)}" value="${escapeHtml(forms.errorRedirect)}">`
      : '',
  ]
    .filter(Boolean)
    .join('');
  const embeddedForm = usesEmbeddedForm
    ? `<div class="ghl-embed-shell">
          <iframe
            src="${escapeHtml(forms.embedUrl)}"
            style="width:100%;height:100%;border:none;border-radius:3px"
            id="${escapeHtml(forms.embedIframeId || 'embedded-form')}"
            class="ghl-form-embed"
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="${escapeHtml(forms.embedFormName || page.form.heading)}"
            data-height="undefined"
            data-layout-iframe-id="${escapeHtml(forms.embedIframeId || 'embedded-form')}"
            data-form-id="${escapeHtml(forms.embedFormId || '')}"
            title="${escapeHtml(forms.embedFormName || page.form.heading)}">
          </iframe>
        </div>
        <script src="${escapeHtml(forms.embedScriptUrl)}"></script>`
    : '';
  const nativeForm = `<form class="contact-form" action="${escapeHtml(forms.providerAction)}" method="${escapeHtml(forms.method)}">
            ${redirectFields}
            <label><span>Name</span><input type="text" name="name" required></label>
            <label><span>Email</span><input type="email" name="email" required></label>
            <label><span>Company</span><input type="text" name="company"></label>
            <label><span>Message</span><textarea name="message" rows="6" required></textarea></label>
            <input type="hidden" name="_subject" value="Website inquiry">
            <button class="cta" type="submit">${escapeHtml(page.form.submitLabel)}</button>
          </form>`;

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
        </div>
        <div class="route-panel">
          <p class="route-panel__eyebrow">Form Provider</p>
          <p class="route-panel__note">Configured to route inquiries through a hosted CRM form while keeping success and error handling on first-party pages.</p>
          <dl>
            <div><dt>Provider</dt><dd>${escapeHtml(forms.providerName)}</dd></div>
            <div><dt>Mode</dt><dd>${usesEmbeddedForm ? 'Embedded iframe' : escapeHtml(forms.method)}</dd></div>
            <div><dt>Endpoint</dt><dd>${escapeHtml(usesEmbeddedForm ? forms.embedUrl : forms.providerAction)}</dd></div>
            ${forms.embedScriptUrl ? `<div><dt>Embed script</dt><dd>${escapeHtml(forms.embedScriptUrl)}</dd></div>` : ''}
            <div><dt>Success redirect</dt><dd>${escapeHtml(forms.successRedirect)}</dd></div>
            <div><dt>Error redirect</dt><dd>${escapeHtml(forms.errorRedirect)}</dd></div>
          </dl>
        </div>
      </section>
      <section class="form-layout">
        <article class="form-card">
          <p class="eyebrow">Contact Form</p>
          <h2>${escapeHtml(page.form.heading)}</h2>
          <p>${escapeHtml(page.form.description)}</p>
          ${usesEmbeddedForm ? embeddedForm : nativeForm}
          <p class="status">${escapeHtml(page.form.successMessage)}</p>
        </article>
        <aside class="section-card">
          <h2>Integration Notes</h2>
          <p>The contact route now accepts either a traditional hosted endpoint or an embedded CRM widget, both controlled through environment-driven provider settings.</p>
          <ul class="feature-list">
            <li>CRM embed support without custom backend work</li>
            <li>First-party success and error routes remain in place</li>
            <li>Environment-controlled provider endpoint and script</li>
          </ul>
        </aside>
      </section>
      <section class="section-grid">${page.sections
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