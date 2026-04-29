const fs = require('fs');
const path = require('path');

const defaultPagesPath = path.resolve(__dirname, '../content/pages.json');
const defaultMarkdownDir = path.resolve(__dirname, '../content/markdown');
const allowedTemplates = new Set(['standard', 'article', 'contact', 'resource', 'case-study']);
const allowedChangefreq = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidPath(value) {
  return value === '/' || (isNonEmptyString(value) && value.startsWith('/') && value.endsWith('/'));
}

function validateSections(page, errors) {
  if (!Array.isArray(page.sections) || page.sections.length === 0) {
    errors.push(`Page ${page.path} must define at least one section.`);
    return;
  }

  for (const section of page.sections) {
    if (!isNonEmptyString(section.title) || !isNonEmptyString(section.body)) {
      errors.push(`Section entries on ${page.path} must include title and body.`);
      return;
    }
  }
}

function validatePrimaryCta(page, errors) {
  if (!page.primaryCta) {
    return;
  }

  if (!isNonEmptyString(page.primaryCta.label) || !isNonEmptyString(page.primaryCta.href)) {
    errors.push(`Primary CTA on ${page.path} must include both label and href.`);
    return;
  }

  if (!page.primaryCta.href.startsWith('/')) {
    errors.push(`Primary CTA href on ${page.path} must be a site-relative path.`);
  }
}

function validateContactForm(page, errors) {
  if (page.template !== 'contact') {
    return;
  }

  if (!page.form) {
    errors.push(`Contact template requires a form definition on ${page.path}`);
    return;
  }

  const requiredKeys = ['heading', 'description', 'submitLabel', 'successMessage'];
  for (const key of requiredKeys) {
    if (!isNonEmptyString(page.form[key])) {
      errors.push(`Contact form field '${key}' is required on ${page.path}`);
    }
  }
}

function validateResourceTemplate(page, errors) {
  if (page.template !== 'resource') {
    return;
  }

  if (!page.markdownSource) {
    errors.push(`Resource template requires markdownSource on ${page.path}`);
  }

  if (!Array.isArray(page.highlights) || page.highlights.length < 2) {
    errors.push(`Resource template requires at least two highlights on ${page.path}`);
  }

  if (!Array.isArray(page.metrics) || page.metrics.length < 2) {
    errors.push(`Resource template requires at least two metrics on ${page.path}`);
  }
}

function validateCaseStudyTemplate(page, errors) {
  if (page.template !== 'case-study') {
    return;
  }

  if (!page.markdownSource) {
    errors.push(`Case study template requires markdownSource on ${page.path}`);
  }

  if (!page.caseStudy || !isNonEmptyString(page.caseStudy.client) || !isNonEmptyString(page.caseStudy.engagement)) {
    errors.push(`Case study template requires caseStudy.client and caseStudy.engagement on ${page.path}`);
  }

  if (!Array.isArray(page.metrics) || page.metrics.length < 2) {
    errors.push(`Case study template requires at least two metrics on ${page.path}`);
  }

  if (!Array.isArray(page.phases) || page.phases.length < 2) {
    errors.push(`Case study template requires at least two phases on ${page.path}`);
  }
}

function validatePages(pages, options = {}) {
  const markdownDir = options.markdownDir || defaultMarkdownDir;
  const seenPaths = new Set();
  const seenNavLabels = new Set();
  const errors = [];

  for (const page of pages) {
    if (!isNonEmptyString(page.path) || !isNonEmptyString(page.title) || !isNonEmptyString(page.description) || !isNonEmptyString(page.navLabel)) {
      errors.push(`Page ${page.path || '<missing path>'} is missing required fields.`);
    }

    if (!isValidPath(page.path)) {
      errors.push(`Invalid path format on ${page.path || '<missing path>'}; use '/' or '/segment/'.`);
    }

    if (seenPaths.has(page.path)) {
      errors.push(`Duplicate path detected: ${page.path}`);
    }

    if (seenNavLabels.has(page.navLabel)) {
      errors.push(`Duplicate navLabel detected: ${page.navLabel}`);
    }

    seenPaths.add(page.path);
    seenNavLabels.add(page.navLabel);

    if (page.template && !allowedTemplates.has(page.template)) {
      errors.push(`Unsupported template '${page.template}' on ${page.path}`);
    }

    if (!allowedChangefreq.has(page.changefreq)) {
      errors.push(`Unsupported changefreq '${page.changefreq}' on ${page.path}`);
    }

    const priority = Number(page.priority);
    if (Number.isNaN(priority) || priority < 0 || priority > 1) {
      errors.push(`Priority on ${page.path} must be a number between 0 and 1.`);
    }

    if (page.description && page.description.length > 180) {
      errors.push(`Description is too long on ${page.path}; keep it under 180 characters.`);
    }

    if (!isNonEmptyString(page.headline) || !isNonEmptyString(page.intro) || !isNonEmptyString(page.heroImageAlt)) {
      errors.push(`Headline, intro, and heroImageAlt are required on ${page.path}.`);
    }

    validateSections(page, errors);
    validatePrimaryCta(page, errors);

    if (page.markdownSource) {
      if (!page.markdownSource.endsWith('.md')) {
        errors.push(`Markdown source on ${page.path} must use a .md file.`);
      }

      const markdownPath = path.join(markdownDir, page.markdownSource);
      if (!fs.existsSync(markdownPath)) {
        errors.push(`Markdown source not found for ${page.path}: ${page.markdownSource}`);
      }
    }

    validateContactForm(page, errors);
    validateResourceTemplate(page, errors);
    validateCaseStudyTemplate(page, errors);
  }

  if (!pages.some((page) => page.path === '/')) {
    errors.push('One page must use the root path /.');
  }

  return errors;
}

function validateFile(pagesPath = defaultPagesPath) {
  const resolvedPagesPath = path.resolve(pagesPath);
  const baseDir = path.dirname(resolvedPagesPath);
  const siblingMarkdownDir = path.resolve(baseDir, 'markdown');
  const parentMarkdownDir = path.resolve(baseDir, '../markdown');
  const pages = JSON.parse(fs.readFileSync(resolvedPagesPath, 'utf8'));
  const errors = validatePages(pages, {
    markdownDir: fs.existsSync(siblingMarkdownDir) ? siblingMarkdownDir : parentMarkdownDir,
  });

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`Validation error: ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${pages.length} pages successfully.`);
}

if (require.main === module) {
  validateFile(process.argv[2] || defaultPagesPath);
}

module.exports = {
  validateFile,
  validatePages,
};