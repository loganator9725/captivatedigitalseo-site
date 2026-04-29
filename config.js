require('dotenv').config();

const { URL } = require('url');

const { loadPages } = require('./scripts/lib/contentLoader');

const siteUrl = process.env.SITE_URL || 'https://example.com';
const siteName = process.env.SITE_NAME || 'Example Publishing Studio';
const siteDescription =
  process.env.SITE_DESCRIPTION ||
  'A neutral starter for structured data, sitemap generation, and front-end performance work.';

function resolveConfiguredUrl(value, baseUrl) {
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return new URL(value.startsWith('/') ? value : `/${value}`, `${baseUrl}/`).toString();
}

function normalizePath(pagePath) {
  if (pagePath === '/') {
    return '/';
  }

  return `/${String(pagePath).replace(/^\/+|\/+$/g, '')}/`;
}

module.exports = {
  site: {
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    language: process.env.SITE_LANGUAGE || 'en',
  },
  organization: {
    legalName: process.env.ORG_LEGAL_NAME || 'Example Publishing Studio LLC',
    alternateName: process.env.ORG_ALT_NAME || 'Example Studio',
    email: process.env.ORG_EMAIL || 'hello@example.com',
    sameAs: [process.env.ORG_LINKEDIN || '', process.env.ORG_GITHUB || ''].filter(Boolean),
  },
  representative: {
    name: process.env.REPRESENTATIVE_NAME || '',
    jobTitle: process.env.REPRESENTATIVE_TITLE || '',
    pageUrl: process.env.REPRESENTATIVE_PAGE_URL || '',
    sameAs: [process.env.REPRESENTATIVE_LINKEDIN || '', process.env.REPRESENTATIVE_X || ''].filter(Boolean),
  },
  forms: {
    providerName: process.env.FORM_PROVIDER_NAME || 'Hosted Form Provider',
    providerAction: process.env.FORM_PROVIDER_ACTION || 'https://example.com/form-endpoint',
    method: process.env.FORM_PROVIDER_METHOD || 'POST',
    successRedirect: resolveConfiguredUrl(process.env.FORM_SUCCESS_REDIRECT || '/contact/success/', siteUrl),
    errorRedirect: resolveConfiguredUrl(process.env.FORM_ERROR_REDIRECT || '/contact/error/', siteUrl),
    successFieldName: process.env.FORM_SUCCESS_FIELD || '_next',
    errorFieldName: process.env.FORM_ERROR_FIELD || '_error',
    embedUrl: process.env.FORM_EMBED_URL || '',
    embedScriptUrl: process.env.FORM_EMBED_SCRIPT_URL || '',
    embedIframeId: process.env.FORM_EMBED_IFRAME_ID || '',
    embedFormId: process.env.FORM_EMBED_FORM_ID || '',
    embedFormName: process.env.FORM_EMBED_FORM_NAME || '',
  },
  pages: loadPages().map((page) => ({
    ...page,
    path: normalizePath(page.path),
  })),
};
