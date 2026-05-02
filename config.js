require('dotenv').config();

const { URL } = require('url');

const { loadPages } = require('./scripts/lib/contentLoader');

const siteUrl = process.env.SITE_URL || 'https://darnelldisroe.com';
const siteName = process.env.SITE_NAME || 'Darnell Disroe';
const siteDescription =
  process.env.SITE_DESCRIPTION ||
  'Official site for Darnell Disroe with structured publishing, SEO metadata, and lead-generation workflows.';

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
    legalName: process.env.ORG_LEGAL_NAME || 'Darnell Disroe LLC',
    alternateName: process.env.ORG_ALT_NAME || 'Darnell Disroe',
    email: process.env.ORG_EMAIL || 'hello@darnelldisroe.com',
    sameAs: [process.env.ORG_LINKEDIN || '', process.env.ORG_GITHUB || ''].filter(Boolean),
  },
  representative: {
    name: process.env.REPRESENTATIVE_NAME || 'Darnell Disroe',
    jobTitle: process.env.REPRESENTATIVE_TITLE || 'Founder',
    pageUrl: process.env.REPRESENTATIVE_PAGE_URL || 'https://darnelldisroe.com/about/',
    sameAs: [process.env.REPRESENTATIVE_LINKEDIN || '', process.env.REPRESENTATIVE_X || ''].filter(Boolean),
  },
  forms: {
    providerName: process.env.FORM_PROVIDER_NAME || 'Hosted Form Provider',
    providerAction: process.env.FORM_PROVIDER_ACTION || 'https://darnelldisroe.com/form-endpoint',
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
