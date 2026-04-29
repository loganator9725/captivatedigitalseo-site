const renderStandard = require('./standard');
const renderArticle = require('./article');
const renderContact = require('./contact');
const renderResource = require('./resource');
const renderCaseStudy = require('./caseStudy');

const renderers = {
  standard: renderStandard,
  article: renderArticle,
  contact: renderContact,
  resource: renderResource,
  'case-study': renderCaseStudy,
};

module.exports = function renderPage(context) {
  const renderer = renderers[context.page.template] || renderStandard;
  return renderer(context);
};