const workerStatus = document.getElementById('worker-status');
const workerButton = document.getElementById('run-worker');

function trackEvent(eventName, detail) {
  const payload = {
    event: eventName,
    ...detail,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new window.CustomEvent('site:analytics', { detail: payload }));
}

const conversionRoutes = {
  '/contact/success/': {
    event: 'contact_submission_success',
    category: 'conversion',
    label: 'Hosted form success redirect',
  },
  '/contact/error/': {
    event: 'contact_submission_error',
    category: 'conversion',
    label: 'Hosted form error redirect',
  },
};

const conversionRoute = conversionRoutes[window.location.pathname];
if (conversionRoute) {
  trackEvent(conversionRoute.event, {
    category: conversionRoute.category,
    label: conversionRoute.label,
    path: window.location.pathname,
  });
}

const contactForm = document.querySelector('form.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', () => {
    trackEvent('contact_form_submit', {
      category: 'conversion',
      label: 'Hosted form submit',
      action: contactForm.getAttribute('action') || '',
      path: window.location.pathname,
    });
  });
}

const embeddedContactForm = document.querySelector('iframe.ghl-form-embed');
if (embeddedContactForm) {
  embeddedContactForm.addEventListener('load', () => {
    trackEvent('contact_form_embed_loaded', {
      category: 'conversion',
      label: 'Embedded CRM form loaded',
      action: embeddedContactForm.getAttribute('src') || '',
      path: window.location.pathname,
    });
  });
}

if (window.Worker && workerStatus && workerButton) {
  const worker = new Worker('./js/sovereign-worker.js');

  worker.addEventListener('message', (event) => {
    workerStatus.textContent = `${event.data.status} Result: ${event.data.tokens}`;
  });

  workerButton.addEventListener('click', () => {
    workerStatus.textContent = 'Worker processing...';
    worker.postMessage({ type: 'CALCULATE_CLARITY', amount: 57 });
  });
}
